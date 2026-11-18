import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, 
  Package, 
  Layers, 
  ShoppingBag, 
  Users, 
  Truck, 
  FileText, 
  Settings, 
  ArrowLeft,
  Store,
  ExternalLink,
  ShieldCheck,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { AdminOverview } from './AdminOverview';
import { AdminProducts } from './AdminProducts';
import { AdminInventory } from './AdminInventory';
import { AdminOrders } from './AdminOrders';
import { AdminRetailers } from './AdminRetailers';
import { AdminDeliveries } from './AdminDeliveries';
import { OrderTrackingModal } from '../retailer/OrderTrackingModal';
import { InvoicesView } from '../retailer/InvoicesView';

export const FactoryAdminPortal: React.FC = () => {
  const { 
    currentView, 
    currentUser,
    setCurrentView, 
    orders, 
    products, 
    invoices, 
    trackingOrder, 
    setTrackingOrder, 
    activeInvoice, 
    setActiveInvoice,
    showToast,
    isDatabaseConnected
  } = useApp();

  React.useEffect(() => {
    if (!currentUser || currentUser.role !== 'factory') {
      setCurrentView('factory-auth');
    }
  }, [currentUser, setCurrentView]);

  if (!currentUser || currentUser.role !== 'factory') {
    return null;
  }

  const [activeTab, setActiveTab] = useState<string>('overview');

  const navItems = [
    { id: 'overview', label: 'Overview & KPIs', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'products', label: 'Garment Lines', icon: <Package className="w-4 h-4" />, badge: products.length },
    { id: 'inventory', label: 'Size Stock Matrix', icon: <Layers className="w-4 h-4" /> },
    { id: 'orders', label: 'Order Processing', icon: <ShoppingBag className="w-4 h-4" />, badge: orders.filter(o => o.status !== 'Delivered').length },
    { id: 'retailers', label: 'Retailer Accounts', icon: <Users className="w-4 h-4" /> },
    { id: 'deliveries', label: 'Freight Logistics', icon: <Truck className="w-4 h-4" /> },
    { id: 'invoices', label: 'GST Invoices', icon: <FileText className="w-4 h-4" /> },
    { id: 'settings', label: 'Mill Configuration', icon: <Settings className="w-4 h-4" /> },
  ];

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Factory production configuration saved.', 'success');
  };

  return (
    <div className="min-h-screen bg-[#101114] text-[#F5F5F5] pt-20 pb-16">
      
      {/* Top Banner Bar */}
      <div className="border-b border-white/[0.08] bg-[#141519] py-4 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FF7135]/15 border border-[#FF7135]/30 flex items-center justify-center text-[#FF7135]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white tracking-tight">Loopmex Mill Operations Suite</h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[10px]">
                  Unit #2 Tirupur Active
                </span>
              </div>
              <p className="text-xs text-[#71717A]">
                Synchronized Manufacturing & Retailer Order Dispatch Desk
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentView('retailer')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/10 text-xs text-[#D4D4D8] font-medium transition-all"
            >
              <Store className="w-3.5 h-3.5 text-[#FF7135]" />
              <span>Switch to Retailer Portal</span>
            </button>
            <button
              onClick={() => setCurrentView('landing')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/10 text-xs text-[#D4D4D8] font-medium transition-all"
            >
              <span>Back to Website</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Minimalist Sidebar */}
          <div className="lg:col-span-3 rounded-2xl bg-[#17181C] border border-white/[0.08] p-3 space-y-1">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#71717A] px-3 py-2 font-semibold">
              Factory Navigation
            </div>

            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === item.id
                    ? 'bg-[#FF7135] text-white shadow-md shadow-[#FF7135]/25'
                    : 'text-[#A1A1AA] hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {item.icon}
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                    activeTab === item.id ? 'bg-black/30 text-white' : 'bg-white/10 text-[#D4D4D8]'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}

            <div className="pt-4 mt-4 border-t border-white/[0.06] p-2 text-xs text-[#71717A]">
              <div className={`flex items-center gap-1.5 font-mono text-[11px] mb-1 ${isDatabaseConnected ? 'text-emerald-400' : 'text-amber-400'}`}>
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isDatabaseConnected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                <span>{isDatabaseConnected ? 'Supabase Synced' : 'Local Demo State'}</span>
              </div>
              <p className="text-[10px] text-[#52525B] leading-tight">
                Changes are shared with the retailer portal and saved in this browser.
              </p>
            </div>
          </div>

          {/* Right Main Content Area */}
          <div className="lg:col-span-9 min-h-[500px]">
            {activeTab === 'overview' && <AdminOverview onNavigateTab={(tab) => setActiveTab(tab)} />}
            {activeTab === 'products' && <AdminProducts />}
            {activeTab === 'inventory' && <AdminInventory />}
            {activeTab === 'orders' && <AdminOrders />}
            {activeTab === 'retailers' && <AdminRetailers />}
            {activeTab === 'deliveries' && <AdminDeliveries />}

            {/* Invoices Tab */}
            {activeTab === 'invoices' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white">Factory Invoices Ledger</h2>
                  <p className="text-xs text-[#71717A]">
                    Automated wholesale tax invoices with GSTIN compliance and verification.
                  </p>
                </div>

                <div className="rounded-2xl bg-[#17181C] border border-white/[0.08] overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#141519] border-b border-white/[0.08] text-[#71717A] font-mono text-[11px]">
                      <tr>
                        <th className="py-3 px-4">Invoice #</th>
                        <th className="py-3 px-4">Order Ref</th>
                        <th className="py-3 px-4">Retailer Business</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4 text-center">Pcs</th>
                        <th className="py-3 px-4 text-right">Invoice Total</th>
                        <th className="py-3 px-4 text-center">Payment</th>
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
                          <td className="py-3 px-4 text-center font-mono text-white">{inv.totalPieces}</td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-[#FF7135]">
                            ₹{inv.grandTotal.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              inv.status === 'Paid' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
                            }`}>
                              {inv.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => setActiveInvoice(inv)}
                              className="px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-[#FF7135] text-white text-[11px] font-semibold transition-colors"
                            >
                              Open PDF
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Mill Configuration Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white">Mill & Dispatch Profile Configuration</h2>
                  <p className="text-xs text-[#71717A]">
                    Wholesale production cluster parameters and taxation settings.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-[#17181C] border border-white/[0.08] max-w-2xl">
                  <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                    <div>
                      <label className="block text-[#A1A1AA] mb-1">Mill Entity Legal Name</label>
                      <input
                        type="text"
                        defaultValue="Loopmex Apparel Mills Private Limited"
                        className="w-full px-3.5 py-2 rounded-xl bg-[#101114] border border-white/10 text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[#A1A1AA] mb-1">Manufacturing Unit Location</label>
                        <input
                          type="text"
                          defaultValue="Tirupur Textile Hub, Tamil Nadu"
                          className="w-full px-3.5 py-2 rounded-xl bg-[#101114] border border-white/10 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[#A1A1AA] mb-1">Mill GSTIN</label>
                        <input
                          type="text"
                          defaultValue="33AAACT9812M1Z0"
                          className="w-full px-3.5 py-2 rounded-xl bg-[#101114] border border-white/10 text-white font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[#A1A1AA] mb-1">Applicable Apparel GST Rate</label>
                        <input
                          type="text"
                          disabled
                          defaultValue="5.0% (Indian Standard B2B)"
                          className="w-full px-3.5 py-2 rounded-xl bg-[#101114]/60 border border-white/10 text-[#71717A]"
                        />
                      </div>
                      <div>
                        <label className="block text-[#A1A1AA] mb-1">Primary Freight Partner</label>
                        <input
                          type="text"
                          defaultValue="Delhivery B2B Freight Logistics"
                          className="w-full px-3.5 py-2 rounded-xl bg-[#101114] border border-white/10 text-white"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="mt-4 px-5 py-2.5 rounded-xl bg-[#FF7135] text-white font-semibold shadow-md shadow-[#FF7135]/25"
                    >
                      Update Configuration
                    </button>
                  </form>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>

      {/* Global Modals */}
      <OrderTrackingModal
        order={trackingOrder}
        onClose={() => setTrackingOrder(null)}
      />

      <InvoicesView
        invoice={activeInvoice}
        onClose={() => setActiveInvoice(null)}
      />

    </div>
  );
};
