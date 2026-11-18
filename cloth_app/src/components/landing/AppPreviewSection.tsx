import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Plus, Check, Layers, SlidersHorizontal, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { GlowOrb } from '../shared/GlowOrb';

export const AppPreviewSection: React.FC = () => {
  const { setCurrentView, addToCart } = useApp();
  const [activeCategory, setActiveCategory] = useState<'All' | 'Shirts' | 'T-Shirts' | 'Denim'>('Shirts');
  const [selectedSize, setSelectedSize] = useState<'M' | 'L' | 'XL'>('L');
  const [selectedColor, setSelectedColor] = useState('Classic White');
  const [quantity, setQuantity] = useState(40);
  const [added, setAdded] = useState(false);

  const previewItem = {
    name: "Men's Oxford Formal Shirt",
    fabric: "100% Giza Cotton (80s 2-Ply)",
    price: 380,
    mrp: 1499,
    moq: 40,
    availableStock: 340,
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80",
    colors: ['Classic White', 'Sky Blue', 'Charcoal Grey'],
  };

  const handleSimulatedAdd = () => {
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <section className="py-24 relative overflow-hidden bg-[#101114]">
      {/* Background Glow */}
      <GlowOrb variant="crimson" className="top-1/3 -left-32 w-[500px] h-[500px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headings & Feature Highlights */}
          <div className="lg:col-span-5 flex flex-col items-start">
            <div className="text-xs font-mono font-semibold tracking-wider text-[#FF7135] uppercase mb-2">
              Retailer Experience
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F5F5F5] leading-tight">
              Everything your wholesale business needs.
            </h2>

            <p className="text-base text-[#A1A1AA] mt-4 leading-relaxed">
              Find products, manage bulk quantities, and keep your purchasing workflow organised in one place.
            </p>

            {/* Feature Highlights Grid */}
            <div className="mt-8 space-y-4 w-full">
              {[
                { title: 'Clear product information', desc: 'Fabric composition, GSM specifications, and margin calculators.' },
                { title: 'Accurate variant selection', desc: 'Break down bulk orders across S, M, L, XL, and XXL easily.' },
                { title: 'Convenient bulk purchasing', desc: 'Single-click order generation with transparent tiered rate cards.' },
                { title: 'Organised order history', desc: 'Track dispatches, inspect packaging slips, and access GST invoices.' },
              ].map((feat, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/10 transition-colors">
                  <div className="w-5 h-5 rounded-full bg-[#FF7135]/10 border border-[#FF7135]/30 flex items-center justify-center text-[#FF7135] shrink-0 mt-0.5">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">{feat.title}</h4>
                    <p className="text-xs text-[#71717A] mt-0.5">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setCurrentView('retailer')}
              className="mt-8 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#17181C] hover:bg-[#1F2025] border border-white/10 text-sm font-semibold text-white transition-all hover:border-[#FF7135]/40"
            >
              <span>Launch Live Retailer Catalogue</span>
              <ArrowRight className="w-4 h-4 text-[#FF7135]" />
            </button>
          </div>

          {/* Right Column: Dark Framed Desktop Application Window Preview (Raycast Style) */}
          <div className="lg:col-span-7">
            <div className="relative rounded-2xl bg-[#17181C] border border-white/15 shadow-2xl shadow-black/90 overflow-hidden">
              
              {/* Window Header with macOS / Raycast Dots */}
              <div className="px-4 py-3 bg-[#141519] border-b border-white/[0.08] flex items-center justify-between select-none">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#FF5F56]/80" />
                  <div className="w-3 h-3 rounded-full bg-[#FFBD2E]/80" />
                  <div className="w-3 h-3 rounded-full bg-[#27C93F]/80" />
                  <span className="ml-3 text-xs font-mono text-[#71717A]">Loopmex Client v2.4 — Wholesale Catalog</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-[#A1A1AA]">
                  <span className="px-2 py-0.5 rounded bg-white/[0.05] border border-white/10">B2B Live</span>
                </div>
              </div>

              {/* Inside App: Search Bar & Filters */}
              <div className="p-4 sm:p-6 bg-[#101114]/90 space-y-5">
                
                {/* Search & Category Pills */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      readOnly
                      value="Oxford Cotton Formals"
                      className="w-full bg-[#17181C] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-[#71717A] focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 p-1 bg-[#17181C] rounded-xl border border-white/10 text-xs">
                    {(['All', 'Shirts', 'T-Shirts', 'Denim'] as const).map(cat => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                          activeCategory === cat ? 'bg-[#FF7135] text-white' : 'text-[#A1A1AA] hover:text-white'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Main Product Card Preview inside App Frame */}
                <div className="p-4 rounded-xl bg-[#17181C] border border-white/[0.08] grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                  
                  {/* Thumbnail */}
                  <div className="sm:col-span-4 aspect-[4/5] rounded-lg overflow-hidden bg-[#141519] border border-white/10 relative">
                    <img
                      src={previewItem.image}
                      alt={previewItem.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] text-white font-mono">
                      80s 2-Ply
                    </div>
                  </div>

                  {/* Specifications & Interactive Form */}
                  <div className="sm:col-span-8 flex flex-col justify-between space-y-3.5">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[#FF7135] font-mono font-medium">MILL CERTIFIED #902</span>
                        <span className="text-xs text-emerald-400 font-medium">Ready Stock: {previewItem.availableStock} pcs</span>
                      </div>
                      <h4 className="text-base font-bold text-white mt-1">{previewItem.name}</h4>
                      <p className="text-xs text-[#71717A] mt-0.5">{previewItem.fabric}</p>
                    </div>

                    {/* Color Selector */}
                    <div>
                      <span className="text-[11px] text-[#A1A1AA] uppercase font-mono tracking-wider">Colorway:</span>
                      <div className="flex items-center gap-2 mt-1.5">
                        {previewItem.colors.map(col => (
                          <button
                            key={col}
                            onClick={() => setSelectedColor(col)}
                            className={`px-2.5 py-1 rounded-lg text-xs transition-colors border ${
                              selectedColor === col 
                                ? 'bg-white/10 border-[#FF7135] text-white font-medium' 
                                : 'border-white/10 text-[#A1A1AA] hover:border-white/20'
                            }`}
                          >
                            {col}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Size Selector */}
                    <div>
                      <span className="text-[11px] text-[#A1A1AA] uppercase font-mono tracking-wider">Size:</span>
                      <div className="flex items-center gap-2 mt-1.5">
                        {(['M', 'L', 'XL'] as const).map(sz => (
                          <button
                            key={sz}
                            onClick={() => setSelectedSize(sz)}
                            className={`w-8 h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-all border ${
                              selectedSize === sz 
                                ? 'bg-[#FF7135] border-[#FF7135] text-white shadow-md shadow-[#FF7135]/30' 
                                : 'border-white/10 text-[#A1A1AA] hover:text-white bg-[#141519]'
                            }`}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Pricing & Add Action Bar */}
                    <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                      <div>
                        <div className="text-[10px] uppercase font-mono text-[#71717A]">Wholesale Rate</div>
                        <div className="text-lg font-bold text-white flex items-baseline gap-1">
                          <span className="text-[#FF7135]">₹{previewItem.price}</span>
                          <span className="text-xs text-[#71717A] line-through">₹{previewItem.mrp} MRP</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-right mr-2 hidden sm:block">
                          <div className="text-[10px] text-[#71717A] font-mono">MOQ</div>
                          <div className="text-xs font-semibold text-white">{previewItem.moq} pcs</div>
                        </div>

                        <button
                          onClick={handleSimulatedAdd}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                            added 
                              ? 'bg-emerald-600 text-white' 
                              : 'bg-[#FF7135] hover:bg-[#FF5C1B] text-white shadow-lg shadow-[#FF7135]/30'
                          }`}
                        >
                          {added ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Added to Order</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add to Order</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                  </div>

                </div>

                {/* Order Summary Strip Inside Preview */}
                <div className="p-3 rounded-lg bg-[#141519] border border-white/[0.06] flex items-center justify-between text-xs text-[#A1A1AA]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Auto-calculated Carton Logistics: <strong>Delhivery Freight</strong></span>
                  </div>
                  <span className="font-mono text-[#D4D4D8]">GSTIN Verified 5% Rate</span>
                </div>

              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
