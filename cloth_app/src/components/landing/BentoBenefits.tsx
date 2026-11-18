import React from 'react';
import { Layers, ShoppingCart, Receipt, Truck, Check, Sparkles, Clock, ArrowRight } from 'lucide-react';
import { GlowOrb } from '../shared/GlowOrb';

export const BentoBenefits: React.FC = () => {
  return (
    <section id="bento-benefits" className="py-24 relative bg-[#101114] overflow-hidden">
      
      {/* Background ambient lighting */}
      <GlowOrb variant="orange" className="-bottom-10 -right-20 w-[600px] h-[600px]" />
      <GlowOrb variant="amber" className="top-10 left-10 w-[400px] h-[400px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#17181C] border border-white/10 text-xs font-mono text-[#FF7135] uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Architecture & Capabilities</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#F5F5F5]">
            Engineered for wholesale precision.
          </h2>
          <p className="text-base text-[#A1A1AA] mt-3">
            Four pillars that turn chaotic garment procurement into an organized, transparent advantage.
          </p>
        </div>

        {/* Bento Grid (Asymmetric Layout) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Panel 1: Large (8 cols) - Inventory without guesswork */}
          <div className="md:col-span-12 lg:col-span-8 p-7 sm:p-8 rounded-2xl bg-[#17181C] border border-white/[0.08] hover:border-white/20 transition-all duration-300 relative overflow-hidden group shadow-xl">
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div className="max-w-md">
                <div className="w-10 h-10 rounded-xl bg-[#FF7135]/15 border border-[#FF7135]/30 flex items-center justify-center text-[#FF7135] mb-5">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight">
                  Inventory without guesswork.
                </h3>
                <p className="text-sm text-[#A1A1AA] mt-2 leading-relaxed">
                  Show size-wise and colour-wise stock visibility in real-time. Know exactly how many pieces are cut, packed, and available across sizes S, M, L, XL, and XXL.
                </p>
              </div>

              {/* Visual Demo of Size & Colour Stock Matrix */}
              <div className="mt-8 p-5 rounded-xl bg-[#101114]/90 border border-white/10 backdrop-blur-md">
                <div className="flex items-center justify-between text-xs font-mono text-[#71717A] pb-3 border-b border-white/[0.08]">
                  <span>SKU: GIZA-SHIRT-WHT</span>
                  <span className="text-emerald-400 font-bold">1,040 units ready</span>
                </div>

                <div className="grid grid-cols-5 gap-2.5 mt-3">
                  {[
                    { size: 'S', qty: 120, pct: 60 },
                    { size: 'M', qty: 280, pct: 90 },
                    { size: 'L', qty: 340, pct: 100 },
                    { size: 'XL', qty: 210, pct: 75 },
                    { size: 'XXL', qty: 90, pct: 45 },
                  ].map((s, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-[#17181C] border border-white/[0.06] text-center">
                      <div className="text-xs font-bold text-[#FF7135]">{s.size}</div>
                      <div className="text-sm font-semibold text-white my-1">{s.qty}</div>
                      <div className="w-full h-1 bg-[#101114] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#FF7135] to-[#FFA07A]" 
                          style={{ width: `${s.pct}%` }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Subtle corner light */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-radial from-[#FF7135]/15 to-transparent blur-2xl pointer-events-none" />
          </div>

          {/* Panel 2: Small (4 cols) - Bulk ordering, simplified */}
          <div className="md:col-span-12 lg:col-span-4 p-7 sm:p-8 rounded-2xl bg-[#17181C] border border-white/[0.08] hover:border-white/20 transition-all duration-300 relative overflow-hidden group shadow-xl">
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-5">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight">
                  Bulk ordering, simplified.
                </h3>
                <p className="text-sm text-[#A1A1AA] mt-2 leading-relaxed">
                  Specify custom ratio quantities, view live tiered wholesale rates, and get instant subtotal calculations.
                </p>
              </div>

              {/* Order summary mini-preview */}
              <div className="mt-8 p-4 rounded-xl bg-[#101114]/90 border border-white/10 space-y-2.5 text-xs">
                <div className="flex justify-between text-[#A1A1AA]">
                  <span>Total Garments</span>
                  <span className="font-semibold text-white">200 Pieces</span>
                </div>
                <div className="flex justify-between text-[#A1A1AA]">
                  <span>Tier Rate</span>
                  <span className="font-semibold text-[#FF7135]">₹180 / pc</span>
                </div>
                <div className="flex justify-between text-[#A1A1AA]">
                  <span>Wholesale Subtotal</span>
                  <span className="font-semibold text-white">₹36,000</span>
                </div>
                <div className="pt-2 border-t border-white/[0.08] flex justify-between font-bold text-white">
                  <span>Carton Total (+ 5% GST)</span>
                  <span className="text-[#FF7135]">₹37,800</span>
                </div>
              </div>
            </div>
          </div>

          {/* Panel 3: Small (4 cols) - Every order accounted for */}
          <div className="md:col-span-12 lg:col-span-4 p-7 sm:p-8 rounded-2xl bg-[#17181C] border border-white/[0.08] hover:border-white/20 transition-all duration-300 relative overflow-hidden group shadow-xl">
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5">
                  <Receipt className="w-5 h-5" />
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight">
                  Every order accounted for.
                </h3>
                <p className="text-sm text-[#A1A1AA] mt-2 leading-relaxed">
                  Full visibility into order status, GSTIN billing records, credit terms, and payment receipts.
                </p>
              </div>

              {/* Invoice pill preview */}
              <div className="mt-8 p-4 rounded-xl bg-[#101114]/90 border border-white/10 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[#D4D4D8]">INV-TB-2026-0891</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-medium text-[10px]">Paid</span>
                </div>
                <div className="text-[11px] text-[#71717A]">GSTIN: 27AABCA1234M1Z5</div>
                <div className="text-sm font-bold text-white pt-1">₹76,230 Verified</div>
              </div>
            </div>
          </div>

          {/* Panel 4: Large (8 cols) - Delivery progress at a glance */}
          <div className="md:col-span-12 lg:col-span-8 p-7 sm:p-8 rounded-2xl bg-[#17181C] border border-white/[0.08] hover:border-white/20 transition-all duration-300 relative overflow-hidden group shadow-xl">
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div className="max-w-md">
                <div className="w-10 h-10 rounded-xl bg-[#FF7135]/15 border border-[#FF7135]/30 flex items-center justify-center text-[#FF7135] mb-5">
                  <Truck className="w-5 h-5" />
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight">
                  Delivery progress at a glance.
                </h3>
                <p className="text-sm text-[#A1A1AA] mt-2 leading-relaxed">
                  Clean order timeline from mill cutting and stitching through quality check, carton packaging, and final freight transit.
                </p>
              </div>

              {/* Clean Timeline Tracker Visual */}
              <div className="mt-8 p-5 rounded-xl bg-[#101114]/90 border border-white/10 backdrop-blur-md">
                <div className="flex items-center justify-between text-xs text-[#A1A1AA] mb-4">
                  <span>Consignment: <strong>DEL-B2B-98471204</strong></span>
                  <span className="text-[#FF7135] font-mono">In Transit (Delhivery)</span>
                </div>

                <div className="grid grid-cols-4 gap-2 relative">
                  {[
                    { label: 'Confirmed', state: 'done' },
                    { label: 'Production', state: 'done' },
                    { label: 'Dispatched', state: 'current' },
                    { label: 'Store Delivery', state: 'pending' },
                  ].map((t, idx) => (
                    <div key={idx} className="flex flex-col items-center text-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-2 ${
                        t.state === 'done' 
                          ? 'bg-emerald-500 text-black' 
                          : t.state === 'current'
                          ? 'bg-[#FF7135] text-white ring-4 ring-[#FF7135]/20 animate-pulse'
                          : 'bg-white/10 text-[#71717A]'
                      }`}>
                        {t.state === 'done' ? <Check className="w-4 h-4 stroke-[3]" /> : idx + 1}
                      </div>
                      <span className={`text-[11px] font-medium ${t.state === 'current' ? 'text-white' : 'text-[#71717A]'}`}>
                        {t.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Subtle glow */}
            <div className="absolute -bottom-8 right-0 w-64 h-64 bg-gradient-radial from-[#FF7135]/10 to-transparent blur-2xl pointer-events-none" />
          </div>

        </div>

      </div>
    </section>
  );
};
