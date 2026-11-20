import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  Product, 
  CartItem, 
  Order, 
  OrderStatus, 
  Retailer, 
  Invoice, 
  ClothingCategory,
  SizeBreakdown,
  Enquiry,
  AuthUser,
  AuthView,
  AuthMode,
  RetailerCredentials,
  RetailerRegisterData,
  FactoryCredentials
} from '../types';
import { 
  supabase, 
  isSupabaseConfigured,
  mapDbProductToApp, 
  mapAppProductToDb,
  mapDbOrderToApp, 
  mapDbInvoiceToApp,
  mapDbSupplierToApp,
  mapDbFabricInventoryToApp,
  mapDbProductionRunToApp,
  mapDbSizeChartToApp,
  mapDbShippingZoneToApp,
  mapDbPaymentToApp
} from '../lib/supabase';

export type AppView = 'landing' | 'retailer-auth' | 'factory-auth' | 'retailer' | 'factory';

interface AppContextType {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  authView: AuthView;
  setAuthView: (view: AuthView) => void;
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
  registerRetailer: (data: RetailerRegisterData) => Promise<{ success: boolean; message?: string }>;
  loginRetailer: (credentials: RetailerCredentials) => Promise<boolean>;
  loginFactory: (credentials: FactoryCredentials) => Promise<boolean>;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  setAuthMode: (mode: AuthMode) => void;
  authMode: AuthMode;
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  updateStock: (productId: string, size: keyof SizeBreakdown, quantity: number) => Promise<void>;
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  updateCartSizes: (itemId: string, sizes: SizeBreakdown) => void;
  clearCart: () => void;
  orders: Order[];
  placeOrder: (orderInfo: {
    retailerName: string;
    retailerStore: string;
    retailerCity: string;
    retailerPhone: string;
    paymentMethod: 'UPI' | 'NEFT / RTGS' | 'Factory Credit (15 Days)';
  }) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  retailers: Retailer[];
  invoices: Invoice[];
  activeFilter: ClothingCategory | 'All';
  setActiveFilter: (cat: ClothingCategory | 'All') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  toast: { message: string; type: 'success' | 'info' | 'error' } | null;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  selectedProductForDetail: Product | null;
  setSelectedProductForDetail: (p: Product | null) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  trackingOrder: Order | null;
  setTrackingOrder: (order: Order | null) => void;
  activeInvoice: Invoice | null;
  setActiveInvoice: (inv: Invoice | null) => void;
  enquiries: Enquiry[];
  submitEnquiry: (enquiry: Omit<Enquiry, 'id' | 'submittedAt'>) => Promise<void>;
  isDatabaseConnected: boolean;
  supabaseUrl: string;
  isLoading: boolean;
  databaseError: string | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Clean up any legacy localStorage mock state keys
const cleanLegacyStorage = () => {
  try {
    localStorage.removeItem('tb_accounts');
    localStorage.removeItem('tb_products');
    localStorage.removeItem('tb_orders');
    localStorage.removeItem('tb_invoices');
    localStorage.removeItem('tb_retailers');
    localStorage.removeItem('tb_current_user');
  } catch {
    // Ignore storage errors in restricted contexts
  }
};

const readCart = (): CartItem[] => {
  try {
    const saved = localStorage.getItem('tb_cart');
    return saved ? (JSON.parse(saved) as CartItem[]) : [];
  } catch {
    return [];
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    cleanLegacyStorage();
  }, []);

  // Navigation View
  const [currentView, setCurrentViewRaw] = useState<AppView>('landing');

  const setCurrentView = (view: AppView) => {
    setCurrentViewRaw(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Authentication View & State
  const [authView, setAuthView] = useState<AuthView>(null);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const isAuthenticated = Boolean(currentUser);

  // Data Collections (Source of truth: Supabase database)
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);

  // Cart (Local user preference)
  const [cart, setCart] = useState<CartItem[]>(() => readCart());

  // Connection & Loading States
  const [isDatabaseConnected, setIsDatabaseConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [databaseError, setDatabaseError] = useState<string | null>(null);
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bmcqjdbxbeiqksctllzh.supabase.co';

  // UI States
  const [activeFilter, setActiveFilter] = useState<ClothingCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Save Cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tb_cart', JSON.stringify(cart));
    } catch {
      // Ignore
    }
  }, [cart]);

  // Sync Supabase Auth Session on mount
  useEffect(() => {
    const client = supabase;
    if (!client) return;

    const restoreUser = async (userObj: any) => {
      if (!userObj) {
        setCurrentUser(null);
        return;
      }

      const role = userObj.user_metadata?.role || 'retailer';
      if (role === 'factory' || role === 'factory_member') {
        const { data: profile } = await client
          .from('factory_members')
          .select('*')
          .eq('id', userObj.id)
          .maybeSingle();

        if (profile && profile.is_active) {
          setCurrentUser({
            id: profile.id,
            name: profile.full_name || userObj.email?.split('@')[0] || 'Factory Member',
            email: profile.email || userObj.email || '',
            phone: '',
            place: '',
            pincode: '',
            passwordHash: '',
            role: 'factory',
            authenticatedAt: new Date().toISOString(),
          });
        } else {
          setCurrentUser(null);
        }
      } else {
        const { data: profile } = await client
          .from('retailers')
          .select('*')
          .eq('id', userObj.id)
          .maybeSingle();

        if (!profile) {
          setCurrentUser(null);
          return;
        }

        setCurrentUser({
          id: userObj.id,
          name: profile?.name || profile?.first_name || userObj.user_metadata?.name || userObj.user_metadata?.firstName || userObj.email?.split('@')[0] || 'Retailer',
          email: userObj.email || '',
          phone: profile?.phone || userObj.user_metadata?.phone || '',
          place: profile?.city || profile?.place || '',
          pincode: profile?.pincode || '',
          passwordHash: '',
          role: 'retailer',
          authenticatedAt: new Date().toISOString(),
        });
      }
    };

    client.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        restoreUser(session.user);
      }
    });

    const { data: { subscription } } = client.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setCurrentUser(null);
      } else if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
        restoreUser(session.user);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Load Products, Orders, Invoices, Retailers from Supabase
  const loadDatabaseData = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured) {
      setDatabaseError('Supabase configuration missing or invalid.');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setDatabaseError(null);

      // 1. Products (Always readable)
      const { data: productsData, error: prodErr } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: true });

      if (prodErr) throw prodErr;
      if (productsData) {
        setProducts(productsData.map(mapDbProductToApp));
      }

      // 2. Orders & Invoices (Protected by RLS)
      if (currentUser) {
        let orderQuery = supabase.from('orders').select('*').order('created_at', { ascending: false });
        let invoiceQuery = supabase.from('invoices').select('*').order('created_at', { ascending: false });
        let retailerQuery = supabase.from('retailers').select('*');

        if (currentUser.role === 'retailer') {
          orderQuery = orderQuery.or(`retailer_id.eq.${currentUser.id},user_id.eq.${currentUser.id}`);
          invoiceQuery = invoiceQuery.or(`retailer_id.eq.${currentUser.id},user_id.eq.${currentUser.id}`);
          retailerQuery = retailerQuery.eq('id', currentUser.id);
        }

        const [orderRes, invRes, retRes] = await Promise.all([
          orderQuery,
          invoiceQuery,
          retailerQuery,
        ]);

        if (orderRes.data) setOrders(orderRes.data.map(mapDbOrderToApp));
        if (invRes.data) setInvoices(invRes.data.map(mapDbInvoiceToApp));
        if (retRes.data) {
          setRetailers(retRes.data.map(r => ({
            id: r.id,
            name: r.name || r.first_name || '',
            businessName: r.business_name || r.name || 'Retail Boutique',
            gstNumber: r.gst_number || '',
            city: r.city || r.place || '',
            state: r.state || '',
            phone: r.phone || '',
            email: r.email || '',
            address: r.address || r.shop_address || '',
            proofIdType: r.proof_id_type || 'Aadhaar',
            proofIdNumber: r.proof_id_number || '',
            activeOrdersCount: r.active_orders_count || 0,
            totalSpent: r.total_spent || 0,
            creditLimit: r.credit_limit || 200000,
            joinedDate: r.joined_date || 'Nov 2026',
          })));
        }
      } else {
        setOrders([]);
        setInvoices([]);
        setRetailers([]);
      }

      setIsDatabaseConnected(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Database connection error';
      setDatabaseError(msg);
      setIsDatabaseConnected(false);
      showToast(`Supabase Error: ${msg}`, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadDatabaseData();
  }, [loadDatabaseData]);

  // Realtime Subscriptions for live updates
  useEffect(() => {
    const client = supabase;
    if (!client) return;

    const channel = client.channel('loopmex_live_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        client.from('products').select('*').order('id', { ascending: true }).then(({ data }) => {
          if (data) setProducts(data.map(mapDbProductToApp));
        });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        if (!currentUser) return;
        let q = client.from('orders').select('*').order('created_at', { ascending: false });
        if (currentUser.role === 'retailer') {
          q = q.or(`retailer_id.eq.${currentUser.id},user_id.eq.${currentUser.id}`);
        }
        q.then(({ data }) => {
          if (data) setOrders(data.map(mapDbOrderToApp));
        });
      })
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [currentUser]);

  // Login / Logout
  const login = (user: AuthUser) => {
    setCurrentUser(user);
    setAuthView(null);
    showToast(`Welcome back, ${user.name}!`, 'success');
  };

  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setCurrentUser(null);
    setAuthView(null);
    setAuthMode('login');
    setCurrentView('landing');
    showToast('Logged out successfully', 'info');
  };

  // Retailer Auth via Supabase
  const loginRetailer = async (credentials: RetailerCredentials): Promise<boolean> => {
    const email = (credentials.email || credentials.identifier || credentials.name || '').trim();
    const password = credentials.password || '';

    if (!email || !password) {
      showToast('Please enter your email and password.', 'error');
      return false;
    }

    if (!supabase || !isSupabaseConfigured) {
      showToast('Supabase connection unavailable.', 'error');
      return false;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password,
      });

      if (error || !data.user) {
        showToast(error?.message || 'Invalid credentials or email not confirmed.', 'error');
        return false;
      }

      // Read retailer profile
      const { data: profile, error: profileError } = await supabase
        .from('retailers')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();

      if (profileError || !profile) {
        await supabase.auth.signOut();
        showToast('This account is not registered as a retailer.', 'error');
        return false;
      }

      const user: AuthUser = {
        id: data.user.id,
        name: profile?.name || profile?.first_name || data.user.user_metadata?.name || data.user.user_metadata?.firstName || email.split('@')[0],
        email: profile?.email || data.user.email || email,
        phone: profile?.phone || data.user.user_metadata?.phone || '',
        place: profile?.city || profile?.place || data.user.user_metadata?.place || '',
        pincode: profile?.pincode || data.user.user_metadata?.pinCode || '',
        passwordHash: '',
        role: 'retailer',
        isNewRetailer: false,
        authenticatedAt: new Date().toISOString(),
      };

      setCurrentUser(user);
      setAuthView(null);
      setCurrentView('retailer');
      showToast(`Welcome back, ${user.name}!`, 'success');
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed.';
      showToast(msg, 'error');
      return false;
    }
  };

  const registerRetailer = async (data: RetailerRegisterData): Promise<{ success: boolean; message?: string }> => {
    const fullName = (data.name || data.firstName || '').trim();
    const email = data.email.trim().toLowerCase();

    if (!supabase || !isSupabaseConfigured) {
      return { success: false, message: 'Supabase database is not configured.' };
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: data.password,
        options: {
          data: {
            role: 'retailer',
            name: fullName,
            firstName: data.firstName.trim(),
            mobile: data.mobile.trim(),
            phone: data.mobile.trim(),
            place: data.place.trim(),
            city: data.place.trim(),
            pinCode: data.pincode.trim(),
            shopAddress: data.shopAddress.trim(),
            proofIdType: data.proofIdType,
            proofIdNumber: data.proofIdNumber.trim(),
          },
        },
      });

      if (authError) {
        return { success: false, message: authError.message };
      }

      if (authData.user) {
        // Safe profile upsert in retailers table
        await supabase.from('retailers').upsert({
          id: authData.user.id,
          user_id: authData.user.id,
          name: fullName,
          first_name: data.firstName.trim(),
          business_name: fullName,
          phone: data.mobile.trim(),
          email,
          city: data.place.trim(),
          place: data.place.trim(),
          pincode: data.pincode.trim(),
          address: data.shopAddress.trim(),
          shop_address: data.shopAddress.trim(),
          proof_id_type: data.proofIdType,
          proof_id_number: data.proofIdNumber.trim(),
        });

        if (authData.session) {
          const user: AuthUser = {
            id: authData.user.id,
            name: fullName,
            email,
            phone: data.mobile.trim(),
            place: data.place.trim(),
            pincode: data.pincode.trim(),
            passwordHash: '',
            role: 'retailer',
            isNewRetailer: true,
            authenticatedAt: new Date().toISOString(),
          };
          setCurrentUser(user);
          setAuthView(null);
          setCurrentView('retailer');
          showToast('Account created successfully! Welcome to Loopmex.', 'success');
          return { success: true };
        } else {
          setAuthMode('login');
          return { 
            success: true, 
            message: 'Account created! Please check your email to confirm your account, then sign in.' 
          };
        }
      }

      return { success: false, message: 'Signup did not return a valid user.' };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Registration failed.';
      return { success: false, message: msg };
    }
  };

  // Factory Login
  const loginFactory = async (credentials: FactoryCredentials): Promise<boolean> => {
    const emailInput = (credentials.email ?? credentials.name ?? '').trim();
    const normalizedEmail = emailInput.toLowerCase();
    const password = credentials.password || '';

    if (!normalizedEmail || !password) {
      showToast('Please enter your factory email and password.', 'error');
      return false;
    }

    if (!supabase || !isSupabaseConfigured) {
      showToast('Factory login is unavailable because Supabase is not configured.', 'error');
      return false;
    }

    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (signInError || !signInData.user) {
        await supabase.auth.signOut();
        showToast(signInError?.message || 'Unable to sign in with Supabase.', 'error');
        return false;
      }

      const { data: profile, error: profileError } = await supabase
        .from('factory_members')
        .select('*')
        .eq('id', signInData.user.id)
        .maybeSingle();

      if (profileError || !profile) {
        await supabase.auth.signOut();
        showToast('This account is not registered as an authorized factory member.', 'error');
        return false;
      }

      if (!profile.is_active || !['factory_member', 'factory_admin', 'factory_staff'].includes(profile.role)) {
        await supabase.auth.signOut();
        showToast('This factory member account is inactive or not authorized for access.', 'error');
        return false;
      }

      const user: AuthUser = {
        id: profile.id,
        name: profile.full_name || signInData.user.user_metadata?.full_name || normalizedEmail.split('@')[0],
        email: profile.email || normalizedEmail,
        phone: '',
        place: '',
        pincode: '',
        passwordHash: '',
        role: 'factory',
        isNewRetailer: false,
        authenticatedAt: new Date().toISOString(),
      };

      if (signInData.user.user_metadata?.password_reset_required) {
        showToast('Set a new password before accessing the factory dashboard.', 'info');
        return false;
      }

      setCurrentUser(user);
      setAuthView(null);
      setCurrentView('factory');
      showToast(`Welcome, ${user.name}!`, 'success');
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected login error.';
      showToast(message, 'error');
      return false;
    }
  };

  // Password Reset
  const resetPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
    if (!supabase) {
      return { success: false, message: 'Database connection unavailable.' };
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/#password-reset=1`,
      });
      if (error) throw error;
      return { success: true, message: 'Password recovery email sent! Check your inbox for instructions.' };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to send password recovery email.';
      return { success: false, message: msg };
    }
  };

  // Product Actions (Supabase Writes)
  const addProduct = async (prodData: Omit<Product, 'id'>) => {
    if (!supabase) return;
    const newProduct: Product = {
      ...prodData,
      id: `prod-${Date.now()}`
    };

    try {
      const { error } = await supabase.from('products').insert(mapAppProductToDb(newProduct));
      if (error) throw error;
      setProducts(prev => [newProduct, ...prev]);
      showToast(`Garment "${newProduct.name}" added to factory catalog!`, 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to add product';
      showToast(msg, 'error');
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    if (!supabase) return;
    try {
      const payload: any = {};
      if (updates.wholesalePrice !== undefined) payload.wholesale_price = updates.wholesalePrice;
      if (updates.retailMrp !== undefined) payload.retail_mrp = updates.retailMrp;
      if (updates.moq !== undefined) payload.moq = updates.moq;
      if (updates.fabric !== undefined) payload.fabric = updates.fabric;
      if (updates.description !== undefined) payload.description = updates.description;
      
      const { error } = await supabase.from('products').update(payload).eq('id', id);
      if (error) throw error;

      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
      showToast('Product specifications updated successfully', 'info');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update product';
      showToast(msg, 'error');
    }
  };

  const updateStock = async (productId: string, size: keyof SizeBreakdown, quantity: number) => {
    if (!supabase) return;
    const newQty = Math.max(0, quantity);
    try {
      const column = `stock_${size.toLowerCase()}`;
      const { error } = await supabase.from('products').update({ [column]: newQty }).eq('id', productId);
      if (error) throw error;

      setProducts(prev => prev.map(p => {
        if (p.id === productId) {
          return {
            ...p,
            stock: {
              ...p.stock,
              [size]: newQty
            }
          };
        }
        return p;
      }));
      showToast(`Updated ${size} inventory stock to ${newQty}`, 'info');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update stock';
      showToast(msg, 'error');
    }
  };

  // Cart Actions (Client-side)
  const addToCart = (newItem: CartItem) => {
    // Ordering is a retailer-only capability. Factory owners/admins/partners/
    // staff may inspect stock but must never add purchasable lines to a cart.
    if (currentUser?.role !== 'retailer') {
      showToast('Only retailer accounts can add products to an order.', 'error');
      return;
    }

    setCart(prev => {
      const existingIdx = prev.findIndex(item => 
        item.product.id === newItem.product.id && item.selectedColor === newItem.selectedColor
      );

      if (existingIdx > -1) {
        const updated = [...prev];
        const existing = updated[existingIdx];
        const mergedSizes = {
          S: existing.sizes.S + newItem.sizes.S,
          M: existing.sizes.M + newItem.sizes.M,
          L: existing.sizes.L + newItem.sizes.L,
          XL: existing.sizes.XL + newItem.sizes.XL,
          XXL: existing.sizes.XXL + newItem.sizes.XXL,
        };
        const totalQty = Object.values(mergedSizes).reduce((a, b) => a + b, 0);
        updated[existingIdx] = {
          ...existing,
          sizes: mergedSizes,
          totalQuantity: totalQty,
          itemTotal: totalQty * existing.product.wholesalePrice,
        };
        return updated;
      }

      return [...prev, newItem];
    });

    showToast(`Added ${newItem.totalQuantity} pcs of ${newItem.product.name} to bulk order`, 'success');
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
    showToast('Removed item from bulk order', 'info');
  };

  const updateCartSizes = (itemId: string, sizes: SizeBreakdown) => {
    setCart(prev => prev.map(item => {
      if (item.id === itemId) {
        const total = Object.values(sizes).reduce((a, b) => a + b, 0);
        return {
          ...item,
          sizes,
          totalQuantity: total,
          itemTotal: total * item.product.wholesalePrice,
        };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Atomic Order Placement (Database RPC)
  const placeOrder = async (orderInfo: {
    retailerName: string;
    retailerStore: string;
    retailerCity: string;
    retailerPhone: string;
    paymentMethod: 'UPI' | 'NEFT / RTGS' | 'Factory Credit (15 Days)';
  }): Promise<Order> => {
    if (!currentUser) {
      const msg = 'Please sign in to place an order.';
      showToast(msg, 'error');
      throw new Error(msg);
    }
    // Defence in depth: the RPC also verifies this against the database.
    if (currentUser.role !== 'retailer') {
      const msg = 'Only retailer accounts can place orders.';
      showToast(msg, 'error');
      throw new Error(msg);
    }
    if (cart.length === 0) {
      const msg = 'Cart is empty. Add products before placing an order.';
      showToast(msg, 'error');
      throw new Error(msg);
    }
    if (!supabase) {
      const msg = 'Database connection unavailable.';
      showToast(msg, 'error');
      throw new Error(msg);
    }

    try {
      const { data, error } = await supabase.rpc('create_order', {
        p_order_info: {
          retailerName: orderInfo.retailerName,
          retailerStore: orderInfo.retailerStore,
          retailerCity: orderInfo.retailerCity,
          retailerPhone: orderInfo.retailerPhone,
          paymentMethod: orderInfo.paymentMethod,
        },
        p_items: cart,
      });

      if (error) {
        throw new Error(error.message);
      }

      const createdOrder = mapDbOrderToApp(data);
      setOrders(prev => [createdOrder, ...prev]);
      clearCart();
      showToast(`Order ${createdOrder.orderNumber} placed successfully!`, 'success');

      // Refresh catalog to reflect updated stock
      const { data: updatedProducts } = await supabase.from('products').select('*').order('id', { ascending: true });
      if (updatedProducts) {
        setProducts(updatedProducts.map(mapDbProductToApp));
      }

      return createdOrder;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to place order';
      showToast(message, 'error');
      throw err;
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    if (!supabase) return;
    const dispatchDate = status === 'Dispatched' ? new Date().toISOString().split('T')[0] : undefined;

    try {
      const payload: any = { status };
      if (dispatchDate) payload.dispatch_date = dispatchDate;

      const { error } = await supabase.from('orders').update(payload).eq('id', orderId);
      if (error) throw error;

      setOrders(prev => prev.map(o => {
        if (o.id === orderId) {
          return {
            ...o,
            status,
            dispatchDate: dispatchDate || o.dispatchDate,
          };
        }
        return o;
      }));
      showToast(`Order status updated to "${status}"`, 'info');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update order status';
      showToast(msg, 'error');
    }
  };

  const submitEnquiry = async (enquiryData: Omit<Enquiry, 'id' | 'submittedAt'>) => {
    if (!supabase) return;
    const newEnquiry: Enquiry = {
      ...enquiryData,
      id: `enq-${Date.now()}`,
      submittedAt: new Date().toISOString(),
    };

    try {
      const { error } = await supabase.from('enquiries').insert({
        id: newEnquiry.id,
        user_id: currentUser?.id || null,
        name: newEnquiry.name,
        business_name: newEnquiry.businessName,
        email: newEnquiry.email,
        phone: newEnquiry.phone || null,
        message: newEnquiry.message,
        submitted_at: newEnquiry.submittedAt,
      });

      if (error) throw error;

      setEnquiries(prev => [newEnquiry, ...prev]);
      showToast('Your wholesale enquiry has been submitted. Our factory desk will reach out within 2 hours.', 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to submit enquiry';
      showToast(msg, 'error');
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        authView,
        setAuthView,
        currentUser,
        isAuthenticated,
        login,
        logout,
        registerRetailer,
        loginRetailer,
        loginFactory,
        resetPassword,
        setAuthMode,
        authMode,
        products,
        addProduct,
        updateProduct,
        updateStock,
        cart,
        addToCart,
        removeFromCart,
        updateCartSizes,
        clearCart,
        orders,
        placeOrder,
        updateOrderStatus,
        retailers,
        invoices,
        activeFilter,
        setActiveFilter,
        searchQuery,
        setSearchQuery,
        toast,
        showToast,
        selectedProductForDetail,
        setSelectedProductForDetail,
        isCartOpen,
        setIsCartOpen,
        trackingOrder,
        setTrackingOrder,
        activeInvoice,
        setActiveInvoice,
        enquiries,
        submitEnquiry,
        isDatabaseConnected,
        supabaseUrl,
        isLoading,
        databaseError,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
