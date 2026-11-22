import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ShoppingBag, Menu, X, ArrowUpRight, LayoutDashboard, Store, User, ShieldCheck, Sun, Moon } from 'lucide-react';

export const TopNav: React.FC = () => {
  const { currentView, setCurrentView, cart, setIsCartOpen, isAuthenticated, currentUser, logout, theme, toggleTheme } = useApp();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Cart / checkout entry points are hidden for factory members and guests.
  const canOrder = currentUser?.role === 'retailer';

  const totalCartCount = cart.reduce((acc, item) => acc + item.totalQuantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (sectionId: string) => {
    setMobileMenuOpen(false);
    if (currentView !== 'landing') {
      setCurrentView('landing');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <header 
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled 
          ? 'bg-[#101114]/85 backdrop-blur-xl border-b border-white/[0.08] shadow-lg shadow-black/40 py-3' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Left: Hanger Logo + Wordmark and Dark/Bright Mode Toggle Down of It */}
          <div className="flex flex-col items-start gap-1">
            <div 
              onClick={() => setCurrentView('landing')}
              className="flex items-center gap-2.5 cursor-pointer group select-none"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1E2026] to-[#141519] border border-white/10 flex items-center justify-center text-[#FF7135] shadow-inner group-hover:border-[#FF7135]/40 transition-colors">
                {/* Clothing Hanger Icon */}
                <svg className="w-4 h-4 stroke-current transition-transform duration-300 group-hover:scale-105" viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 1 3 3c0 .8-.4 1.5-1 2L2 16h20L13 7a3 3 0 0 1-1-5z" />
                  <path d="M2 16v2a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2" />
                </svg>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-semibold tracking-tight text-white text-base">Loopmex</span>
                <span className="text-[10px] font-mono tracking-wider uppercase px-1.5 py-0.5 rounded text-[#FF7135] bg-[#FF7135]/10 border border-[#FF7135]/20">
                  PRO
                </span>
              </div>
            </div>

            {/* Dark Mode & Bright Mode Switch Button */}
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium border transition-all cursor-pointer bg-white/[0.06] hover:bg-white/15 text-[#D4D4D8] border-white/10 hover:border-[#FF7135]/50 shadow-sm"
              title="Switch between Dark Mode and Bright Mode"
              aria-label="Switch between Dark and Bright Mode"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3 h-3 text-amber-400 animate-pulse" />
                  <span className="text-amber-300">Bright Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-3 h-3 text-indigo-500" />
                  <span className="text-indigo-600 font-semibold">Dark Mode</span>
                </>
              )}
            </button>
          </div>

          {/* Centre Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#A1A1AA]">
            <button 
              onClick={() => handleNavClick('discover')} 
              className="hover:text-white transition-colors cursor-pointer"
            >
              Discover
            </button>
            <button 
              onClick={() => handleNavClick('collections')} 
              className="hover:text-white transition-colors cursor-pointer"
            >
              All Garments
            </button>
            <button 
              onClick={() => setCurrentView('retailer')} 
              className="hover:text-white transition-colors cursor-pointer"
            >
              Retailer Portal
            </button>
            <button 
              onClick={() => setCurrentView('factory')} 
              className="hover:text-white transition-colors cursor-pointer"
            >
              Factory Portal
            </button>
          </nav>

          {/* Right Section: Cart & Primary CTAs */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Shopping Cart Trigger — retailers only */}
            {canOrder && (
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 rounded-xl bg-[#17181C] border border-white/[0.08] hover:border-white/20 text-[#A1A1AA] hover:text-white transition-all"
                title="View Bulk Cart"
                aria-label="View Cart"
              >
                <ShoppingBag className="w-4 h-4" />
                {totalCartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FF7135] text-white text-[10px] font-bold flex items-center justify-center">
                    {totalCartCount > 99 ? '99+' : totalCartCount}
                  </span>
                )}
              </button>
            )}

            {/* Sign In / Account */}
            {isAuthenticated && currentUser ? (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#FF7135]/20 border border-[#FF7135]/40 flex items-center justify-center text-[#FF7135]">
                  <User className="w-4 h-4" />
                </div>
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-semibold text-white">{currentUser.name}</span>
                  <span className="text-[10px] text-[#A1A1AA]">
                    {currentUser.role === 'admin'
                      ? 'Factory Admin'
                      : currentUser.role === 'factory'
                      ? 'Factory Staff'
                      : currentUser.isNewRetailer
                      ? 'New Retailer'
                      : 'Retailer'}
                  </span>
                </div>
                <button
                  onClick={() => logout()}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.10] border border-white/10 text-xs text-[#A1A1AA] hover:text-white transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => setCurrentView('retailer-auth')}
                className="text-sm font-medium text-[#A1A1AA] hover:text-white transition-colors px-2"
              >
                Sign In
              </button>
            )}

            {!isAuthenticated && (
              <button
                onClick={() => setCurrentView('factory-auth')}
                className="text-sm font-medium text-[#A1A1AA] hover:text-white transition-colors px-2"
              >
                Factory Login
              </button>
            )}

            {/* Primary Orange CTA */}
            <button
              onClick={() => setCurrentView('retailer')}
              className="group flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF7135] hover:bg-[#FF5C1B] text-white font-medium text-sm transition-all duration-200 shadow-lg shadow-[#FF7135]/25 hover:shadow-[#FF7135]/40 hover:-translate-y-0.5"
            >
              <span>Explore Collection</span>
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>

            {/* Admin Login Icon — immediately RIGHT of Explore Collection */}
            <div className="relative group/admin">
              <button
                onClick={() => setCurrentView('admin-auth')}
                className="w-9 h-9 rounded-full bg-[#17181C] border border-white/[0.08] hover:border-[#FF7135]/50 flex items-center justify-center text-[#FF7135] transition-all hover:bg-[#FF7135]/10"
                aria-label="Admin Login"
              >
                <ShieldCheck className="w-4 h-4" />
              </button>
              <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[10px] text-[#A1A1AA] whitespace-nowrap opacity-0 group-hover/admin:opacity-100 transition-opacity pointer-events-none bg-[#17181C] px-1.5 py-0.5 rounded">
                Admin Login
              </span>
            </div>
          </div>

          {/* Mobile Actions: Cart & Menu Hamburger */}
          <div className="flex lg:hidden items-center gap-2">
            {canOrder && (
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 rounded-lg bg-[#17181C] border border-white/10 text-[#A1A1AA]"
                aria-label="Cart"
              >
                <ShoppingBag className="w-4 h-4" />
                {totalCartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FF7135] text-white text-[10px] font-bold flex items-center justify-center">
                    {totalCartCount}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-[#17181C] border border-white/10 text-[#A1A1AA] hover:text-white"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-3 px-4 py-6 bg-[#17181C]/98 border-b border-white/10 backdrop-blur-2xl">
          <div className="flex flex-col gap-4 text-sm font-medium text-[#A1A1AA]">
            {/* View Switcher Mobile */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-[#101114] rounded-xl border border-white/10 mb-2">
              <button
                onClick={() => { setCurrentView('landing'); setMobileMenuOpen(false); }}
                className={`py-2 text-xs rounded-lg text-center ${currentView === 'landing' ? 'bg-white/10 text-white font-bold' : ''}`}
              >
                Website
              </button>
              <button
                onClick={() => { setCurrentView('retailer'); setMobileMenuOpen(false); }}
                className={`py-2 text-xs rounded-lg text-center ${currentView === 'retailer' ? 'bg-[#FF7135] text-white font-bold' : ''}`}
              >
                Retailer
              </button>
              <button
                onClick={() => { setCurrentView('factory'); setMobileMenuOpen(false); }}
                className={`py-2 text-xs rounded-lg text-center ${currentView === 'factory' ? 'bg-white/10 text-white font-bold' : ''}`}
              >
                Factory
              </button>
              <button
                onClick={() => { setCurrentView('admin'); setMobileMenuOpen(false); }}
                className={`py-2 text-xs rounded-lg text-center ${currentView === 'admin' ? 'bg-[#FF7135] text-white font-bold' : ''}`}
              >
                Admin
              </button>
            </div>

            <button 
              onClick={() => handleNavClick('discover')} 
              className="text-left py-2 text-white hover:text-[#FF7135]"
            >
              Discover
            </button>
            <button 
              onClick={() => handleNavClick('collections')} 
              className="text-left py-2 text-white hover:text-[#FF7135]"
            >
              Collections
            </button>
            <button 
              onClick={() => handleNavClick('bento-benefits')} 
              className="text-left py-2 text-white hover:text-[#FF7135]"
            >
              For Retailers
            </button>
            <button 
              onClick={() => handleNavClick('about-contact')} 
              className="text-left py-2 text-white hover:text-[#FF7135]"
            >
              About
            </button>

            <div className="pt-4 border-t border-white/10 flex flex-col gap-2.5">
              <button
                onClick={() => { setCurrentView('retailer-auth'); setMobileMenuOpen(false); }}
                className="w-full py-2 text-[#A1A1AA] hover:text-white text-center font-medium"
              >
                Retailer Sign In / Register
              </button>
              <button
                onClick={() => { setCurrentView('factory-auth'); setMobileMenuOpen(false); }}
                className="w-full py-2 text-[#A1A1AA] hover:text-white text-center font-medium"
              >
                Factory Staff Sign In
              </button>
              <button
                onClick={() => { setCurrentView('admin-auth'); setMobileMenuOpen(false); }}
                className="w-full py-2 text-[#FF7135] hover:text-[#FFB38A] text-center font-medium flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Admin Login
              </button>
              <button
                onClick={() => { setCurrentView('retailer'); setMobileMenuOpen(false); }}
                className="w-full py-2.5 rounded-xl bg-[#FF7135] text-white text-center font-medium shadow-md shadow-[#FF7135]/30"
              >
                Explore Collection →
              </button>
              <button
                onClick={() => { setCurrentView('factory'); setMobileMenuOpen(false); }}
                className="w-full py-2.5 rounded-xl bg-[#23252B] text-white text-center font-medium border border-white/10"
              >
                Open Factory Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
    </>
  );
};
