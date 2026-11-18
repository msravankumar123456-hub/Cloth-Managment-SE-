import React from 'react';
import { useApp } from '../../context/AppContext';
import { Store, Factory, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export const AccessPortals: React.FC = () => {
  const { setCurrentView } = useApp();

  return (
    <section className="py-20 relative bg-[#141519] border-t border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-xl mx-auto mb-14">
          <div className="text-xs font-mono font-semibold tracking-wider text-[#FF7135] uppercase mb-2">
            Instant Prototype Access
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Choose your portal.
          </h2>
          <p className="text-sm text-[#A1A1AA] mt-2">
            Full interactive experience without credentials. Seamlessly explore both sides of the wholesale pipeline.
          </p>
        </div>

        {/* Dual Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          
          {/* Card 1: For Retailers */}
          <div className="p-8 sm:p-9 rounded-2xl bg-[#17181C] border border-white/[0.08] hover:border-[#FF7135]/40 transition-all duration-300 flex flex-col justify-between group shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-radial from-[#FF7135]/10 to-transparent blur-2xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#FF7135]/15 border border-[#FF7135]/30 flex items-center justify-center text-[#FF7135]">
                  <Store className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-white/[0.04] text-[#A1A1AA] border border-white/10 flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-[#FF7135]" />
                  Demo Retailer Mode
                </span>
              </div>

              <h3 className="text-2xl font-bold text-white tracking-tight group-hover:text-[#FF7135] transition-colors">
                Find your next collection.
              </h3>

              <p className="text-sm text-[#A1A1AA] mt-3 leading-relaxed">
                Browse available garments, compare wholesale prices, place bulk orders, and follow your purchases from mill dispatch to store delivery.
              </p>

              <div className="mt-6 space-y-2 text-xs text-[#71717A]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Real-time S to XXL size matrix ordering</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Interactive cart & simulated payment checkout</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/[0.06]">
              <button
                onClick={() => setCurrentView('retailer')}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#FF7135] hover:bg-[#FF5C1B] text-white font-medium text-sm transition-all duration-200 shadow-xl shadow-[#FF7135]/25 hover:shadow-[#FF7135]/40 hover:-translate-y-0.5 cursor-pointer"
              >
                <span>Enter Retailer Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card 2: For Factory Administrators */}
          <div className="p-8 sm:p-9 rounded-2xl bg-[#17181C] border border-white/[0.08] hover:border-white/20 transition-all duration-300 flex flex-col justify-between group shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-radial from-white/[0.05] to-transparent blur-2xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-white">
                  <Factory className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-white/[0.04] text-[#A1A1AA] border border-white/10 flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-emerald-400" />
                  Admin Terminal
                </span>
              </div>

              <h3 className="text-2xl font-bold text-white tracking-tight">
                Manage your operations.
              </h3>

              <p className="text-sm text-[#A1A1AA] mt-3 leading-relaxed">
                Control products, inventory, retailer orders, invoices, and delivery updates from one workspace. Updates sync directly to the retailer portal.
              </p>

              <div className="mt-6 space-y-2 text-xs text-[#71717A]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Size-wise inventory editor with low stock alerts</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Live order status pipeline (Pending to Delivered)</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/[0.06]">
              <button
                onClick={() => setCurrentView('factory')}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#23252B] hover:bg-[#2B2E36] border border-white/10 text-white font-medium text-sm transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
              >
                <span>Open Factory Dashboard</span>
                <ArrowRight className="w-4 h-4 text-[#A1A1AA]" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
