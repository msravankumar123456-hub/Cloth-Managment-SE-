import React from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowRight, Eye, ShieldCheck } from 'lucide-react';
import { Product } from '../../types';

export const FeaturedCollection: React.FC = () => {
  const { products, setSelectedProductForDetail, setCurrentView } = useApp();

  // Grab the 4 featured products: Formal Shirt, Premium T-Shirt, Denim Jeans, Kurti
  const featured = products.filter(p => p.isFeatured).slice(0, 4);

  const handleProductClick = (product: Product) => {
    setSelectedProductForDetail(product);
  };

  return (
    <section id="collections" className="py-24 relative overflow-hidden bg-[#101114]">
      {/* Background radial accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-radial from-[#FF7135]/10 via-transparent to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14">
          <div>
            <div className="text-xs font-mono font-semibold tracking-wider text-[#FF7135] uppercase mb-2">
              The Collection
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F5F5F5]">
              Made for every kind of retail business.
            </h2>
            <p className="text-base text-[#A1A1AA] mt-2.5 max-w-xl">
              Explore versatile clothing collections, with wholesale pricing and clear stock availability.
            </p>
          </div>

          <div className="mt-6 md:mt-0">
            <button
              onClick={() => setCurrentView('retailer')}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#FF7135] hover:text-[#FFA07A] transition-colors group cursor-pointer"
            >
              <span>View All Products</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        {/* 4 Large Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((product) => {
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
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/30 backdrop-blur-[2px]">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF7135] text-white text-xs font-semibold shadow-xl shadow-[#FF7135]/40 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Specifications</span>
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

                  <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-mono tracking-wider text-[#A1A1AA]">Wholesale Rate</div>
                      <div className="text-lg font-bold text-white flex items-baseline gap-1">
                        <span className="text-[#FF7135]">₹{product.wholesalePrice}</span>
                        <span className="text-xs text-[#71717A] font-normal">/pc</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] uppercase font-mono tracking-wider text-[#71717A]">Min Order</div>
                      <div className="text-xs font-semibold text-[#D4D4D8]">{product.moq} pcs</div>
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
