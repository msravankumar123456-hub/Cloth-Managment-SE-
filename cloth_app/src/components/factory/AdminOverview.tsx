import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  Package, 
  AlertTriangle, 
  Truck, 
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Layers
} from 'lucide-react';
import { OrderStatus } from '../../types';

interface AdminOverviewProps {
  onNavigateTab: (tab: string) => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({ onNavigateTab }) => {
  const { products, orders, retailers, updateOrderStatus, setTrackingOrder } = useApp();

  const totalRevenue = orders.reduce((sum, o) => sum + o.grandTotal, 0);
  const pendingOrders = orders.filter(o => o.status === 'Pending' || o.status === 'Confirmed' || o.status === 'In Production');
  const totalStockUnits = products.reduce((acc, p) => {
    return acc + Object.values(p.stock).reduce((a, b) => a + b, 0);
  }, 0);

  // Find low stock items (< 100 in any size)
  const lowStockProducts = products.filter(p => {
    return Object.values(p.stock).some(qty => qty < 80);
  });

  return (
    <div className="space-y-7">
      
      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl bg-[#17181C] border border-white/[0.08] hover:border-white/15 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-[#A1A1AA]">Factory Gross Volume</span>
            <div className="w-8 h-8 rounded-lg bg-[#FF7135]/15 border border-[#FF7135]/30 flex items-center justify-center text-[#FF7135]">
              ₹
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-2">
            ₹{totalRevenue.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+22.8% direct factory margins</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#17181C] border border-white/[0.08] hover:border-white/15 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-[#A1A1AA]">Active Retail Orders</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-2">
            {pendingOrders.length} In Pipeline
          </div>
          <div className="text-xs text-[#A1A1AA] mt-2">
            {orders.length} total orders across portals
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#17181C] border border-white/[0.08] hover:border-white/15 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-[#A1A1AA]">Verified Retailers</span>
            <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center text-white">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-2">
            {retailers.length} Active Accounts
          </div>
          <div className="text-xs text-[#A1A1AA] mt-2">
            100% GSTIN e-verified
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#17181C] border border-white/[0.08] hover:border-white/15 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-[#A1A1AA]">Available Inventory</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-2">
            {totalStockUnits.toLocaleString()} Pcs
          </div>
          <div className="text-xs text-[#A1A1AA] mt-2">
            Across {products.length} live garment lines
          </div>
        </div>

      </div>

      {/* Production Run Visualizer + Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Weekly Loom Run Activity */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-[#17181C] border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Daily Mill Stitching Output (Pieces)</h3>
              <p className="text-xs text-[#71717A]">Weekly production throughput at Tirupur Unit #2</p>
            </div>
            <span className="text-xs font-mono text-[#FF7135] bg-[#FF7135]/10 px-2.5 py-1 rounded-md border border-[#FF7135]/20">
              Target: 500 pcs/day
            </span>
          </div>

          <div className="grid grid-cols-7 gap-3 pt-4">
            {[
              { day: 'Mon', count: 480, pct: 96, label: 'Shirts' },
              { day: 'Tue', count: 520, pct: 104, label: 'T-Shirts' },
              { day: 'Wed', count: 440, pct: 88, label: 'Denim' },
              { day: 'Thu', count: 510, pct: 102, label: 'Kurtis' },
              { day: 'Fri', count: 490, pct: 98, label: 'Trousers' },
              { day: 'Sat', count: 360, pct: 72, label: 'Packaging' },
              { day: 'Sun', count: 180, pct: 36, label: 'Maintenance' },
            ].map(d => (
              <div key={d.day} className="flex flex-col items-center gap-2">
                <div className="w-full h-32 rounded-xl bg-[#101114] p-1 flex flex-col justify-end">
                  <div 
                    className="w-full rounded-lg bg-gradient-to-t from-[#FF7135] to-[#FFA07A] transition-all duration-500"
                    style={{ height: `${Math.min(100, (d.count / 550) * 100)}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-white font-mono">{d.count}</span>
                <span className="text-[10px] text-[#71717A] font-mono">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alerts Box */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-[#17181C] border border-white/[0.08] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-amber-400 mb-3">
              <AlertTriangle className="w-4 h-4" />
              <h3 className="text-sm font-bold text-white">Size Inventory Alerts</h3>
            </div>
            <p className="text-xs text-[#A1A1AA] mb-4">
              Garment SKUs running low in specific sizes that need new dye-lot runs.
            </p>

            <div className="space-y-3">
              {lowStockProducts.slice(0, 3).map(p => (
                <div key={p.id} className="p-3 rounded-xl bg-[#101114] border border-white/[0.06] text-xs">
                  <div className="font-semibold text-white truncate">{p.name}</div>
                  <div className="flex items-center justify-between text-[#71717A] mt-1">
                    <span>Low in sizes S & XXL</span>
                    <span className="text-amber-400 font-bold font-mono">Reorder Loom</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('inventory')}
            className="mt-6 w-full py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-colors"
          >
            Adjust Stock in Inventory Table →
          </button>
        </div>

      </div>

      {/* Recent Orders Action Queue */}
      <div className="p-6 rounded-2xl bg-[#17181C] border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Recent Factory Orders Queue</h3>
            <p className="text-xs text-[#71717A]">Advance order statuses to test real-time sync with Retailer tracking view</p>
          </div>

          <button
            onClick={() => onNavigateTab('orders')}
            className="text-xs text-[#FF7135] hover:underline font-mono"
          >
            View All Pipeline →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#141519] border-b border-white/[0.08] text-[#71717A] font-mono text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Order #</th>
                <th className="py-2.5 px-3">Retailer Store</th>
                <th className="py-2.5 px-3">Garments</th>
                <th className="py-2.5 px-3 text-center">Pcs</th>
                <th className="py-2.5 px-3 text-right">Invoice Value</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Quick Status Advance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {orders.slice(0, 4).map(o => (
                <tr key={o.id} className="hover:bg-white/[0.02]">
                  <td className="py-3 px-3 font-mono font-bold text-white">{o.orderNumber}</td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-white">{o.retailerStore}</div>
                    <div className="text-[10px] text-[#71717A]">{o.retailerCity}</div>
                  </td>
                  <td className="py-3 px-3 text-[#A1A1AA] truncate max-w-xs">
                    {o.items.map(i => i.product.name).join(', ')}
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-white">{o.totalPieces}</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-[#FF7135]">₹{o.grandTotal.toLocaleString()}</td>
                  <td className="py-3 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      o.status === 'Delivered'
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : o.status === 'Dispatched'
                        ? 'bg-[#FF7135]/20 text-[#FF7135]'
                        : 'bg-amber-500/15 text-amber-400'
                    }`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <select
                      value={o.status}
                      onChange={(e) => updateOrderStatus(o.id, e.target.value as OrderStatus)}
                      className="bg-[#101114] border border-white/10 rounded-lg px-2 py-1 text-[11px] text-[#D4D4D8] focus:outline-none focus:border-[#FF7135]"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="In Production">In Production</option>
                      <option value="Quality Check">Quality Check</option>
                      <option value="Dispatched">Dispatched</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
