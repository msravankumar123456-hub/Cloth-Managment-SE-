import { createClient, type User } from 'https://esm.sh/@supabase/supabase-js@2';

const DEFAULT_MEMBERS = [
  { email: 'sravankumar@gmail.com', full_name: 'Sravankumar' },
  { email: 'rohithareddy@gmail.com', full_name: 'Rohitha Reddy' },
  { email: 'saisekth@gmail.com', full_name: 'Sai Sekth' },
  { email: 'saimaikanta@gmail.com', full_name: 'Sai Maikanta' },
  { email: 'rajesh@gmail.com', full_name: 'Rajesh' },
];

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const findAuthUser = async (
  adminClient: ReturnType<typeof createClient>,
  email: string,
): Promise<User | null> => {
  const perPage = 100;
  for (let page = 1; ; page += 1) {
    const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const match = data.users.find((candidate) =>
      candidate.email && normalizeEmail(candidate.email) === email
    );
    if (match) return match;
    if (data.users.length < perPage) return null;
  }
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const envInitialPassword = Deno.env.get('FACTORY_INITIAL_PASSWORD');
  const adminSecret = Deno.env.get('ADMIN_SETUP_SECRET');
  const allowedAdminEmails = (Deno.env.get('FACTORY_ADMIN_EMAILS') ?? '')
    .split(',')
    .map(normalizeEmail)
    .filter(Boolean);

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ error: 'Supabase server configuration is missing.' }, 500);
  }

  // Parse request body if provided
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const initialPassword = body.password || envInitialPassword;
  if (!initialPassword || initialPassword.length < 8) {
    return jsonResponse({
      error: 'Initial password must be set via FACTORY_INITIAL_PASSWORD secret or request body (min 8 characters).'
    }, 400);
  }

  // Authorization check: Admin secret header, Bearer service_role key, or authenticated admin JWT
  const authHeader = req.headers.get('Authorization');
  const adminKeyHeader = req.headers.get('x-admin-key');
  let isAuthorized = false;

  if (adminSecret && adminKeyHeader === adminSecret) {
    isAuthorized = true;
  } else if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice('Bearer '.length).trim();
    if (token === serviceRoleKey) {
      isAuthorized = true;
    } else if (anonKey) {
      const userClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: `Bearer ${token}` } },
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      });
      const { data: userData } = await userClient.auth.getUser();
      if (userData?.user) {
        const caller = userData.user;
        const callerEmail = caller.email ? normalizeEmail(caller.email) : '';
        if (
          caller.app_metadata?.role === 'admin' ||
          (callerEmail && allowedAdminEmails.includes(callerEmail))
        ) {
          isAuthorized = true;
        }
      }
    }
  }

  if (!isAuthorized) {
    return jsonResponse({ error: 'Unauthorized: Admin authorization required.' }, 401);
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  const membersToProcess = Array.isArray(body.members) && body.members.length > 0
    ? body.members
    : DEFAULT_MEMBERS;

  const results: Array<{ email: string; status: 'created' | 'linked' | 'failed'; error?: string }> = [];

  for (const member of membersToProcess) {
    const email = normalizeEmail(member.email);
    const fullName = member.full_name || member.name || email.split('@')[0];

    try {
      let authUser = await findAuthUser(adminClient, email);

      if (!authUser) {
        const { data, error } = await adminClient.auth.admin.createUser({
          email,
          password: initialPassword,
          email_confirm: true,
          user_metadata: {
            full_name: fullName,
            role: 'factory_member',
            password_reset_required: true,
          },
        });

        if (error || !data.user) throw error ?? new Error('Auth user creation failed.');
        authUser = data.user;
      }

      const { data: profileByEmail, error: lookupError } = await adminClient
        .from('factory_members')
        .select('id, is_active')
        .eq('email', email)
        .maybeSingle();

      if (lookupError) throw lookupError;

      if (profileByEmail) {
        const { error: updateError } = await adminClient
          .from('factory_members')
          .update({ full_name: fullName, role: 'factory_member', is_active: true })
          .eq('id', authUser.id);
        if (updateError) throw updateError;

        results.push({ email, status: 'linked' });
      } else {
        const { error: insertError } = await adminClient.from('factory_members').insert({
          id: authUser.id,
          email,
          full_name: fullName,
          role: 'factory_member',
          is_active: true,
        });
        if (insertError) throw insertError;

        results.push({ email, status: 'created' });
      }
    } catch (error) {
      results.push({
        email,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unexpected account setup error.',
      });
    }
  }

  const failed = results.filter((r) => r.status === 'failed').length;
  return jsonResponse({
    success: failed === 0,
    results,
    rerunSafe: true,
    note: 'Factory member auth users & profile links synchronized successfully.',
  }, failed === 0 ? 200 : 207);
});
