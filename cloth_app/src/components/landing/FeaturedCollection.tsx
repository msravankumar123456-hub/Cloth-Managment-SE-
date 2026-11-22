import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowRight, Eye, Sparkles, ShoppingBag, Layers, Flame } from 'lucide-react';
import { Product, ClothingCategory } from '../../types';

export const FeaturedCollection: React.FC = () => {
  const { products, setSelectedProductForDetail, setCurrentView } = useApp();
  const [activeTab, setActiveTab] = useState<'All' | 'Sarees' | 'Dresses' | 'Shirts' | 'Kurtis' | 'Denim'>('All');

  // Filter products based on active collection exploration tab
  const displayedProducts = React.useMemo(() => {
    if (activeTab === 'All') {
      return products.slice(0, 8);
    }
    return products.filter(p => p.category === activeTab);
  }, [products, activeTab]);

  const handleProductClick = (product: Product) => {
    setSelectedProductForDetail(product);
  };

  const tabs: { id: 'All' | 'Sarees' | 'Dresses' | 'Shirts' | 'Kurtis' | 'Denim'; label: string; icon?: string }[] = [
    { id: 'All', label: 'All Collections' },
    { id: 'Sarees', label: '🥻 Sarees Collection' },
    { id: 'Dresses', label: '👗 Dresses Collection' },
    { id: 'Shirts', label: '👔 Formal & Casual' },
    { id: 'Kurtis', label: '👚 Designer Kurtis' },
    { id: 'Denim', label: '👖 Denim & Jeans' },
  ];

  return (
    <section id="collections" className="py-24 relative overflow-hidden bg-[#101114]">
      {/* Background radial accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-radial from-[#FF7135]/10 via-transparent to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold tracking-wider text-[#FF7135] uppercase mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Mill Collections & Catalogues</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#F5F5F5]">
              Curated for Retailers & Boutiques.
            </h2>
            <p className="text-sm sm:text-base text-[#A1A1AA] mt-2 max-w-2xl leading-relaxed">
              Explore specialized clothing sections including our new <strong>Sarees</strong> and <strong>Dresses</strong> ranges with wholesale volume pricing and ready-to-dispatch inventory.
            </p>
          </div>

          <div className="mt-6 md:mt-0">
            <button
              onClick={() => setCurrentView('retailer')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.05] hover:bg-[#FF7135] text-white text-xs font-bold uppercase tracking-wider transition-all duration-200 border border-white/10 hover:border-[#FF7135] group cursor-pointer shadow-lg shadow-black/40"
            >
              <span>Explore Entire Catalogue</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        {/* Collection Exploration Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer border flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#FF7135] border-[#FF7135] text-white shadow-lg shadow-[#FF7135]/30 ring-2 ring-[#FF7135]/20'
                    : 'bg-[#17181C] border-white/10 text-[#A1A1AA] hover:text-white hover:border-white/20'
                }`}
              >
                <span>{tab.label}</span>
                {tab.id === 'Sarees' && (
                  <span className="px-1.5 py-0.2 rounded bg-amber-400 text-black font-mono text-[9px] font-black uppercase ml-1">
                    NEW
                  </span>
                )}
                {tab.id === 'Dresses' && (
                  <span className="px-1.5 py-0.2 rounded bg-emerald-400 text-black font-mono text-[9px] font-black uppercase ml-1">
                    NEW
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Dynamic Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayedProducts.map((product) => {
            const totalStock = Object.values(product.stock).reduce((a, b) => a + b, 0);

            return (
              <div
                key={product.id}
                onClick={() => handleProductClick(product)}
                className="group relative rounded-2xl bg-[#17181C] border border-white/[0.08] hover:border-[#FF7135]/40 transition-all duration-300 overflow-hidden flex flex-col cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-black/70 hover:-translate-y-1"
              >
                {/* Image Container with Subtle Zoom on Hover */}
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#141519]">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover object-center filter brightness-95 group-hover:scale-105 group-hover:brightness-100 transition-transform duration-500 ease-out"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/pants/classic-indigo-jeans.jpg';
                    }}
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#17181C] via-transparent to-black/20 opacity-80 group-hover:opacity-60 transition-opacity" />

                  {/* Category Pill Tag */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-[#101114]/80 backdrop-blur-md border border-white/10 text-[11px] font-medium text-[#D4D4D8]">
                    {product.category}
                  </div>

                  {/* Stock Availability Badge */}
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-950/70 border border-emerald-500/20 text-[10px] font-semibold text-emerald-400 backdrop-blur-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>{totalStock} in stock</span>
                  </div>

                  {/* Quick Action Reveal on Hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-[2px]">
                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF7135] text-white text-xs font-bold shadow-xl shadow-[#FF7135]/40 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <Eye className="w-4 h-4" />
                      <span>View Specifications & Buy</span>
                    </div>
                  </div>
                </div>

                {/* Card Content Details */}
                <div className="p-5 flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-white tracking-tight group-hover:text-[#FF7135] transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-xs text-[#71717A] mt-1 line-clamp-1 font-mono">
                      {product.fabric}
                    </p>
                  </div>

                  {/* Pricing and MOQ Details */}
                  <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-[#71717A] uppercase block">
                        Wholesale Rate
                      </span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-lg font-bold text-white font-mono">
                          ₹{product.wholesalePrice.toLocaleString()}
                        </span>
                        <span className="text-[11px] text-[#71717A] line-through font-mono">
                          ₹{product.retailMrp.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-mono text-[#71717A] uppercase block">
                        MOQ
                      </span>
                      <span className="text-xs font-mono font-semibold text-[#FF7135]">
                        {product.moq} pcs
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
