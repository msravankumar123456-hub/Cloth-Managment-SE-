import React from 'react';
import { Factory, BadgePercent, Grid3X3, Layers } from 'lucide-react';

export const TrustStrip: React.FC = () => {
  const benefits = [
    {
      icon: <Factory className="w-4 h-4 text-[#A1A1AA]" />,
      title: 'Direct Factory Access',
      subtitle: 'Zero intermediary markups',
    },
    {
      icon: <BadgePercent className="w-4 h-4 text-[#A1A1AA]" />,
      title: 'Transparent Wholesale Pricing',
      subtitle: 'Clear tiered rate cards in INR',
    },
    {
      icon: <Grid3X3 className="w-4 h-4 text-[#A1A1AA]" />,
      title: 'Size-wise Stock Visibility',
      subtitle: 'Real-time S to XXL inventory',
    },
    {
      icon: <Layers className="w-4 h-4 text-[#A1A1AA]" />,
      title: 'Bulk Order Management',
      subtitle: 'Unified tracking & dispatch',
    },
  ];

  return (
    <section className="force-white relative z-20 border-y border-white/[0.08] bg-[#141519]/80 backdrop-blur-md py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-white/[0.08]">
          {benefits.map((b, idx) => (
            <div 
              key={idx} 
              className={`flex items-center gap-3.5 ${idx !== 0 ? 'pt-4 md:pt-0 md:pl-6' : ''}`}
            >
              <div className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.06] shrink-0 text-white">
                {b.icon}
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#F5F5F5] tracking-tight">{b.title}</h4>
                <p className="text-xs text-[#71717A] mt-0.5">{b.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
