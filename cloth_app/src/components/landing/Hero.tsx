import React from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowRight, Sparkles, CheckCircle, Package, TrendingUp } from 'lucide-react';
import { GlowOrb } from '../shared/GlowOrb';

export const Hero: React.FC = () => {
  const { setCurrentView, isAuthenticated } = useApp();

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="discover" className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Raycast Pro Ambient Aurora Glow */}
      <GlowOrb variant="mesh" className="top-12 left-1/2 -translate-x-1/2 w-[850px] h-[500px]" />
      <GlowOrb variant="amber" className="-top-10 right-10 w-[400px] h-[400px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Typography & CTAs */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            
            {/* Eyebrow Label (Raycast Pill Style) */}
            <div className="force-white inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#17181C]/90 border border-white/10 text-xs font-medium tracking-wider text-[#A1A1AA] uppercase mb-6 shadow-inner backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF7135] animate-pulse" />
              <span>Wholesale Fashion Platform</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#F5F5F5] leading-[1.08] mb-6">
              Wholesale fashion.
              <br />
              <span className="bg-gradient-to-r from-[#FF7135] via-[#FFA07A] to-[#FF5C1B] bg-clip-text text-transparent">
                Connected to your business.
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-[#A1A1AA] max-w-xl leading-relaxed mb-8 font-normal">
              Discover quality clothing directly from manufacturers. Manage bulk orders, track inventory, and grow your retail business through one simple platform.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto mb-8">
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    setCurrentView('retailer-auth');
                  } else {
                    setCurrentView('retailer');
                  }
                }}
                className="group flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#FF7135] hover:bg-[#FF5C1B] text-white font-medium text-sm transition-all duration-200 shadow-xl shadow-[#FF7135]/25 hover:shadow-[#FF7135]/40 hover:-translate-y-0.5 cursor-pointer"
              >
                <span>Explore Collection</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </button>

            </div>

            {/* Trust Line */}
            <div className="flex items-center gap-2.5 text-xs text-[#71717A]">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/80" />
              <span>Built for manufacturers and independent fashion retailers.</span>
            </div>

          </div>

          {/* Right Column: Editorial Visual Showcase with Floating Interface Badges */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Backglow behind the image */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-[#FF7135]/20 via-[#E11D48]/10 to-transparent rounded-2xl blur-2xl opacity-70 -z-10" />

              {/* Main Editorial Fashion Photography Container */}
              <div className="relative rounded-2xl overflow-hidden border border-white/[0.12] bg-[#17181C] shadow-2xl shadow-black/80 group">
                <img
                  src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=85"
                  alt="Loopmex Garments Editorial Presentation"
                  className="w-full h-[440px] sm:h-[480px] object-cover object-center filter brightness-90 contrast-105 group-hover:scale-105 transition-transform duration-700 ease-out"
                />

                {/* Subtle dark vignette overlay with warm orange reflection */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#101114] via-[#101114]/20 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#101114]/40 via-transparent to-black/20" />

                {/* Integrated bottom garment label */}
                <div className="force-white absolute bottom-4 left-4 right-4 flex items-center justify-between p-3 rounded-xl bg-[#101114]/85 backdrop-blur-md border border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-[#FF7135]" />
                    <span className="text-xs font-semibold">Autumn/Winter 2026 Ready</span>
                  </div>
                  <span className="text-[11px] font-mono">Factory Lot: TB-FW26</span>
                </div>
              </div>

              {/* Floating Badge 1: New Collection Available */}
              <div className="force-white absolute -top-4 -left-4 sm:-left-6 p-2.5 px-3.5 rounded-xl bg-[#17181C]/95 backdrop-blur-xl border border-white/15 shadow-xl shadow-black/60 flex items-center gap-2.5 animate-float-slow select-none">
                <div className="w-6 h-6 rounded-lg bg-[#FF7135]/15 border border-[#FF7135]/30 flex items-center justify-center text-[#FF7135]">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider font-semibold">Catalogue Update</div>
                  <div className="text-xs font-bold">New Collection Available</div>
                </div>
              </div>

              {/* Floating Badge 2: Stock Updated Live */}
              <div className="force-white absolute top-1/2 -right-4 sm:-right-6 -translate-y-1/2 p-2.5 px-3.5 rounded-xl bg-[#17181C]/95 backdrop-blur-xl border border-white/15 shadow-xl shadow-black/60 flex items-center gap-2.5 animate-float-delayed select-none">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <CheckCircle className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider font-semibold">Tirupur Mill</div>
                  <div className="text-xs font-bold">Stock Updated Live</div>
                </div>
              </div>

              {/* Floating Badge 3: Wholesale Pricing Pill */}
              <div className="force-white absolute -bottom-5 left-8 p-3 rounded-xl bg-[#17181C]/95 backdrop-blur-xl border border-white/15 shadow-xl shadow-black/60 flex items-center gap-3 select-none">
                <div className="w-8 h-8 rounded-lg bg-[#FF7135] text-white flex items-center justify-center font-bold text-xs shadow-md shadow-[#FF7135]/30">
                  ₹
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider font-semibold">Direct Mills</div>
                  <div className="text-sm font-bold flex items-baseline gap-1">
                    <span>Wholesale from</span>
                    <span className="text-[#FF7135]">₹180</span>
                    <span className="text-[10px] font-normal">/piece</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
