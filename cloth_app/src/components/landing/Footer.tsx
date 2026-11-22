import React from 'react';
import { useApp } from '../../context/AppContext';

export const Footer: React.FC = () => {
  const { setCurrentView, isAuthenticated } = useApp();

  const scrollTo = (id: string) => {
    setCurrentView('landing');
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <footer className="bg-[#0B0C0E] border-t border-white/[0.06] py-14 text-xs text-[#71717A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/[0.06]">
          
          {/* Brand & Description */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#17181C] border border-white/10 flex items-center justify-center text-[#FF7135]">
                <svg className="w-3.5 h-3.5 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 1 3 3c0 .8-.4 1.5-1 2L2 16h20L13 7a3 3 0 0 1-1-5z" />
                  <path d="M2 16v2a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2" />
                </svg>
              </div>
              <span className="font-bold tracking-tight text-white text-sm">Loopmex</span>
            </div>

            <p className="text-xs text-[#A1A1AA] leading-relaxed max-w-sm">
              A premium clothing management system connecting garment manufacturers and independent fashion retailers with real-time stock matrix visibility and bulk purchasing.
            </p>

            <div className="text-[11px] text-[#71717A]">
              Academic Software Engineering Project Prototype.
            </div>
          </div>

          {/* Quick Platform Links */}
          <div className="md:col-span-3 space-y-3">
            <div className="text-xs font-mono uppercase text-white font-semibold">Wholesale Platform</div>
            <ul className="space-y-2 text-[#A1A1AA]">
              <li>
                <button 
                  onClick={() => {
                    if (!isAuthenticated) {
                      setCurrentView('retailer-auth');
                    } else {
                      setCurrentView('retailer');
                    }
                  }} 
                  className="hover:text-[#FF7135] transition-colors cursor-pointer"
                >
                  Explore Collection
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    if (!isAuthenticated) {
                      setCurrentView('retailer-auth');
                    } else {
                      setCurrentView('retailer');
                    }
                  }} 
                  className="hover:text-[#FF7135] transition-colors cursor-pointer"
                >
                  Retailer Portal
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('factory')} className="hover:text-[#FF7135] transition-colors cursor-pointer">
                  Factory Dashboard
                </button>
              </li>
            </ul>
          </div>

          {/* Compliance & Contact */}
          <div className="md:col-span-4 space-y-3">
            <div className="text-xs font-mono uppercase text-white font-semibold">Direct Communication</div>
            <ul className="space-y-2 text-[#A1A1AA]">
              <li>
                <button onClick={() => scrollTo('about-contact')} className="hover:text-white transition-colors cursor-pointer">
                  Contact Factory Desk
                </button>
              </li>
              <li>
                <span className="text-[#71717A]">Privacy Policy (Demonstration Only)</span>
              </li>
              <li>
                <span className="text-[#71717A]">Wholesale Terms of Trade (B2B Standard)</span>
              </li>
              <li>
                <span className="text-[#71717A]">HSN / GST Rate Classifications (5% Flat)</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Strip */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#52525B]">
          <div>
            © 2026 Loopmex Apparel Technologies. Designed with precision inspiration from Raycast Pro.
          </div>
          <div className="flex items-center gap-4">
            <span>Graphite & Orange Design System</span>
            <span>•</span>
            <span>Tirupur & Surat Wholesale Hubs</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
