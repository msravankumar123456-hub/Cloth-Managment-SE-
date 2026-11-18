import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingBag, 
  AlertTriangle, 
  ArrowUpRight, 
  TrendingUp, 
  CheckCircle,
  Truck
} from 'lucide-react';

export const FactoryShowcase: React.FC = () => {
  const { setCurrentView } = useApp();

  return (
    <section className="py-24 relative bg-[#17181C] border-t border-white/[0.08] overflow-hidden">
      
      {/* Background radial accent */}
      <div className="absolute top-1/4 right-1/4 w-[600px] h-[500px] bg-gradient-radial from-[#FF7135]/10 via-transparent to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-14">
          <div className="text-xs font-mono font-semibold tracking-wider text-[#FF7135] uppercase mb-2">
            Factory Administration
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F5F5F5] leading-tight">
            Your factory.
            <br />
            Your inventory.
            <br />
            <span className="text-[#FF7135]">One clear view.</span>
          </h2>
          <p className="text-base text-[#A1A1AA] mt-4 leading-relaxed">
            Manage your product catalogue, monitor stock, process retailer orders, and coordinate deliveries from a central workspace.
          </p>

          <button
            onClick={() => setCurrentView('factory')}
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF7135] hover:bg-[#FF5C1B] text-white text-sm font-semibold shadow-lg shadow-[#FF7135]/30 transition-all hover:-translate-y-0.5 cursor-pointer"
          >
            <span>Open Factory Dashboard Demo</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {/* Large Dashboard Preview Window */}
        <div className="rounded-2xl bg-[#101114] border border-white/15 shadow-2xl shadow-black/90 overflow-hidden">
          
          {/* Dashboard Window Titlebar */}
          <div className="px-5 py-3.5 bg-[#141519] border-b border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#FF5F56]/80" />
              <div className="w-3 h-3 rounded-full bg-[#FFBD2E]/80" />
              <div className="w-3 h-3 rounded-full bg-[#27C93F]/80" />
              <span className="ml-3 text-xs font-mono text-[#A1A1AA]">Loopmex Mill Operations Suite — Live Production Terminal</span>
            </div>

            <div className="flex items-center gap-3 text-xs text-[#71717A]">
              <span className="flex items-center gap-1.5 text-emerald-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Sync Active
              </span>
            </div>
          </div>

          {/* Dashboard Body with Minimal Sidebar + Main Content */}
          <div className="grid grid-cols-1 md:grid-cols-12 min-h-[500px]">
            
            {/* Minimal Dark Sidebar */}
            <div className="hidden md:block md:col-span-3 lg:col-span-2 bg-[#141519]/70 border-r border-white/[0.06] p-4 space-y-1">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#71717A] px-3 mb-2 font-semibold">
                Control Hub
              </div>
              
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[#FF7135]/15 border border-[#FF7135]/30 text-white font-medium text-xs">
                <LayoutDashboard className="w-4 h-4 text-[#FF7135]" />
                <span>Overview</span>
              </div>

              <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-white/[0.04] transition-colors text-xs font-medium">
                <Package className="w-4 h-4" />
                <span>Products (8)</span>
              </div>

              <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-white/[0.04] transition-colors text-xs font-medium">
                <ShoppingBag className="w-4 h-4" />
                <span>Orders (4)</span>
              </div>

              <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-white/[0.04] transition-colors text-xs font-medium">
                <Users className="w-4 h-4" />
                <span>Retailers (4)</span>
              </div>

              <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-white/[0.04] transition-colors text-xs font-medium">
                <Truck className="w-4 h-4" />
                <span>Deliveries</span>
              </div>

              {/* Low Stock Callout in sidebar */}
              <div className="mt-8 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                <div className="flex items-center gap-1.5 text-amber-400 font-semibold mb-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Stock Alert</span>
                </div>
                <p className="text-[11px] text-[#A1A1AA] leading-tight">
                  Size S in Denim Jeans is running below 30 pcs threshold.
                </p>
              </div>
            </div>

            {/* Main Dashboard Area */}
            <div className="md:col-span-9 lg:col-span-10 p-5 sm:p-7 space-y-6">
              
              {/* Top Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-[#17181C] border border-white/[0.08]">
                  <div className="text-[11px] font-mono text-[#A1A1AA] uppercase">Wholesale Volume</div>
                  <div className="text-xl sm:text-2xl font-bold text-white mt-1">₹2,39,820</div>
                  <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>+18.4% vs last week</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#17181C] border border-white/[0.08]">
                  <div className="text-[11px] font-mono text-[#A1A1AA] uppercase">Active Orders</div>
                  <div className="text-xl sm:text-2xl font-bold text-[#FF7135] mt-1">3 Pending</div>
                  <div className="text-[11px] text-[#A1A1AA] mt-1">1 In Production</div>
                </div>

                <div className="p-4 rounded-xl bg-[#17181C] border border-white/[0.08]">
                  <div className="text-[11px] font-mono text-[#A1A1AA] uppercase">Verified Retailers</div>
                  <div className="text-xl sm:text-2xl font-bold text-white mt-1">4 Stores</div>
                  <div className="text-[11px] text-[#A1A1AA] mt-1">Across 4 major states</div>
                </div>

                <div className="p-4 rounded-xl bg-[#17181C] border border-white/[0.08]">
                  <div className="text-[11px] font-mono text-[#A1A1AA] uppercase">Stocked Units</div>
                  <div className="text-xl sm:text-2xl font-bold text-white mt-1">4,980 Pcs</div>
                  <div className="text-[11px] text-amber-400 mt-1">2 SKUs near MOQ low</div>
                </div>
              </div>

              {/* Grid: Sales Overview Chart + Compact Inventory Table */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* Visual Sales Overview Trend */}
                <div className="lg:col-span-5 p-5 rounded-xl bg-[#17181C] border border-white/[0.08]">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-white font-semibold">Weekly Production Run</h4>
                    <span className="text-xs text-[#FF7135] font-mono">Oct 2026</span>
                  </div>

                  {/* Clean Visual Bar Chart */}
                  <div className="space-y-2.5">
                    {[
                      { day: 'Mon', pcs: 420, max: 500, label: 'Shirts Run' },
                      { day: 'Tue', pcs: 380, max: 500, label: 'T-Shirts' },
                      { day: 'Wed', pcs: 490, max: 500, label: 'Denim Twill' },
                      { day: 'Thu', pcs: 310, max: 500, label: 'Kurtis' },
                      { day: 'Fri', pcs: 460, max: 500, label: 'Linen' },
                    ].map((bar, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-[#A1A1AA] font-mono">{bar.day} — {bar.label}</span>
                          <span className="text-white font-bold">{bar.pcs} pcs</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[#101114] overflow-hidden">
                          <div 
                            className="h-full rounded-full bg-gradient-to-r from-[#FF7135] to-[#FFA07A]" 
                            style={{ width: `${(bar.pcs / bar.max) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Compact Live Inventory Table */}
                <div className="lg:col-span-7 p-5 rounded-xl bg-[#17181C] border border-white/[0.08]">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-white font-semibold">Live Stock by Size Matrix</h4>
                    <span className="text-xs text-emerald-400 font-mono">4 Flagship SKUs</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-white/[0.08] text-[#71717A] font-mono text-[11px]">
                          <th className="py-2">Garment</th>
                          <th className="py-2 text-center">S</th>
                          <th className="py-2 text-center">M</th>
                          <th className="py-2 text-center">L</th>
                          <th className="py-2 text-center">XL</th>
                          <th className="py-2 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        <tr>
                          <td className="py-2.5 font-medium text-white">Oxford Formal Shirt</td>
                          <td className="py-2.5 text-center text-[#A1A1AA]">120</td>
                          <td className="py-2.5 text-center text-[#A1A1AA]">280</td>
                          <td className="py-2.5 text-center text-[#A1A1AA]">340</td>
                          <td className="py-2.5 text-center text-[#A1A1AA]">210</td>
                          <td className="py-2.5 text-right">
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Optimal</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2.5 font-medium text-white">Combed Cotton Tee</td>
                          <td className="py-2.5 text-center text-[#A1A1AA]">450</td>
                          <td className="py-2.5 text-center text-[#A1A1AA]">680</td>
                          <td className="py-2.5 text-center text-[#A1A1AA]">720</td>
                          <td className="py-2.5 text-center text-[#A1A1AA]">430</td>
                          <td className="py-2.5 text-right">
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Optimal</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2.5 font-medium text-white">Classic Denim Jeans</td>
                          <td className="py-2.5 text-center text-amber-400 font-bold">85 ⚠</td>
                          <td className="py-2.5 text-center text-[#A1A1AA]">195</td>
                          <td className="py-2.5 text-center text-[#A1A1AA]">240</td>
                          <td className="py-2.5 text-center text-[#A1A1AA]">160</td>
                          <td className="py-2.5 text-right">
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">Low S</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2.5 font-medium text-white">Chanderi Kurti</td>
                          <td className="py-2.5 text-center text-[#A1A1AA]">90</td>
                          <td className="py-2.5 text-center text-[#A1A1AA]">210</td>
                          <td className="py-2.5 text-center text-[#A1A1AA]">260</td>
                          <td className="py-2.5 text-center text-[#A1A1AA]">180</td>
                          <td className="py-2.5 text-right">
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Optimal</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              {/* Recent Orders Queue Strip */}
              <div className="p-4 rounded-xl bg-[#141519] border border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FF7135]" />
                  <span className="text-white font-medium">Latest: TB-ORD-8941 for <strong>Aura Garments, Mumbai</strong></span>
                  <span className="text-[#A1A1AA] font-mono">270 pcs (₹76,230)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-[#FF7135]/20 text-[#FF7135] font-mono">Delhivery Dispatched</span>
                  <button 
                    onClick={() => setCurrentView('factory')} 
                    className="text-white hover:text-[#FF7135] underline ml-2 cursor-pointer"
                  >
                    Manage Orders →
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
