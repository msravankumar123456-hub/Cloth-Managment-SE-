import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AboutContact } from './AboutContact';
import {
  Search, Heart, User, ShoppingBag, ChevronDown, ArrowRight,
  Menu, X, ShieldCheck, Store, Factory, Grid2X2
} from 'lucide-react';

type NavKey = 'All' | 'Shirts' | 'T-Shirts' | 'Trousers' | 'Jeans';

const NAV_ITEMS: { key: NavKey; label: string }[] = [
  { key: 'All', label: 'VIEW ALL' },
  { key: 'Shirts', label: 'SHIRTS' },
  { key: 'T-Shirts', label: 'T-SHIRTS' },
  { key: 'Trousers', label: 'TROUSERS' },
  { key: 'Jeans', label: 'JEANS' },
];

const HERO_SLIDES: {
  key: NavKey | 'Jackets';
  title: string;
  kicker: string;
  category: string;
  left: string;
  right: string;
}[] = [
  {
    key: 'Shirts', title: 'SHIRTS', kicker: 'TAILORED ESSENTIALS', category: 'Shirts',
    left: '/images/tshirts/brown-ribbed-polo.jpg',
    right: '/images/tshirts/navy-tipped-polo.jpg',
  },
  {
    key: 'T-Shirts', title: 'T-SHIRTS', kicker: 'EVERYDAY LAYERS', category: 'T-Shirts',
    left: '/images/tshirts/beige-relaxed-tee.jpg',
    right: '/images/tshirts/crimson-active-polo.jpg',
  },
  {
    key: 'Jeans', title: 'JEANS', kicker: 'DENIM STATEMENTS', category: 'Denim',
    left: '/images/pants/classic-indigo-jeans.jpg',
    right: '/images/pants/pants-7.jpg',
  },
  {
    key: 'Trousers', title: 'TROUSERS', kicker: 'MODERN SILHOUETTES', category: 'Trousers',
    left: '/images/pants/pants-3.jpg',
    right: '/images/pants/pants-5.jpg',
  },
  {
    key: 'Jackets', title: 'JACKETS', kicker: 'OUTERWEAR EDIT', category: 'Blazers',
    left: '/images/tshirts/navy-tipped-polo.jpg',
    right: '/images/pants/pants-8.jpg',
  },
];

const CATEGORY_FOR_NAV: Record<NavKey, string | null> = {
  All: null,
  Shirts: 'Shirts',
  'T-Shirts': 'T-Shirts',
  Trousers: 'Trousers',
  Jeans: 'Denim',
};

const AnnouncementBar: React.FC = () => {
  const messages = [
    'FREE SHIPPING ON BULK ORDERS ABOVE ₹50,000',
    'NEW SEASON DROP — AUTUMN / WINTER 2026',
    'DIRECT MILL PRICING · NO MIDDLEMEN',
    'GST INVOICING ON EVERY ORDER',
  ];
  const line = (
    <div className="flex shrink-0 items-center gap-10 px-5">
      {messages.map((m, i) => (
        <span key={i} className="flex items-center gap-3 whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.18em]">
          <span className="h-1 w-1 rounded-full bg-white/80" />
          {m}
        </span>
      ))}
    </div>
  );
  return (
    <div className="relative z-50 h-8 overflow-hidden bg-[#E11D2E] text-white">
      <div className="flex w-max animate-marquee py-2">
        {line}{line}{line}{line}
      </div>
    </div>
  );
};

const FashionHeader: React.FC<{ search: string; onSearch: (v: string) => void }> = ({ search, onSearch }) => {
  const { cart, setIsCartOpen, setCurrentView, isAuthenticated, currentView: currentViewRef } = useApp();
  const [portalOpen, setPortalOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const cartCount = cart.reduce((s, i) => s + i.totalQuantity, 0);

  const go = (view: 'landing' | 'retailer' | 'factory' | 'admin' | 'retailer-auth' | 'admin-auth') => {
    setMobileOpen(false);
    setPortalOpen(false);
    setCurrentView(view);
  };

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    setPortalOpen(false);
    if (currentViewRef !== 'landing') setCurrentView('landing');
    window.setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, currentViewRef !== 'landing' ? 120 : 0);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-black/[0.06] bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-[1400px] items-center justify-between gap-6 px-5 sm:px-8">
        <button onClick={() => go('landing')} className="flex items-baseline gap-1.5 shrink-0">
          <span className="text-[22px] font-black tracking-[-0.06em] text-[#0B0B0D]">LOOP</span>
          <span className="text-[22px] font-black tracking-[-0.06em] text-[#E11D2E]">MEX</span>
          <span className="ml-1 rounded bg-[#E11D2E]/10 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-[#E11D2E]">PRO</span>
        </button>

        <nav className="hidden items-center gap-8 lg:flex">
          <button onClick={() => go('landing')} className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#0B0B0D] hover:text-[#E11D2E] transition-colors">Discover</button>
          <button onClick={() => scrollTo('collection-grid')} className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#5B5B62] hover:text-[#E11D2E] transition-colors">Collections</button>
          <button onClick={() => scrollTo('about-contact')} className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#5B5B62] hover:text-[#E11D2E] transition-colors">About</button>

          <div className="relative">
            <button
              onClick={() => setPortalOpen(v => !v)}
              className="flex items-center gap-1 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#5B5B62] hover:text-[#E11D2E] transition-colors"
            >
              Portals <ChevronDown className={`h-3.5 w-3.5 transition-transform ${portalOpen ? 'rotate-180' : ''}`} />
            </button>
            {portalOpen && (
              <div className="absolute left-0 top-8 w-56 overflow-hidden rounded-xl border border-black/10 bg-white p-1.5 shadow-2xl">
                <button onClick={() => go('retailer-auth')} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[12px] font-medium text-[#0B0B0D] hover:bg-[#FFF1F2]">
                  <Store className="h-4 w-4 text-[#E11D2E]" /> Retailer Sign In
                </button>
                <button onClick={() => go('factory')} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[12px] font-medium text-[#0B0B0D] hover:bg-[#FFF1F2]">
                  <Factory className="h-4 w-4 text-[#E11D2E]" /> Factory Dashboard
                </button>
                <button onClick={() => go('admin-auth')} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[12px] font-medium text-[#0B0B0D] hover:bg-[#FFF1F2]">
                  <ShieldCheck className="h-4 w-4 text-[#E11D2E]" /> Admin Login
                </button>
              </div>
            )}
          </div>
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <div className="relative hidden sm:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9A9AA2]" />
            <input
              value={search}
              onChange={e => onSearch(e.target.value)}
              placeholder="Search garments"
              className="h-9 w-40 rounded-full border border-black/[0.08] bg-[#F6F6F7] pl-8 pr-3 text-[12px] text-[#0B0B0D] outline-none transition-all focus:w-56 focus:border-[#E11D2E]/40 focus:bg-white lg:w-52"
            />
          </div>
          <button aria-label="Wishlist" className="hidden h-9 w-9 items-center justify-center rounded-full text-[#0B0B0D] hover:bg-black/[0.05] sm:flex">
            <Heart className="h-[18px] w-[18px]" />
          </button>
          <button aria-label="Account" onClick={() => go(isAuthenticated ? 'retailer' : 'retailer-auth')} className="flex h-9 w-9 items-center justify-center rounded-full text-[#0B0B0D] hover:bg-black/[0.05]">
            <User className="h-[18px] w-[18px]" />
          </button>
          <button aria-label="Cart" onClick={() => setIsCartOpen(true)} className="relative flex h-9 w-9 items-center justify-center rounded-full text-[#0B0B0D] hover:bg-black/[0.05]">
            <ShoppingBag className="h-[18px] w-[18px]" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#E11D2E] px-1 text-[9px] font-bold text-white">{cartCount}</span>
            )}
          </button>
          <button aria-label="Menu" onClick={() => setMobileOpen(v => !v)} className="ml-1 flex h-9 w-9 items-center justify-center rounded-full text-[#0B0B0D] lg:hidden">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-black/[0.06] bg-white px-5 py-4 lg:hidden">
          {([
            { label: 'Discover', view: 'landing' },
            { label: 'Collections', scrollId: 'collection-grid' },
            { label: 'About', scrollId: 'about-contact' },
            { label: 'Retailer Portal', view: 'retailer' },
            { label: 'Admin Login', view: 'admin-auth' },
          ] as { label: string; view?: 'landing' | 'retailer' | 'admin-auth'; scrollId?: string }[]).map(item => (
            <button
              key={item.label}
              onClick={() => {
                if (item.scrollId) scrollTo(item.scrollId);
                else if (item.view) go(item.view);
              }}
              className="block w-full border-b border-black/[0.05] py-3 text-left text-[13px] font-semibold uppercase tracking-wider text-[#0B0B0D]"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};

const AnimatedHero: React.FC<{ active: number; onSelect: (i: number) => void }> = ({ active, onSelect }) => {
  const slide = HERO_SLIDES[active];
  const { setSelectedProductForDetail, setCurrentView, isAuthenticated } = useApp();

  const shop = () => {
    const el = document.getElementById('collection-grid');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative overflow-hidden bg-white">
      <div className="mx-auto max-w-[1400px] px-5 pb-10 pt-8 sm:px-8 sm:pb-14">
        <div className="relative flex h-[420px] items-center justify-center overflow-hidden rounded-[28px] bg-[#F6F3F1] sm:h-[520px]">
          {/* left model */}
          <div key={`L-${slide.key}`} className="hero-img-left absolute bottom-0 left-0 top-0 w-[34%] overflow-hidden">
            <img src={slide.left} alt={`${slide.title} model`} className="h-full w-full object-cover object-top" />
          </div>
          {/* right model */}
          <div key={`R-${slide.key}`} className="hero-img-right absolute bottom-0 right-0 top-0 w-[34%] overflow-hidden">
            <img src={slide.right} alt={`${slide.title} model`} className="h-full w-full object-cover object-top" />
          </div>
          {/* center wash for legibility */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#F6F3F1] via-transparent to-[#F6F3F1] opacity-70" />

          <div className="relative z-10 flex max-w-xl flex-col items-center px-4 text-center">
            <span key={`K-${slide.key}`} className="hero-kicker mb-3 text-[11px] font-bold uppercase tracking-[0.32em] text-[#E11D2E]">
              {slide.kicker}
            </span>
            <h1 key={`T-${slide.key}`} className="hero-title text-[58px] font-black leading-[0.9] tracking-[-0.05em] text-[#0B0B0D] sm:text-[104px]">
              {slide.title}
            </h1>
            <p className="mt-5 max-w-sm text-[13px] leading-relaxed text-[#5B5B62]">
              Discover premium wholesale garments directly from the mill. Curated silhouettes, transparent pricing, size-wise stock.
            </p>
            <button
              onClick={shop}
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#E11D2E] px-7 py-3.5 text-[12px] font-bold uppercase tracking-[0.14em] text-white transition-all duration-300 hover:bg-[#B91225] hover:shadow-lg hover:shadow-[#E11D2E]/30"
            >
              Shop Collection <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* slide dots */}
          <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {HERO_SLIDES.map((s, i) => (
              <button
                key={s.key}
                aria-label={`Show ${s.title}`}
                onClick={() => onSelect(i)}
                className={`h-1.5 rounded-full transition-all duration-500 ${i === active ? 'w-7 bg-[#E11D2E]' : 'w-1.5 bg-[#0B0B0D]/20 hover:bg-[#0B0B0D]/40'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const CategoryNav: React.FC<{ value: NavKey; onChange: (v: NavKey) => void }> = ({ value, onChange }) => (
  <div className="sticky top-[72px] z-30 border-b border-black/[0.06] bg-white/95 backdrop-blur-xl">
    <div className="mx-auto flex max-w-[1400px] gap-8 overflow-x-auto px-5 sm:px-8">
      {NAV_ITEMS.map(item => {
        const active = value === item.key;
        return (
          <button
            key={item.key}
            onClick={() => onChange(item.key)}
            className={`relative shrink-0 py-4 text-[12px] font-bold uppercase tracking-[0.16em] transition-colors duration-300 ${active ? 'text-[#E11D2E]' : 'text-[#7A7A82] hover:text-[#0B0B0D]'}`}
          >
            {item.label}
            <span className={`absolute bottom-0 left-0 right-0 h-[2px] origin-left bg-[#E11D2E] transition-transform duration-500 ease-out ${active ? 'scale-x-100' : 'scale-x-0'}`} />
          </button>
        );
      })}
    </div>
  </div>
);

const FashionGrid: React.FC<{ category: NavKey; search: string }> = ({ category, search }) => {
  const { products, setSelectedProductForDetail } = useApp();
  const [shown, setShown] = useState(products);
  const [fading, setFading] = useState(false);
  const first = useRef(true);

  const filtered = useMemo(() => {
    const cat = CATEGORY_FOR_NAV[category];
    let list = cat ? products.filter(p => p.category === cat) : products;
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.fabric.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    return list;
  }, [products, category, search]);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      setShown(filtered);
      return;
    }
    setFading(true);
    const t = window.setTimeout(() => {
      setShown(filtered);
      setFading(false);
    }, 240);
    return () => window.clearTimeout(t);
  }, [filtered]);

  const cards = shown.length ? shown : products.slice(0, 8);

  return (
    <section id="collection-grid" className="scroll-mt-[130px] bg-white py-14 sm:py-20">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <div className="mb-9 flex items-end justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#E11D2E]">The Edit</p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#0B0B0D] sm:text-4xl">
              {category === 'All' ? 'All Garments' : category === 'Jeans' ? 'Denim & Jeans' : category}
            </h2>
          </div>
          <span className="text-[12px] font-medium text-[#7A7A82]">{cards.length} styles</span>
        </div>

        <div className={`grid grid-cols-1 gap-5 transition-all duration-500 sm:grid-cols-2 lg:grid-cols-4 ${fading ? 'translate-y-4 opacity-0' : 'translate-y-0 opacity-100'}`}>
          {cards.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => setSelectedProductForDetail(p)}
              className="group text-left"
              style={{ transitionDelay: `${idx * 35}ms` }}
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-[#F3F1EF]">
                <img
                  src={p.image}
                  alt={p.name}
                  loading="lazy"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/pants/classic-indigo-jeans.jpg'; }}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/60 via-transparent to-transparent p-4 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <span className="w-full rounded-full bg-white py-2.5 text-center text-[11px] font-bold uppercase tracking-[0.12em] text-[#0B0B0D]">
                    View Details
                  </span>
                </div>
                <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-[#0B0B0D]">
                  {p.category}
                </span>
              </div>
              <div className="pt-3.5">
                <h3 className="truncate text-[14px] font-semibold text-[#0B0B0D]">{p.name}</h3>
                <p className="mt-0.5 truncate text-[11px] text-[#7A7A82]">{p.fabric}</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-[15px] font-black text-[#E11D2E]">₹{p.wholesalePrice}</span>
                  <span className="text-[11px] text-[#9A9AA2] line-through">₹{p.retailMrp}</span>
                  <span className="ml-auto text-[10px] font-semibold text-[#7A7A82]">MOQ {p.moq}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

const FashionFooter: React.FC = () => {
  const { setCurrentView } = useApp();
  return (
    <footer className="border-t border-black/[0.06] bg-[#0B0B0D] py-12 text-white">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-8 px-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div>
          <div className="text-xl font-black tracking-[-0.05em]">LOOP<span className="text-[#E11D2E]">MEX</span></div>
          <p className="mt-2 max-w-sm text-[12px] leading-relaxed text-white/50">
            Premium wholesale fashion, sourced directly from the mill. Built for modern retailers.
          </p>
        </div>
        <div className="flex flex-wrap gap-6 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/70">
          <button onClick={() => setCurrentView('retailer')} className="hover:text-[#E11D2E]">Retailer Portal</button>
          <button onClick={() => setCurrentView('factory')} className="hover:text-[#E11D2E]">Factory Portal</button>
          <button onClick={() => setCurrentView('admin-auth')} className="hover:text-[#E11D2E]">Admin Login</button>
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-[1400px] border-t border-white/10 px-5 pt-6 text-[11px] text-white/40 sm:px-8">
        © 2026 Loopmex. All rights reserved.
      </div>
    </footer>
  );
};

export const FashionLanding: React.FC = () => {
  const [nav, setNav] = useState<NavKey>('All');
  const [heroIndex, setHeroIndex] = useState(0);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const t = window.setInterval(() => {
      setHeroIndex(i => (i + 1) % HERO_SLIDES.length);
    }, 4500);
    return () => window.clearInterval(t);
  }, []);

  const selectNav = (key: NavKey) => {
    setNav(key);
    if (key !== 'All') {
      const i = HERO_SLIDES.findIndex(s => s.key === key);
      if (i >= 0) setHeroIndex(i);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#0B0B0D]">
      <AnnouncementBar />
      <FashionHeader search={search} onSearch={setSearch} />
      <CategoryNav value={nav} onChange={selectNav} />
      <AnimatedHero active={heroIndex} onSelect={setHeroIndex} />
      <FashionGrid category={nav} search={search} />
      <div className="scroll-mt-[130px]">
        <AboutContact />
      </div>
      <FashionFooter />
    </div>
  );
};
