import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bmcqjdbxbeiqksctllzh.supabase.co';
const supabaseKey = 'sb_publishable_ISxfdtu2F1IZbWQBA9CeBQ_AAJQhQhw';

export const supabase = createClient(supabaseUrl, supabaseKey);