import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, ClothingCategory, Order } from '../../types';
import { 
  Search, 
  Filter, 
  ShoppingBag, 
  Layers, 
  ArrowRight, 
  SlidersHorizontal, 
  Clock, 
  FileText, 
  Eye, 
  Package, 
  Truck,
  CheckCircle2,
  Check,
  ShieldCheck,
  Download
} from 'lucide-react';
import { ProductDetailModal } from './ProductDetailModal';
import { ProductDetailPage } from '../product/ProductDetailPage';
import { CartDrawer } from './CartDrawer';
import { CheckoutModal } from './CheckoutModal';
import { OrderTrackingModal } from './OrderTrackingModal';
import { OrderConfirmationModal } from './OrderConfirmationModal';
import { InvoicesView } from './InvoicesView';
import { downloadInvoiceFile } from '../../utils/invoiceDownload';

export const RetailerPortal: React.FC = () => {
  const { 
    products, 
    orders, 
    invoices, 
    cart, 
    isCartOpen, 
    setIsCartOpen,
    selectedProductForDetail,
    setSelectedProductForDetail,
    trackingOrder,
    setTrackingOrder,
    activeInvoice,
    setActiveInvoice,
    setCurrentView,
    currentUser,
    logout,
    isDatabaseConnected
  } = useApp();

  // Factory members may browse the catalogue to inspect live stock, but all
  // purchasing controls are hidden. Only retailers can order.
  const canOrder = currentUser?.role === 'retailer';

  const [activeTab, setActiveTab] = useState<'catalog' | 'orders' | 'invoices'>('catalog');
  const [selectedCategory, setSelectedCategory] = useState<ClothingCategory | 'All'>('All');
  const [search, setSearch] = useState('');
  const [selectedFabric, setSelectedFabric] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'recommended' | 'price-asc' | 'price-desc' | 'moq-asc'>('recommended');
  
  // Checkout modal & Order Confirmation state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(() => {
    try {
      const saved = sessionStorage.getItem('loopmex_last_confirmed_order');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  const categories: (ClothingCategory | 'All')[] = [
    'All',
    'Sarees',
    'Dresses',
    'Shirts',
    'T-Shirts',
    'Denim',
    'Kurtis',
    'Trousers',
    'Blazers',
  ];

  const fabrics = ['All', 'Cotton', 'Linen', 'Denim', 'Chanderi', 'Silk', 'Georgette', 'Rayon', 'Fleece'];

  // Filter & Sort
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                              p.fabric.toLowerCase().includes(search.toLowerCase()) ||
                              p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
        const matchesFabric = selectedFabric === 'All' || p.fabric.toLowerCase().includes(selectedFabric.toLowerCase());
        return matchesCategory && matchesSearch && matchesFabric;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.wholesalePrice - b.wholesalePrice;
        if (sortBy === 'price-desc') return b.wholesalePrice - a.wholesalePrice;
        if (sortBy === 'moq-asc') return a.moq - b.moq;
        return b.rating - a.rating;
      });
  }, [products, selectedCategory, search, selectedFabric, sortBy]);

  const totalCartPieces = cart.reduce((acc, item) => acc + item.totalQuantity, 0);
  const visibleOrders = currentUser?.role === 'retailer'
    ? orders.filter(order => 
        (order.retailerName && currentUser.name && order.retailerName.toLowerCase() === currentUser.name.toLowerCase()) ||
        (order as any).user_id === currentUser.id ||
        (order as any).retailer_id === currentUser.id
      )
    : orders;
  const visibleInvoices = currentUser?.role === 'retailer'
    ? invoices.filter(invoice => 
        (invoice.retailerName && currentUser.name && invoice.retailerName.toLowerCase() === currentUser.name.toLowerCase()) ||
        (invoice as any).user_id === currentUser.id ||
        (invoice as any).retailer_id === currentUser.id
      )
    : invoices;

  // Render Full Professional Product Details Page when a product is selected
  if (selectedProductForDetail) {
    return (
      <>
        <ProductDetailPage
          product={selectedProductForDetail}
          onBack={() => setSelectedProductForDetail(null)}
          onBuyNow={() => {
            setSelectedProductForDetail(null);
            setIsCheckoutOpen(true);
          }}
        />

        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          onOpenCheckout={() => setIsCheckoutOpen(true)}
        />

        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          onOrderSuccess={(order) => {
            setIsCheckoutOpen(false);
            setLastPlacedOrder(order);
            setConfirmedOrder(order);
            try {
              sessionStorage.setItem('loopmex_last_confirmed_order', JSON.stringify(order));
            } catch {}
            setIsConfirmationOpen(true);
          }}
        />

        <OrderConfirmationModal
          order={confirmedOrder}
          isOpen={isConfirmationOpen}
          onClose={() => setIsConfirmationOpen(false)}
          onViewMyOrders={() => {
            setIsConfirmationOpen(false);
            setActiveTab('orders');
            if (confirmedOrder) {
              setTrackingOrder(confirmedOrder);
            }
          }}
        />

        <OrderTrackingModal
          order={trackingOrder}
          onClose={() => setTrackingOrder(null)}
        />

        <InvoicesView
          invoice={activeInvoice}
          onClose={() => setActiveInvoice(null)}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#101114] text-[#F5F5F5] pt-24 pb-20">
      
      {/* Top Banner & Tab Navigation */}
      <div className="border-b border-white/[0.08] bg-[#141519] pb-4 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-[#FF7135] font-semibold">
                  Retailer Procurement Portal
                </span>
                <span className={`px-2 py-0.5 rounded-full border font-mono text-[10px] ${isDatabaseConnected ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
                  {isDatabaseConnected ? 'Supabase Connected' : 'Local Demo'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
                Wholesale Garment Catalogue
              </h1>
              {currentUser && (
                <p className="text-xs text-[#A1A1AA] mt-1">
                  Logged in as <strong>{currentUser.name}</strong>{currentUser.place ? (', ' + currentUser.place) : ''}
                </p>
              )}
              <button
                onClick={() => logout()}
                className="mt-2 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.10] border border-white/10 text-xs text-[#A1A1AA] hover:text-white transition-colors"
              >
                Sign Out
              </button>
            </div>

            {!canOrder && (
              <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  <strong>Read-only stock view.</strong> Factory accounts can check available inventory but cannot add items to cart, check out, or place orders. Only authorized retailer accounts can purchase.
                </span>
              </div>
            )}

            {/* Quick Switch Tabs */}
            <div className="flex items-center gap-2">
              <div className="flex items-center p-1 rounded-xl bg-[#17181C] border border-white/10 text-xs">
                <button
                  onClick={() => setActiveTab('catalog')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'catalog'
                      ? 'bg-[#FF7135] text-white font-semibold shadow-sm'
                      : 'text-[#A1A1AA] hover:text-white'
                  }`}
                >
                  Catalogue ({products.length})
                </button>

                {canOrder && (
                  <>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                        activeTab === 'orders'
                          ? 'bg-[#FF7135] text-white font-semibold shadow-sm'
                          : 'text-[#A1A1AA] hover:text-white'
                      }`}
                    >
                      <Package className="w-3.5 h-3.5" />
                      <span>My Orders ({visibleOrders.length})</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('invoices')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                        activeTab === 'invoices'
                          ? 'bg-[#FF7135] text-white font-semibold shadow-sm'
                          : 'text-[#A1A1AA] hover:text-white'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Invoices ({visibleInvoices.length})</span>
                    </button>
                  </>
                )}
              </div>

              {/* Cart Drawer Button — retailers only */}
              {canOrder && (
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#17181C] hover:bg-[#1F2025] border border-white/10 text-xs font-semibold text-white transition-all shadow-sm"
                >
                  <ShoppingBag className="w-4 h-4 text-[#FF7135]" />
                  <span>Cart ({totalCartPieces})</span>
                </button>
              )}
            </div>
          </div>

          {/* Search & Filter Bar (Only shown on catalog tab) */}
          {activeTab === 'catalog' && (
            <div className="pt-2 flex flex-col md:flex-row gap-3 items-center justify-between">
              
              {/* Category Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                      selectedCategory === cat
                        ? 'bg-white/10 border-[#FF7135] text-white font-bold shadow-sm'
                        : 'bg-[#17181C] border-white/10 text-[#A1A1AA] hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search & Selectors */}
              <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="w-3.5 h-3.5 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search fabric, styles..."
                    className="w-full bg-[#17181C] border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#FF7135]"
                  />
                </div>

                <select
                  value={selectedFabric}
                  onChange={(e) => setSelectedFabric(e.target.value)}
                  className="bg-[#17181C] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-[#A1A1AA] focus:outline-none focus:border-[#FF7135]"
                >
                  {fabrics.map(f => (
                    <option key={f} value={f}>Fabric: {f}</option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-[#17181C] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-[#A1A1AA] focus:outline-none focus:border-[#FF7135]"
                >
                  <option value="recommended">Best Sellers</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="moq-asc">Lowest MOQ</option>
                </select>
              </div>

            </div>
          )}

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ================= TAB 1: PRODUCT CATALOGUE ================= */}
        {activeTab === 'catalog' && (
          <div>
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20 p-8 rounded-2xl bg-[#17181C] border border-white/10">
                <p className="text-sm text-[#A1A1AA]">No garments match your active filters.</p>
                <button
                  onClick={() => { setSelectedCategory('All'); setSearch(''); setSelectedFabric('All'); }}
                  className="mt-3 px-4 py-2 rounded-xl bg-[#FF7135] text-xs font-semibold text-white"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredProducts.map(product => {
                  const totalStock = Object.values(product.stock).reduce((a, b) => a + b, 0);
                  const margin = Math.round(((product.retailMrp - product.wholesalePrice) / product.retailMrp) * 100);

                  return (
                    <div
                      key={product.id}
                      onClick={() => setSelectedProductForDetail(product)}
                      className="group rounded-2xl bg-[#17181C] border border-white/[0.08] hover:border-[#FF7135]/40 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-black/70 hover:-translate-y-1"
                    >
                      {/* Image Frame */}
                      <div className="relative aspect-[4/5] bg-[#141519] overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#17181C] via-transparent to-black/20 opacity-80" />

                        {/* Category & Margin Tags */}
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-mono text-white">
                            {product.category}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/90 text-black text-[10px] font-bold">
                            {margin}% Margin
                          </span>
                        </div>

                        {/* Stock pill */}
                        <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded bg-[#101114]/85 backdrop-blur-md border border-white/10 text-[10px] text-[#D4D4D8]">
                          Stock: <strong>{totalStock} pcs</strong>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 flex flex-col flex-1 justify-between space-y-3">
                        <div>
                          <h3 className="text-sm font-bold text-white group-hover:text-[#FF7135] transition-colors line-clamp-1">
                            {product.name}
                          </h3>
                          <p className="text-[11px] text-[#71717A] mt-0.5 truncate font-mono">
                            {product.fabric}
                          </p>

                          {/* Mini Size availability indicator */}
                          <div className="flex items-center gap-1 mt-2.5 text-[10px] font-mono text-[#A1A1AA]">
                            <span>Sizes:</span>
                            {Object.entries(product.stock).map(([sz, qty]) => (
                              <span 
                                key={sz}
                                className={`px-1 rounded ${qty > 0 ? 'bg-white/[0.04] text-[#D4D4D8]' : 'text-zinc-600 line-through'}`}
                              >
                                {sz}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Pricing & Order CTA */}
                        <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                          <div>
                            <div className="text-[10px] font-mono text-[#71717A] uppercase">Wholesale</div>
                            <div className="text-base font-extrabold text-white">
                              <span className="text-[#FF7135]">₹{product.wholesalePrice}</span>
                              <span className="text-[10px] text-[#71717A] font-normal ml-0.5">/pc</span>
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProductForDetail(product);
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-[#FF7135] text-white text-xs font-semibold transition-all group-hover:bg-[#FF7135]"
                          >
                            <span>Configure</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: MY ORDERS & TRACKING ================= */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Recent Purchase Orders</h3>
              <span className="text-xs text-[#71717A] font-mono">Real-time status updates from Mill Dispatch</span>
            </div>

            <div className="space-y-4">
              {visibleOrders.map(order => (
                <div
                  key={order.id}
                  className="p-5 rounded-2xl bg-[#17181C] border border-white/[0.08] hover:border-white/15 transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/[0.06]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white font-mono">{order.orderNumber}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                          order.status === 'Delivered' 
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : order.status === 'Dispatched'
                            ? 'bg-[#FF7135]/20 text-[#FF7135] border border-[#FF7135]/30'
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        }`}>
                          {order.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-xs text-[#71717A] mt-0.5">
                        Placed on {order.date} • {order.totalPieces} Pieces
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setTrackingOrder(order)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FF7135]/15 hover:bg-[#FF7135]/25 border border-[#FF7135]/30 text-[#FF7135] text-xs font-semibold transition-all"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Track Consignment</span>
                      </button>

                      {invoices.find(inv => inv.orderId === order.id) && (
                        <button
                          onClick={() => {
                            const inv = invoices.find(i => i.orderId === order.id);
                            if (inv) setActiveInvoice(inv);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/10 text-white text-xs font-medium transition-all"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Invoice</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Items in this order */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {order.items.map(item => (
                      <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-[#101114] border border-white/[0.04]">
                        <img 
                          src={item.product.image} 
                          alt={item.product.name} 
                          className="w-10 h-12 object-cover rounded bg-[#141519]" 
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">{item.product.name}</h4>
                          <div className="text-[11px] text-[#71717A]">
                            Color: {item.selectedColor} • {item.totalQuantity} pcs
                          </div>
                        </div>
                        <div className="text-right text-xs font-mono font-bold text-white">
                          ₹{item.itemTotal.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Logistics Summary */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-[#A1A1AA] pt-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[#71717A]">Courier:</span>
                      <span className="text-white font-medium">{order.courierName}</span>
                      <span>({order.trackingNumber})</span>
                    </div>

                    <div className="mt-1 sm:mt-0 font-bold text-white">
                      <span>Total Amount: </span>
                      <span className="text-[#FF7135] text-sm">₹{order.grandTotal.toLocaleString()}</span>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 3: INVOICES ================= */}
        {activeTab === 'invoices' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Digital GST Invoices</h3>
              <span className="text-xs text-[#71717A] font-mono">Automated 5% GST B2B Compliant</span>
            </div>

            <div className="rounded-2xl bg-[#17181C] border border-white/[0.08] overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#141519] border-b border-white/[0.08] text-[#71717A] font-mono text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Order Ref</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-center">Pcs</th>
                    <th className="py-3 px-4 text-right">Taxable</th>
                    <th className="py-3 px-4 text-right">GST (5%)</th>
                    <th className="py-3 px-4 text-right">Total (₹)</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {visibleInvoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-white/[0.02]">
                      <td className="py-3 px-4 font-mono font-bold text-white">{inv.invoiceNumber}</td>
                      <td className="py-3 px-4 font-mono text-[#A1A1AA]">{inv.orderNumber}</td>
                      <td className="py-3 px-4 text-[#A1A1AA]">{inv.date}</td>
                      <td className="py-3 px-4 text-center font-mono text-white">{inv.totalPieces}</td>
                      <td className="py-3 px-4 text-right font-mono text-[#A1A1AA]">₹{inv.subtotal.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right font-mono text-[#A1A1AA]">₹{inv.gstAmount.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-white">₹{inv.grandTotal.toLocaleString()}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          inv.status === 'Paid' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => downloadInvoiceFile(inv)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                            title="Download Tax Invoice to Laptop"
                          >
                            <Download className="w-3 h-3" />
                            <span>Download</span>
                          </button>
                          <button
                            onClick={() => setActiveInvoice(inv)}
                            className="px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-[#FF7135] text-white text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            View PDF
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Modals */}
      <ProductDetailModal
        product={selectedProductForDetail}
        onClose={() => setSelectedProductForDetail(null)}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOpenCheckout={() => setIsCheckoutOpen(true)}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={(order) => {
          setIsCheckoutOpen(false);
          setLastPlacedOrder(order);
          setConfirmedOrder(order);
          try {
            sessionStorage.setItem('loopmex_last_confirmed_order', JSON.stringify(order));
          } catch {}
          setIsConfirmationOpen(true);
        }}
      />

      <OrderConfirmationModal
        order={confirmedOrder}
        isOpen={isConfirmationOpen}
        onClose={() => setIsConfirmationOpen(false)}
        onViewMyOrders={() => {
          setIsConfirmationOpen(false);
          setActiveTab('orders');
          if (confirmedOrder) {
            setTrackingOrder(confirmedOrder);
          }
        }}
      />

      <OrderTrackingModal
        order={trackingOrder}
        onClose={() => setTrackingOrder(null)}
      />

      <InvoicesView
        invoice={activeInvoice}
        onClose={() => setActiveInvoice(null)}
      />

    </div>
  );
};
