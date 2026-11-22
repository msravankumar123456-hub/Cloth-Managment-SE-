import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';
import {
  LayoutDashboard, Package, Layers, ShoppingBag, Users, Truck, FileText,
  Settings, ArrowLeft, Building2, Store, CreditCard, Factory, Boxes,
  ClipboardList, UserCog, Shield, ScrollText, LogOut, Plus, Pencil,
  Trash2, CheckCircle, XCircle, Search, RefreshCw, ChevronDown, ChevronUp,
  Eye, EyeOff, AlertCircle, ExternalLink, SlidersHorizontal
} from 'lucide-react';
import { InvoicesView } from '../retailer/InvoicesView';
import { OrderTrackingModal } from '../retailer/OrderTrackingModal';
import { RetailerDetailModal } from './RetailerDetailModal';
import { FactoryStaff, ActivityLog, Retailer } from '../../types';

// ─────────────────────────── types ───────────────────────────────────────────
interface StatCard {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}

// ─────────────────────────── helpers ─────────────────────────────────────────
const StatBox: React.FC<StatCard> = ({ label, value, sub, color = '#FF7135' }) => (
  <div className="rounded-2xl bg-[#17181C] border border-white/[0.08] p-5">
    <p className="text-xs text-[#71717A] font-mono uppercase tracking-wider mb-2">{label}</p>
    <p className="text-2xl font-bold text-white" style={{ color }}>{value}</p>
    {sub && <p className="text-[11px] text-[#52525B] mt-1">{sub}</p>}
  </div>
);

const SectionHeader: React.FC<{ title: string; sub: string }> = ({ title, sub }) => (
  <div>
    <h2 className="text-xl font-bold text-white">{title}</h2>
    <p className="text-xs text-[#71717A]">{sub}</p>
  </div>
);

// ─────────────────────────── sidebar nav ─────────────────────────────────────
const NAV_ITEMS = [
  { id: 'overview',    label: 'Overview',         icon: LayoutDashboard },
  { id: 'products',    label: 'Products',          icon: Package },
  { id: 'inventory',   label: 'Inventory',         icon: Layers },
  { id: 'stock-adjust',label: 'Stock Adjust',      icon: SlidersHorizontal },
  { id: 'retailers',   label: 'Retailers',         icon: Store },
  { id: 'orders',      label: 'Orders',            icon: ShoppingBag },
  { id: 'invoices',    label: 'Invoices',          icon: FileText },
  { id: 'payments',    label: 'Payments',          icon: CreditCard },
  { id: 'deliveries',  label: 'Deliveries',        icon: Truck },
  { id: 'suppliers',   label: 'Suppliers',         icon: Boxes },
  { id: 'fabric',      label: 'Fabric Inventory',  icon: Factory },
  { id: 'production',  label: 'Production Runs',   icon: ClipboardList },
  { id: 'staff',       label: 'Staff Management',  icon: UserCog },
  { id: 'roles',       label: 'Roles & Permissions',icon: Shield },
  { id: 'logs',        label: 'Activity Logs',     icon: ScrollText },
  { id: 'settings',    label: 'Factory Settings',  icon: Settings },
];

// ─────────────────────────── main portal ─────────────────────────────────────
export const AdminPortal: React.FC = () => {
  const {
    currentUser, setCurrentView, orders, products, invoices, retailers,
    removeRetailer,
    trackingOrder, setTrackingOrder, activeInvoice, setActiveInvoice,
    showToast, isDatabaseConnected, updateOrderStatus, logout,
    adjustStock, refreshProducts
  } = useApp();

  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedRetailer, setSelectedRetailer] = useState<Retailer | null>(null);

  // DB-fetched data exclusive to admin
  const [staffList,  setStaffList]  = useState<FactoryStaff[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [fabricInventory, setFabricInventory] = useState<any[]>([]);
  const [productionRuns, setProductionRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Guard — redirect if not admin
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      setCurrentView('admin-auth');
    }
  }, [currentUser, setCurrentView]);

  const fetchAdminData = useCallback(async () => {
    if (!supabase || !currentUser || currentUser.role !== 'admin') return;
    setLoading(true);
    try {
      const [staffRes, logsRes, payRes, supRes, fabRes, prodRes] = await Promise.all([
        supabase.from('factory_members').select('*').order('created_at', { ascending: false }),
        supabase.from('factory_activity_logs').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('payments').select('*').order('created_at', { ascending: false }),
        supabase.from('suppliers').select('*').order('name'),
        supabase.from('fabric_inventory').select('*').order('fabric_name'),
        supabase.from('production_runs').select('*').order('created_at', { ascending: false }),
      ]);

      if (staffRes.data) {
        setStaffList(staffRes.data.map((s: any) => ({
          id: s.id,
          email: s.email || '',
          fullName: s.full_name || '',
          role: s.role,
          isActive: s.is_active,
          permissions: s.permissions || {},
          createdAt: s.created_at,
        })));
      }
      if (logsRes.data) {
        setActivityLogs(logsRes.data.map((l: any) => ({
          id: l.id,
          userId: l.user_id,
          userEmail: l.user_email,
          action: l.action,
          resourceType: l.resource_type,
          resourceId: l.resource_id,
          details: l.details || {},
          createdAt: l.created_at,
        })));
      }
      if (payRes.data) setPayments(payRes.data);
      if (supRes.data) setSuppliers(supRes.data);
      if (fabRes.data) setFabricInventory(fabRes.data);
      if (prodRes.data) setProductionRuns(prodRes.data);
    } catch (err) {
      showToast('Failed to load admin data', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentUser, showToast]);

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      fetchAdminData();
    }
  }, [fetchAdminData, currentUser]);

  if (!currentUser || currentUser.role !== 'admin') {
    return null;
  }

  const totalRevenue = invoices.reduce((s, i) => s + i.grandTotal, 0);
  const pendingOrders = orders.filter(o => o.status !== 'Delivered').length;
  const activeStaff = staffList.filter(s => s.isActive).length;

  return (
    <div className="min-h-screen bg-[#101114] text-[#F5F5F5] pt-16">
      {/* Top Banner */}
      <div className="border-b border-white/[0.08] bg-[#141519] py-3">
        <div className="max-w-[1400px] mx-auto px-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FF7135]/15 border border-[#FF7135]/30 flex items-center justify-center text-[#FF7135]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white tracking-tight">Loopmex Admin Portal</h1>
                <span className="px-2 py-0.5 rounded-full bg-[#FF7135]/10 border border-[#FF7135]/20 text-[#FF7135] font-mono text-[10px]">
                  SUPER ADMIN
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                  isDatabaseConnected
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                    : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                }`}>
                  {isDatabaseConnected ? '● Live' : '● Offline'}
                </span>
              </div>
              <p className="text-[11px] text-[#71717A]">{currentUser.name} · {currentUser.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchAdminData}
              disabled={loading}
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/10 text-[#A1A1AA] hover:text-white transition-all disabled:opacity-50"
              title="Refresh data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setCurrentView('landing')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/10 text-xs text-[#D4D4D8] transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Website
            </button>
            <button
              onClick={() => logout()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-xs text-red-400 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Layout */}
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        <div className="flex gap-6 items-start">
          {/* Sidebar */}
          <aside className={`${sidebarOpen ? 'w-56' : 'w-14'} flex-shrink-0 rounded-2xl bg-[#17181C] border border-white/[0.08] p-2 space-y-0.5 transition-all duration-200 sticky top-24`}>
            <div className="flex items-center justify-between px-2 py-1.5 mb-1">
              {sidebarOpen && <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717A]">Navigation</span>}
              <button onClick={() => setSidebarOpen(v => !v)} className="text-[#52525B] hover:text-white ml-auto">
                {sidebarOpen ? <ChevronDown className="w-3.5 h-3.5 rotate-90" /> : <ChevronUp className="w-3.5 h-3.5 rotate-90" />}
              </button>
            </div>

            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                title={!sidebarOpen ? label : undefined}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === id
                    ? 'bg-[#FF7135] text-white shadow-md shadow-[#FF7135]/25'
                    : 'text-[#A1A1AA] hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {sidebarOpen && <span className="truncate">{label}</span>}
              </button>
            ))}
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* ── Overview ── */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <SectionHeader title="Admin Overview" sub="Real-time stats from your Supabase database." />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatBox label="Total Products"  value={products.length}  sub="In catalog" />
                  <StatBox label="Total Orders"    value={orders.length}    sub={`${pendingOrders} pending`} color="#A78BFA" />
                  <StatBox label="Total Revenue"   value={`₹${(totalRevenue/100000).toFixed(1)}L`} sub="All invoices" color="#34D399" />
                  <StatBox label="Retailers"       value={retailers.length} sub="Registered" color="#60A5FA" />
                  <StatBox label="Active Staff"    value={activeStaff}      sub={`${staffList.length} total`} color="#FB923C" />
                  <StatBox label="Invoices"        value={invoices.length}  sub={`${invoices.filter(i=>i.status==='Paid').length} paid`} color="#34D399" />
                  <StatBox label="Suppliers"       value={suppliers.length} sub="Registered" color="#A78BFA" />
                  <StatBox label="Production Runs" value={productionRuns.length} sub="Total" color="#F472B6" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Recent Orders */}
                  <div className="rounded-2xl bg-[#17181C] border border-white/[0.08] p-5">
                    <h3 className="text-sm font-bold text-white mb-3">Recent Orders</h3>
                    <div className="space-y-2">
                      {orders.slice(0, 5).map(o => (
                        <div key={o.id} className="flex items-center justify-between text-xs py-1.5 border-b border-white/[0.04] last:border-0">
                          <div>
                            <span className="font-mono text-white">{o.orderNumber}</span>
                            <span className="text-[#71717A] ml-2">{o.retailerStore}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                            o.status === 'Delivered' ? 'bg-emerald-500/15 text-emerald-400' :
                            o.status === 'Pending'   ? 'bg-amber-500/15 text-amber-400' :
                            'bg-blue-500/15 text-blue-400'
                          }`}>{o.status}</span>
                        </div>
                      ))}
                      {orders.length === 0 && <p className="text-xs text-[#52525B]">No orders yet.</p>}
                    </div>
                  </div>

                  {/* Quick Nav */}
                  <div className="rounded-2xl bg-[#17181C] border border-white/[0.08] p-5">
                    <h3 className="text-sm font-bold text-white mb-3">Quick Navigation</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {['staff','orders','products','retailers','logs','suppliers'].map(tab => {
                        const item = NAV_ITEMS.find(n => n.id === tab)!;
                        const Icon = item.icon;
                        return (
                          <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.03] hover:bg-[#FF7135]/10 hover:border-[#FF7135]/30 border border-white/[0.06] text-xs text-[#A1A1AA] hover:text-[#FF7135] transition-all"
                          >
                            <Icon className="w-3.5 h-3.5" />
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Products ── */}
            {activeTab === 'products' && (
              <AdminProductsSection products={products} showToast={showToast} />
            )}

            {/* ── Inventory (fabric) ── */}
            {activeTab === 'inventory' && (
              <AdminInventorySection products={products} showToast={showToast} />
            )}

            {/* ── Stock Adjust (admin only) ── */}
            {activeTab === 'stock-adjust' && (
              <AdminStockAdjustSection
                products={products}
                adjustStock={adjustStock}
                refreshProducts={refreshProducts}
                showToast={showToast}
              />
            )}

            {/* ── Retailers ── */}
            {activeTab === 'retailers' && (
              <div className="space-y-6">
                <SectionHeader title="Retailer Accounts" sub="All registered retailer profiles in the database." />
                <div className="rounded-2xl bg-[#17181C] border border-white/[0.08] overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#141519] border-b border-white/[0.08] text-[#71717A] font-mono text-[11px]">
                      <tr>
                        <th className="py-3 px-4">Name</th>
                        <th className="py-3 px-4">Business</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">City</th>
                        <th className="py-3 px-4">Phone</th>
                        <th className="py-3 px-4 text-right">Total Spent</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {retailers.map(r => (
                        <tr key={r.id} className="hover:bg-white/[0.02]">
                          <td className="py-3 px-4">
                            <button
                              onClick={() => setSelectedRetailer(r)}
                              className="font-semibold text-white hover:text-[#FF7135] text-left transition-colors cursor-pointer group flex items-center gap-1.5 focus:outline-none"
                              title="Click to view retailer details or remove account"
                            >
                              <span className="group-hover:underline underline-offset-2">{r.name}</span>
                              <ExternalLink className="w-3 h-3 text-[#71717A] opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                          </td>
                          <td className="py-3 px-4 text-[#A1A1AA]">{r.businessName}</td>
                          <td className="py-3 px-4 text-[#71717A]">{r.email}</td>
                          <td className="py-3 px-4 text-[#A1A1AA]">{r.city}</td>
                          <td className="py-3 px-4 text-[#71717A]">{r.phone}</td>
                          <td className="py-3 px-4 text-right font-mono text-[#FF7135]">₹{r.totalSpent.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {retailers.length === 0 && <p className="p-6 text-xs text-[#52525B]">No retailers registered yet.</p>}
                </div>
              </div>
            )}

            {/* ── Orders ── */}
            {activeTab === 'orders' && (
              <AdminOrdersSection orders={orders} updateOrderStatus={updateOrderStatus} setTrackingOrder={setTrackingOrder} showToast={showToast} />
            )}

            {/* ── Invoices ── */}
            {activeTab === 'invoices' && (
              <div className="space-y-6">
                <SectionHeader title="All Invoices" sub="Complete invoices ledger with GST compliance." />
                <div className="rounded-2xl bg-[#17181C] border border-white/[0.08] overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#141519] border-b border-white/[0.08] text-[#71717A] font-mono text-[11px]">
                      <tr>
                        <th className="py-3 px-4">Invoice #</th>
                        <th className="py-3 px-4">Order Ref</th>
                        <th className="py-3 px-4">Retailer</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4 text-right">Total</th>
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {invoices.map(inv => (
                        <tr key={inv.id} className="hover:bg-white/[0.02]">
                          <td className="py-3 px-4 font-mono font-bold text-white">{inv.invoiceNumber}</td>
                          <td className="py-3 px-4 font-mono text-[#A1A1AA]">{inv.orderNumber}</td>
                          <td className="py-3 px-4 font-semibold text-white">{inv.retailerStore}</td>
                          <td className="py-3 px-4 text-[#71717A]">{inv.date}</td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-[#FF7135]">₹{inv.grandTotal.toLocaleString()}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              inv.status === 'Paid' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
                            }`}>{inv.status}</span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => setActiveInvoice(inv)}
                              className="px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-[#FF7135] text-white text-[11px] font-semibold transition-colors"
                            >
                              View PDF
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {invoices.length === 0 && <p className="p-6 text-xs text-[#52525B]">No invoices yet.</p>}
                </div>
              </div>
            )}

            {/* ── Payments ── */}
            {activeTab === 'payments' && (
              <div className="space-y-6">
                <SectionHeader title="Payments Ledger" sub="All payment transactions from the database." />
                <div className="rounded-2xl bg-[#17181C] border border-white/[0.08] overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#141519] border-b border-white/[0.08] text-[#71717A] font-mono text-[11px]">
                      <tr>
                        <th className="py-3 px-4">ID</th>
                        <th className="py-3 px-4">Order</th>
                        <th className="py-3 px-4">Method</th>
                        <th className="py-3 px-4 text-right">Amount</th>
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 px-4">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {payments.map((p: any) => (
                        <tr key={p.id} className="hover:bg-white/[0.02]">
                          <td className="py-3 px-4 font-mono text-[#71717A] text-[10px]">{p.id?.slice(0,8)}</td>
                          <td className="py-3 px-4 font-mono text-[#A1A1AA]">{p.order_id?.slice(0,8)}</td>
                          <td className="py-3 px-4 text-white">{p.method}</td>
                          <td className="py-3 px-4 text-right font-mono text-[#FF7135] font-bold">₹{Number(p.amount).toLocaleString()}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                              p.status === 'paid' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
                            }`}>{p.status}</span>
                          </td>
                          <td className="py-3 px-4 text-[#71717A]">{p.paid_at ? new Date(p.paid_at).toLocaleDateString() : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {payments.length === 0 && <p className="p-6 text-xs text-[#52525B]">No payments recorded yet.</p>}
                </div>
              </div>
            )}

            {/* ── Deliveries ── */}
            {activeTab === 'deliveries' && (
              <div className="space-y-6">
                <SectionHeader title="Freight & Deliveries" sub="Track dispatched and pending delivery orders." />
                <div className="rounded-2xl bg-[#17181C] border border-white/[0.08] overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#141519] border-b border-white/[0.08] text-[#71717A] font-mono text-[11px]">
                      <tr>
                        <th className="py-3 px-4">Order #</th>
                        <th className="py-3 px-4">Retailer</th>
                        <th className="py-3 px-4">City</th>
                        <th className="py-3 px-4">Courier</th>
                        <th className="py-3 px-4">Tracking</th>
                        <th className="py-3 px-4">Dispatch Date</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {orders.map(o => (
                        <tr key={o.id} className="hover:bg-white/[0.02]">
                          <td className="py-3 px-4 font-mono text-white">{o.orderNumber}</td>
                          <td className="py-3 px-4 text-[#A1A1AA]">{o.retailerStore}</td>
                          <td className="py-3 px-4 text-[#71717A]">{o.retailerCity}</td>
                          <td className="py-3 px-4 text-[#A1A1AA]">{o.courierName || '—'}</td>
                          <td className="py-3 px-4 font-mono text-[11px] text-[#71717A]">{o.trackingNumber || '—'}</td>
                          <td className="py-3 px-4 text-[#71717A]">{o.dispatchDate || '—'}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                              o.status === 'Delivered' ? 'bg-emerald-500/15 text-emerald-400' :
                              o.status === 'Dispatched' ? 'bg-blue-500/15 text-blue-400' :
                              'bg-amber-500/15 text-amber-400'
                            }`}>{o.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {orders.length === 0 && <p className="p-6 text-xs text-[#52525B]">No orders yet.</p>}
                </div>
              </div>
            )}

            {/* ── Suppliers ── */}
            {activeTab === 'suppliers' && (
              <div className="space-y-6">
                <SectionHeader title="Suppliers" sub="Raw material and fabric suppliers." />
                <div className="rounded-2xl bg-[#17181C] border border-white/[0.08] overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#141519] border-b border-white/[0.08] text-[#71717A] font-mono text-[11px]">
                      <tr>
                        <th className="py-3 px-4">Name</th>
                        <th className="py-3 px-4">Contact</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">City</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {suppliers.map((s: any) => (
                        <tr key={s.id} className="hover:bg-white/[0.02]">
                          <td className="py-3 px-4 font-semibold text-white">{s.name}</td>
                          <td className="py-3 px-4 text-[#A1A1AA]">{s.contact_person}</td>
                          <td className="py-3 px-4 text-[#71717A]">{s.email}</td>
                          <td className="py-3 px-4 text-[#A1A1AA]">{s.city}</td>
                          <td className="py-3 px-4 text-[#71717A]">{s.category}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                              s.is_active ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                            }`}>{s.is_active ? 'Active' : 'Inactive'}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {suppliers.length === 0 && <p className="p-6 text-xs text-[#52525B]">No suppliers added yet.</p>}
                </div>
              </div>
            )}

            {/* ── Fabric Inventory ── */}
            {activeTab === 'fabric' && (
              <div className="space-y-6">
                <SectionHeader title="Fabric Inventory" sub="Raw material stock levels by fabric and color." />
                <div className="rounded-2xl bg-[#17181C] border border-white/[0.08] overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#141519] border-b border-white/[0.08] text-[#71717A] font-mono text-[11px]">
                      <tr>
                        <th className="py-3 px-4">Fabric Name</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4">Color</th>
                        <th className="py-3 px-4 text-right">Qty (m)</th>
                        <th className="py-3 px-4 text-right">Price/m</th>
                        <th className="py-3 px-4">Location</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {fabricInventory.map((f: any) => (
                        <tr key={f.id} className="hover:bg-white/[0.02]">
                          <td className="py-3 px-4 font-semibold text-white">{f.fabric_name}</td>
                          <td className="py-3 px-4 text-[#A1A1AA]">{f.type}</td>
                          <td className="py-3 px-4 text-[#71717A]">{f.color}</td>
                          <td className="py-3 px-4 text-right font-mono text-white">{Number(f.quantity_meters).toLocaleString()}</td>
                          <td className="py-3 px-4 text-right font-mono text-[#FF7135]">₹{Number(f.price_per_meter).toLocaleString()}</td>
                          <td className="py-3 px-4 text-[#71717A]">{f.location}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {fabricInventory.length === 0 && <p className="p-6 text-xs text-[#52525B]">No fabric inventory records yet.</p>}
                </div>
              </div>
            )}

            {/* ── Production Runs ── */}
            {activeTab === 'production' && (
              <div className="space-y-6">
                <SectionHeader title="Production Runs" sub="Manufacturing batch tracking and completion status." />
                <div className="rounded-2xl bg-[#17181C] border border-white/[0.08] overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#141519] border-b border-white/[0.08] text-[#71717A] font-mono text-[11px]">
                      <tr>
                        <th className="py-3 px-4">Batch #</th>
                        <th className="py-3 px-4">Responsible</th>
                        <th className="py-3 px-4 text-center">Planned</th>
                        <th className="py-3 px-4 text-center">Completed</th>
                        <th className="py-3 px-4">Start Date</th>
                        <th className="py-3 px-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {productionRuns.map((r: any) => (
                        <tr key={r.id} className="hover:bg-white/[0.02]">
                          <td className="py-3 px-4 font-mono text-white">{r.batch_number}</td>
                          <td className="py-3 px-4 text-[#A1A1AA]">{r.responsible_person}</td>
                          <td className="py-3 px-4 text-center font-mono text-white">{r.quantity_planned}</td>
                          <td className="py-3 px-4 text-center font-mono text-emerald-400">{r.quantity_completed}</td>
                          <td className="py-3 px-4 text-[#71717A]">{r.start_date}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                              r.status === 'Completed' ? 'bg-emerald-500/15 text-emerald-400' :
                              r.status === 'In Progress' ? 'bg-blue-500/15 text-blue-400' :
                              'bg-amber-500/15 text-amber-400'
                            }`}>{r.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {productionRuns.length === 0 && <p className="p-6 text-xs text-[#52525B]">No production runs recorded yet.</p>}
                </div>
              </div>
            )}

            {/* ── Staff Management ── */}
            {activeTab === 'staff' && (
              <AdminStaffSection
                staffList={staffList}
                currentUser={currentUser}
                showToast={showToast}
                onRefresh={fetchAdminData}
              />
            )}

            {/* ── Roles & Permissions ── */}
            {activeTab === 'roles' && (
              <div className="space-y-6">
                <SectionHeader title="Roles & Permissions" sub="Role definitions for each account type in the system." />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      role: 'factory_admin',
                      label: 'Factory Admin',
                      color: '#FF7135',
                      perms: ['Full read/write on all tables', 'Create & deactivate staff', 'Manage roles', 'View activity logs', 'Factory settings'],
                    },
                    {
                      role: 'factory_staff',
                      label: 'Factory Staff',
                      color: '#A78BFA',
                      perms: ['Read all orders, products, invoices', 'Update order status', 'Insert activity logs', 'Cannot manage other staff'],
                    },
                    {
                      role: 'factory_member',
                      label: 'Factory Member (Legacy)',
                      color: '#60A5FA',
                      perms: ['Same as Factory Staff', 'Retained for backwards compatibility', 'No new members in this role'],
                    },
                    {
                      role: 'retailer',
                      label: 'Retailer',
                      color: '#34D399',
                      perms: ['Read products (public)', 'Read own orders/invoices', 'Place orders (via RPC)', 'Manage own profile'],
                    },
                  ].map(r => (
                    <div key={r.role} className="rounded-2xl bg-[#17181C] border border-white/[0.08] p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.color }} />
                        <h3 className="text-sm font-bold text-white">{r.label}</h3>
                        <span className="ml-auto font-mono text-[10px] text-[#52525B]">{r.role}</span>
                      </div>
                      <ul className="space-y-1.5">
                        {r.perms.map((p, i) => (
                          <li key={i} className="flex items-center gap-2 text-xs text-[#A1A1AA]">
                            <CheckCircle className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Activity Logs ── */}
            {activeTab === 'logs' && (
              <div className="space-y-6">
                <SectionHeader title="Activity Logs" sub="Audit trail of all admin and staff actions." />
                <div className="rounded-2xl bg-[#17181C] border border-white/[0.08] overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#141519] border-b border-white/[0.08] text-[#71717A] font-mono text-[11px]">
                      <tr>
                        <th className="py-3 px-4">Time</th>
                        <th className="py-3 px-4">User</th>
                        <th className="py-3 px-4">Action</th>
                        <th className="py-3 px-4">Resource</th>
                        <th className="py-3 px-4">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {activityLogs.map(l => (
                        <tr key={l.id} className="hover:bg-white/[0.02]">
                          <td className="py-3 px-4 font-mono text-[11px] text-[#71717A]">
                            {new Date(l.createdAt).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-[#A1A1AA]">{l.userEmail || '—'}</td>
                          <td className="py-3 px-4 font-semibold text-white">{l.action}</td>
                          <td className="py-3 px-4 text-[#71717A]">
                            {l.resourceType ? `${l.resourceType}${l.resourceId ? ` #${l.resourceId.slice(0,8)}` : ''}` : '—'}
                          </td>
                          <td className="py-3 px-4 text-[#52525B] font-mono text-[10px]">
                            {Object.keys(l.details).length > 0 ? JSON.stringify(l.details).slice(0, 60) : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {activityLogs.length === 0 && <p className="p-6 text-xs text-[#52525B]">No activity logs yet.</p>}
                </div>
              </div>
            )}

            {/* ── Factory Settings ── */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <SectionHeader title="Factory Settings" sub="Mill configuration, GST and freight parameters." />
                <div className="p-6 rounded-2xl bg-[#17181C] border border-white/[0.08] max-w-2xl">
                  <form
                    onSubmit={e => { e.preventDefault(); showToast('Factory configuration saved.', 'success'); }}
                    className="space-y-4 text-xs"
                  >
                    <div>
                      <label className="block text-[#A1A1AA] mb-1">Mill Entity Legal Name</label>
                      <input type="text" defaultValue="Loopmex Apparel Mills Private Limited"
                        className="w-full px-3.5 py-2 rounded-xl bg-[#101114] border border-white/10 text-white" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[#A1A1AA] mb-1">Manufacturing Unit</label>
                        <input type="text" defaultValue="Tirupur Textile Hub, Tamil Nadu"
                          className="w-full px-3.5 py-2 rounded-xl bg-[#101114] border border-white/10 text-white" />
                      </div>
                      <div>
                        <label className="block text-[#A1A1AA] mb-1">Mill GSTIN</label>
                        <input type="text" defaultValue="33AAACT9812M1Z0"
                          className="w-full px-3.5 py-2 rounded-xl bg-[#101114] border border-white/10 text-white font-mono" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[#A1A1AA] mb-1">GST Rate</label>
                        <input type="text" disabled defaultValue="5.0% (Indian Standard B2B)"
                          className="w-full px-3.5 py-2 rounded-xl bg-[#101114]/60 border border-white/10 text-[#71717A]" />
                      </div>
                      <div>
                        <label className="block text-[#A1A1AA] mb-1">Primary Freight Partner</label>
                        <input type="text" defaultValue="Delhivery B2B Freight Logistics"
                          className="w-full px-3.5 py-2 rounded-xl bg-[#101114] border border-white/10 text-white" />
                      </div>
                    </div>
                    <button type="submit" className="mt-4 px-5 py-2.5 rounded-xl bg-[#FF7135] text-white font-semibold shadow-md shadow-[#FF7135]/25">
                      Save Configuration
                    </button>
                  </form>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Global Modals */}
      <OrderTrackingModal order={trackingOrder} onClose={() => setTrackingOrder(null)} />
      <InvoicesView invoice={activeInvoice} onClose={() => setActiveInvoice(null)} />
      <RetailerDetailModal
        retailer={selectedRetailer}
        orders={orders}
        onClose={() => setSelectedRetailer(null)}
        onRemoveRetailer={removeRetailer}
      />
    </div>
  );
};

// ─────────────────────────── sub-sections ────────────────────────────────────

const AdminProductsSection: React.FC<{ products: any[]; showToast: (m: string, t?: any) => void }> = ({ products, showToast }) => {
  const [search, setSearch] = useState('');
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Products Catalog</h2>
          <p className="text-xs text-[#71717A]">All garment lines in the Loopmex catalog.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#71717A]" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 pr-3 py-2 rounded-xl bg-[#17181C] border border-white/10 text-white text-xs focus:outline-none focus:border-[#FF7135] w-48"
          />
        </div>
      </div>

      <div className="rounded-2xl bg-[#17181C] border border-white/[0.08] overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#141519] border-b border-white/[0.08] text-[#71717A] font-mono text-[11px]">
            <tr>
              <th className="py-3 px-4">Product</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Fabric</th>
              <th className="py-3 px-4 text-right">Wholesale ₹</th>
              <th className="py-3 px-4 text-right">MRP ₹</th>
              <th className="py-3 px-4 text-center">MOQ</th>
              <th className="py-3 px-4 text-center">Stock (S-XXL)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {filtered.map(p => {
              const totalStock = Object.values(p.stock as Record<string, number>).reduce((a: number, b) => a + (b as number), 0);
              return (
                <tr key={p.id} className="hover:bg-white/[0.02]">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white">{p.name}</div>
                    {p.isFeatured && <span className="text-[9px] text-[#FF7135] font-mono">FEATURED</span>}
                  </td>
                  <td className="py-3 px-4 text-[#A1A1AA]">{p.category}</td>
                  <td className="py-3 px-4 text-[#71717A]">{p.fabric}</td>
                  <td className="py-3 px-4 text-right font-mono text-[#FF7135] font-bold">₹{p.wholesalePrice.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right font-mono text-[#A1A1AA]">₹{p.retailMrp.toLocaleString()}</td>
                  <td className="py-3 px-4 text-center font-mono text-white">{p.moq}</td>
                  <td className="py-3 px-4 text-center font-mono text-white">{totalStock}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="p-6 text-xs text-[#52525B]">No products match your search.</p>}
      </div>
    </div>
  );
};

const AdminInventorySection: React.FC<{ products: any[]; showToast: (m: string, t?: any) => void }> = ({ products }) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-xl font-bold text-white">Size Stock Matrix</h2>
      <p className="text-xs text-[#71717A]">Current stock levels per product per size.</p>
    </div>
    <div className="rounded-2xl bg-[#17181C] border border-white/[0.08] overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead className="bg-[#141519] border-b border-white/[0.08] text-[#71717A] font-mono text-[11px]">
          <tr>
            <th className="py-3 px-4">Product</th>
            <th className="py-3 px-4 text-center">S</th>
            <th className="py-3 px-4 text-center">M</th>
            <th className="py-3 px-4 text-center">L</th>
            <th className="py-3 px-4 text-center">XL</th>
            <th className="py-3 px-4 text-center">XXL</th>
            <th className="py-3 px-4 text-center">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.04]">
          {products.map(p => {
            const stock = p.stock as Record<string, number>;
            const total = Object.values(stock).reduce((a, b) => a + b, 0);
            const low = total < p.moq;
            return (
              <tr key={p.id} className="hover:bg-white/[0.02]">
                <td className="py-3 px-4">
                  <div className="font-semibold text-white">{p.name}</div>
                  {low && <span className="text-[9px] text-amber-400 font-mono">LOW STOCK</span>}
                </td>
                {(['S','M','L','XL','XXL'] as const).map(sz => (
                  <td key={sz} className={`py-3 px-4 text-center font-mono ${(stock[sz]||0) < 20 ? 'text-amber-400' : 'text-white'}`}>
                    {stock[sz] || 0}
                  </td>
                ))}
                <td className="py-3 px-4 text-center font-mono font-bold text-[#FF7135]">{total}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {products.length === 0 && <p className="p-6 text-xs text-[#52525B]">No products in catalog.</p>}
    </div>
  </div>
);

// ─────────────────────────── stock adjust (ADMIN ONLY) ───────────────────────
const AdminStockAdjustSection: React.FC<{
  products: any[];
  adjustStock: (input: {
    productId: string;
    adjustmentType: 'Stock In' | 'Stock Out' | 'Set Stock';
    size: string;
    quantity: number;
    reason: string;
  }) => Promise<unknown>;
  refreshProducts: () => Promise<void>;
  showToast: (m: string, t?: any) => void;
}> = ({ products, adjustStock, refreshProducts, showToast }) => {
  const [productId, setProductId] = useState('');
  const [size, setSize] = useState('TOTAL');
  const [adjustmentType, setAdjustmentType] = useState<'Stock In' | 'Stock Out' | 'Set Stock'>('Stock In');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const selected = products.find(p => p.id === productId);
  const totalStock = selected
    ? Object.values(selected.stock as Record<string, number>).reduce((a: number, b: number) => a + b, 0)
    : 0;

  const loadHistory = useCallback(async () => {
    if (!supabase) return;
    setLoadingHistory(true);
    const { data, error } = await supabase
      .from('stock_adjustments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(40);
    if (!error && data) setHistory(data);
    setLoadingHistory(false);
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = Number(quantity);
    if (!productId) return showToast('Select a product first.', 'error');
    if (!Number.isFinite(qty) || qty < 0) return showToast('Enter a valid quantity (0 or more).', 'error');
    if (!reason.trim()) return showToast('A reason is required for the audit log.', 'error');

    setBusy(true);
    try {
      const result: any = await adjustStock({
        productId,
        adjustmentType,
        size,
        quantity: qty,
        reason: reason.trim(),
      });
      showToast(
        `Stock updated: ${result?.previous_quantity ?? '—'} → ${result?.new_quantity ?? '—'} ${size === 'TOTAL' ? 'total' : `size ${size}`}`,
        'success'
      );
      setQuantity('');
      setReason('');
      await refreshProducts();
      await loadHistory();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Stock adjustment failed.', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Stock Adjust</h2>
        <p className="text-xs text-[#71717A]">
          Admin-only stock corrections. Every change is written to the audit history.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <form onSubmit={submit} className="lg:col-span-2 p-5 rounded-2xl bg-[#17181C] border border-white/[0.08] space-y-4">
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1.5">Product</label>
            <select
              value={productId}
              onChange={e => setProductId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#101114] border border-white/10 text-white text-xs focus:outline-none focus:border-[#FF7135]"
            >
              <option value="">Select a garment…</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          {selected && (
            <div className="grid grid-cols-5 gap-1.5">
              {(['S','M','L','XL','XXL'] as const).map(sz => (
                <div key={sz} className="p-2 rounded-lg bg-[#101114] border border-white/[0.06] text-center">
                  <div className="text-[10px] font-mono text-[#FF7135]">{sz}</div>
                  <div className="text-sm font-bold text-white">{selected.stock[sz] || 0}</div>
                </div>
              ))}
              <div className="col-span-5 text-[10px] text-[#71717A] font-mono">TOTAL: {totalStock} pcs</div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1.5">Size</label>
              <select
                value={size}
                onChange={e => setSize(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#101114] border border-white/10 text-white text-xs focus:outline-none focus:border-[#FF7135]"
              >
                <option value="TOTAL">Total (all sizes)</option>
                {['S','M','L','XL','XXL'].map(s => <option key={s} value={s}>Size {s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1.5">Type</label>
              <select
                value={adjustmentType}
                onChange={e => setAdjustmentType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-[#101114] border border-white/10 text-white text-xs focus:outline-none focus:border-[#FF7135]"
              >
                <option value="Stock In">Stock In (+)</option>
                <option value="Stock Out">Stock Out (−)</option>
                <option value="Set Stock">Set Stock (=)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1.5">Quantity</label>
            <input
              type="number"
              min="0"
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              placeholder="Number of pieces"
              className="w-full px-3 py-2 rounded-xl bg-[#101114] border border-white/10 text-white text-xs focus:outline-none focus:border-[#FF7135]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1.5">Reason (audit log)</label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={2}
              placeholder="e.g. Fresh production batch received"
              className="w-full px-3 py-2 rounded-xl bg-[#101114] border border-white/10 text-white text-xs focus:outline-none focus:border-[#FF7135] resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full py-2.5 rounded-xl bg-[#FF7135] hover:bg-[#FF5C1B] text-white font-semibold text-xs uppercase tracking-wider disabled:opacity-50 transition-colors"
          >
            {busy ? 'Applying…' : 'Apply Stock Adjustment'}
          </button>
        </form>

        <div className="lg:col-span-3 rounded-2xl bg-[#17181C] border border-white/[0.08] overflow-x-auto">
          <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
            <span className="text-xs font-semibold text-white">Adjustment History</span>
            <button
              onClick={loadHistory}
              className="flex items-center gap-1 text-[10px] text-[#A1A1AA] hover:text-white"
            >
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
          </div>
          <table className="w-full text-left text-[11px]">
            <thead className="bg-[#141519] text-[#71717A] font-mono text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Product</th>
                <th className="py-2.5 px-3">Type / Size</th>
                <th className="py-2.5 px-3 text-center">Change</th>
                <th className="py-2.5 px-3">Reason</th>
                <th className="py-2.5 px-3">By / When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {history.map(h => {
                const prod = products.find(p => p.id === h.product_id);
                return (
                  <tr key={h.id} className="hover:bg-white/[0.02]">
                    <td className="py-2.5 px-3 font-semibold text-white">{prod?.name || h.product_id}</td>
                    <td className="py-2.5 px-3 text-[#A1A1AA]">
                      {h.adjustment_type} <span className="text-[#FF7135]">/ {h.size}</span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-white">
                      {h.previous_quantity} → <span className="text-emerald-400">{h.new_quantity}</span>
                    </td>
                    <td className="py-2.5 px-3 text-[#71717A] max-w-[160px] truncate" title={h.reason}>{h.reason}</td>
                    <td className="py-2.5 px-3 text-[#71717A]">
                      <div className="truncate max-w-[120px]">{h.admin_email || '—'}</div>
                      <div className="text-[9px]">{h.created_at ? new Date(h.created_at).toLocaleString() : ''}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {history.length === 0 && !loadingHistory && (
            <p className="p-6 text-xs text-[#52525B]">No adjustments recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

const AdminOrdersSection: React.FC<{
  orders: any[];
  updateOrderStatus: (id: string, status: any) => Promise<void>;
  setTrackingOrder: (o: any) => void;
  showToast: (m: string, t?: any) => void;
}> = ({ orders, updateOrderStatus, setTrackingOrder, showToast }) => {
  const [search, setSearch] = useState('');
  const statuses = ['Pending','Confirmed','In Production','Quality Check','Dispatched','Out for Delivery','Delivered'];

  const filtered = orders.filter(o =>
    o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
    o.retailerStore?.toLowerCase().includes(search.toLowerCase())
  );

  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      await updateOrderStatus(orderId, status as any);
    } catch {
      showToast('Failed to update order status', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Order Processing</h2>
          <p className="text-xs text-[#71717A]">All retailer orders — update status and track.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#71717A]" />
          <input
            type="text"
            placeholder="Search orders..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 pr-3 py-2 rounded-xl bg-[#17181C] border border-white/10 text-white text-xs focus:outline-none focus:border-[#FF7135] w-48"
          />
        </div>
      </div>

      <div className="rounded-2xl bg-[#17181C] border border-white/[0.08] overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#141519] border-b border-white/[0.08] text-[#71717A] font-mono text-[11px]">
            <tr>
              <th className="py-3 px-4">Order #</th>
              <th className="py-3 px-4">Retailer</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4 text-right">Total</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {filtered.map(o => (
              <tr key={o.id} className="hover:bg-white/[0.02]">
                <td className="py-3 px-4 font-mono font-bold text-white">{o.orderNumber}</td>
                <td className="py-3 px-4 text-[#A1A1AA]">{o.retailerStore}</td>
                <td className="py-3 px-4 text-[#71717A]">{o.date}</td>
                <td className="py-3 px-4 text-right font-mono text-[#FF7135] font-bold">₹{o.grandTotal?.toLocaleString()}</td>
                <td className="py-3 px-4 text-center">
                  <select
                    value={o.status}
                    onChange={e => handleStatusChange(o.id, e.target.value)}
                    className="bg-[#101114] border border-white/10 text-white text-[11px] rounded-lg px-2 py-1 focus:outline-none focus:border-[#FF7135]"
                  >
                    {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => setTrackingOrder(o)}
                    className="px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-[#FF7135] text-white text-[11px] font-semibold transition-colors"
                  >
                    Track
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="p-6 text-xs text-[#52525B]">No orders match your search.</p>}
      </div>
    </div>
  );
};

// ─────────────────────────── Staff Section ────────────────────────────────────
const AdminStaffSection: React.FC<{
  staffList: FactoryStaff[];
  currentUser: any;
  showToast: (m: string, t?: any) => void;
  onRefresh: () => void;
}> = ({ staffList, currentUser, showToast, onRefresh }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [newStaff, setNewStaff] = useState({
    email: '',
    fullName: '',
    role: 'factory_staff' as 'factory_staff' | 'factory_member' | 'factory_admin',
    password: '',
    showPw: false,
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.email || !newStaff.fullName || !newStaff.password) {
      showToast('Please fill in all fields.', 'error');
      return;
    }
    if (newStaff.password.length < 8) {
      showToast('Password must be at least 8 characters.', 'error');
      return;
    }
    setCreating(true);
    try {
      // Call the existing Edge Function
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bmcqjdbxbeiqksctllzh.supabase.co';
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
      const session = supabase ? (await supabase.auth.getSession()).data.session : null;

      const res = await fetch(`${supabaseUrl}/functions/v1/create-factory-members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || anonKey}`,
        },
        body: JSON.stringify({
          members: [{
            email: newStaff.email.trim().toLowerCase(),
            full_name: newStaff.fullName.trim(),
            role: newStaff.role,
            password: newStaff.password,
          }],
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || 'Edge Function returned an error.');
      }

      showToast(`Staff member ${newStaff.fullName} created successfully!`, 'success');
      setNewStaff({ email: '', fullName: '', role: 'factory_staff', password: '', showPw: false });
      setShowCreateForm(false);
      onRefresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create staff member.';
      showToast(msg, 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (staff: FactoryStaff) => {
    if (!supabase) return;
    if (staff.id === currentUser.id) {
      showToast("You cannot deactivate your own admin account.", 'error');
      return;
    }
    setToggling(staff.id);
    try {
      const { error } = await supabase
        .from('factory_members')
        .update({ is_active: !staff.isActive })
        .eq('id', staff.id);
      if (error) throw error;
      showToast(`${staff.fullName} ${staff.isActive ? 'deactivated' : 'activated'}.`, 'success');
      onRefresh();
    } catch (err) {
      showToast('Failed to update staff status.', 'error');
    } finally {
      setToggling(null);
    }
  };

  const roleBadgeColor: Record<string, string> = {
    factory_admin:  'bg-[#FF7135]/15 text-[#FF7135]',
    factory_staff:  'bg-purple-500/15 text-purple-400',
    factory_member: 'bg-blue-500/15 text-blue-400',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Staff Management</h2>
          <p className="text-xs text-[#71717A]">Create, activate or deactivate factory staff accounts.</p>
        </div>
        <button
          onClick={() => setShowCreateForm(v => !v)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF7135] hover:bg-[#FF5C1B] text-white text-xs font-semibold transition-all shadow-md shadow-[#FF7135]/25"
        >
          <Plus className="w-4 h-4" />
          New Staff Member
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="rounded-2xl bg-[#17181C] border border-[#FF7135]/30 p-6">
          <h3 className="text-sm font-bold text-white mb-4">Create New Staff Member</h3>
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 mb-4 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-300">
              This calls the <span className="font-mono">create-factory-members</span> Edge Function which uses the service-role key on the server side. The password is never stored in the frontend.
            </p>
          </div>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] text-[#A1A1AA] uppercase tracking-wider">Full Name</label>
              <input
                type="text"
                placeholder="Ravi Kumar"
                value={newStaff.fullName}
                onChange={e => setNewStaff(s => ({ ...s, fullName: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#101114] border border-white/10 text-white text-sm focus:outline-none focus:border-[#FF7135]"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] text-[#A1A1AA] uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                placeholder="staff@loopmex.com"
                value={newStaff.email}
                onChange={e => setNewStaff(s => ({ ...s, email: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#101114] border border-white/10 text-white text-sm focus:outline-none focus:border-[#FF7135]"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] text-[#A1A1AA] uppercase tracking-wider">Role</label>
              <select
                value={newStaff.role}
                onChange={e => setNewStaff(s => ({ ...s, role: e.target.value as any }))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#101114] border border-white/10 text-white text-sm focus:outline-none focus:border-[#FF7135]"
              >
                <option value="factory_staff">Factory Staff</option>
                <option value="factory_member">Factory Member (Legacy)</option>
                <option value="factory_admin">Factory Admin</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] text-[#A1A1AA] uppercase tracking-wider">Initial Password</label>
              <div className="relative">
                <input
                  type={newStaff.showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={newStaff.password}
                  onChange={e => setNewStaff(s => ({ ...s, password: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#101114] border border-white/10 text-white text-sm focus:outline-none focus:border-[#FF7135] pr-10"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setNewStaff(s => ({ ...s, showPw: !s.showPw }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-white"
                >
                  {newStaff.showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="md:col-span-2 flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={creating}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF7135] hover:bg-[#FF5C1B] text-white text-xs font-semibold transition-all disabled:opacity-50"
              >
                {creating ? (
                  <><span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />Creating...</>
                ) : (
                  <><Plus className="w-4 h-4" />Create Staff Member</>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-5 py-2.5 rounded-xl bg-white/[0.05] text-[#A1A1AA] hover:text-white text-xs transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Staff Table */}
      <div className="rounded-2xl bg-[#17181C] border border-white/[0.08] overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#141519] border-b border-white/[0.08] text-[#71717A] font-mono text-[11px]">
            <tr>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4">Joined</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {staffList.map(s => (
              <tr key={s.id} className="hover:bg-white/[0.02]">
                <td className="py-3 px-4 font-semibold text-white">
                  {s.fullName}
                  {s.id === currentUser.id && <span className="ml-2 text-[9px] text-[#FF7135] font-mono">YOU</span>}
                </td>
                <td className="py-3 px-4 text-[#71717A]">{s.email}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${roleBadgeColor[s.role] || 'bg-white/10 text-white'}`}>
                    {s.role.replace('factory_', '')}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                    s.isActive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                  }`}>
                    {s.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-3 px-4 text-[#71717A]">
                  {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '—'}
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => handleToggleActive(s)}
                    disabled={toggling === s.id || s.id === currentUser.id}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors disabled:opacity-40 ${
                      s.isActive
                        ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400'
                        : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400'
                    }`}
                  >
                    {toggling === s.id ? '...' : s.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {staffList.length === 0 && <p className="p-6 text-xs text-[#52525B]">No factory staff members yet. Create one above.</p>}
      </div>
    </div>
  );
};
