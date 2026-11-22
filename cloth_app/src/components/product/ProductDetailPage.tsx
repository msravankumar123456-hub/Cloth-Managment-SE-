import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, SizeBreakdown } from '../../types';
import { 
  Star, 
  Ruler, 
  Heart, 
  ShoppingBag, 
  Zap, 
  Truck, 
  RotateCcw, 
  ShieldCheck, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  ZoomIn, 
  X, 
  ArrowLeft,
  Share2,
  Sparkles,
  Package,
  Layers,
  ThumbsUp,
  Award
} from 'lucide-react';
import { SizeChartModal } from './SizeChartModal';

interface ProductDetailPageProps {
  product: Product;
  onBack: () => void;
  onBuyNow?: (product: Product, size: keyof SizeBreakdown, color: string, qty: number) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ 
  product, 
  onBack,
  onBuyNow
}) => {
  const { addToCart, setIsCartOpen, showToast, products, setSelectedProductForDetail, currentUser } = useApp();

  // Gallery Images List (Product image + angles)
  const galleryImages = React.useMemo(() => {
    if (product.images && product.images.length > 1) {
      return product.images;
    }
    // High-resolution multi-perspective angles based on category
    const main = product.image;
    return [
      main,
      `${main}&auto=format&fit=crop&w=1200&q=80`,
      `${main}&auto=format&fit=crop&w=1000&q=85&sat=-15`,
      `${main}&auto=format&fit=crop&w=1100&q=85&brightness=5`,
    ];
  }, [product]);

  // Selected State
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>(product.colors[0] || 'Original');
  const [selectedSize, setSelectedSize] = useState<keyof SizeBreakdown>('M');
  const [quantity, setQuantity] = useState<number>(1);
  const [isWishlisted, setIsWishlisted] = useState<boolean>(false);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState<boolean>(false);
  const [isZoomOpen, setIsZoomOpen] = useState<boolean>(false);

  // Accordion open/close states
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    description: true,
    specifications: true,
    fabric: false,
    sizeFit: false,
    shipping: false,
    returnPolicy: false,
  });

  const toggleAccordion = (key: string) => {
    setOpenAccordions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Sync when product changes
  useEffect(() => {
    setSelectedImageIndex(0);
    setSelectedColor(product.colors[0] || 'Original');
    // Default to first size with stock
    const availableSizes = (['S', 'M', 'L', 'XL', 'XXL'] as const).filter(s => product.stock[s] > 0);
    if (availableSizes.length > 0) {
      setSelectedSize(availableSizes[0]);
    } else {
      setSelectedSize('M');
    }
    setQuantity(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product]);

  // Calculations
  const currentStockForSize = product.stock[selectedSize] ?? 0;
  const isOutOfStock = currentStockForSize <= 0;
  const discountPercent = Math.max(10, Math.round(((product.retailMrp - product.wholesalePrice) / product.retailMrp) * 100));

  // Quantity handlers
  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (currentStockForSize > 0 && next > currentStockForSize) {
        showToast(`Maximum available stock for size ${selectedSize} is ${currentStockForSize} pcs.`, 'info');
        return currentStockForSize;
      }
      return next;
    });
  };

  // Add To Cart handler
  const handleAddToCart = () => {
    if (isOutOfStock) {
      showToast(`Size ${selectedSize} is currently out of stock.`, 'error');
      return;
    }

    const sizesPayload: SizeBreakdown = {
      S: selectedSize === 'S' ? quantity : 0,
      M: selectedSize === 'M' ? quantity : 0,
      L: selectedSize === 'L' ? quantity : 0,
      XL: selectedSize === 'XL' ? quantity : 0,
      XXL: selectedSize === 'XXL' ? quantity : 0,
    };

    addToCart({
      id: `cart-${product.id}-${selectedColor}-${selectedSize}-${Date.now()}`,
      product,
      sizes: sizesPayload,
      selectedColor,
      totalQuantity: quantity,
      itemTotal: quantity * product.wholesalePrice,
    });

    showToast(`Added ${quantity} pc(s) of "${product.name}" (${selectedSize}) to cart!`, 'success');
    setIsCartOpen(true);
  };

  // Buy Now handler
  const handleBuyNow = () => {
    if (isOutOfStock) {
      showToast(`Size ${selectedSize} is out of stock.`, 'error');
      return;
    }

    const sizesPayload: SizeBreakdown = {
      S: selectedSize === 'S' ? quantity : 0,
      M: selectedSize === 'M' ? quantity : 0,
      L: selectedSize === 'L' ? quantity : 0,
      XL: selectedSize === 'XL' ? quantity : 0,
      XXL: selectedSize === 'XXL' ? quantity : 0,
    };

    addToCart({
      id: `cart-buy-${product.id}-${selectedColor}-${selectedSize}-${Date.now()}`,
      product,
      sizes: sizesPayload,
      selectedColor,
      totalQuantity: quantity,
      itemTotal: quantity * product.wholesalePrice,
    });

    if (onBuyNow) {
      onBuyNow(product, selectedSize, selectedColor, quantity);
    } else {
      setIsCartOpen(true);
    }
  };

  // Related products from same category
  const relatedProducts = React.useMemo(() => {
    return products
      .filter(p => p.id !== product.id && p.category === product.category)
      .slice(0, 4);
  }, [products, product]);

  const sizesList: (keyof SizeBreakdown)[] = ['S', 'M', 'L', 'XL', 'XXL'];

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#18181B] pt-24 pb-28 font-sans selection:bg-[#FF7135]/20 selection:text-[#FF7135]">
      
      {/* Top Breadcrumbs & Back Navigation */}
      <div className="border-b border-gray-200/80 bg-white sticky top-16 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button 
              onClick={onBack}
              className="inline-flex items-center gap-1.5 font-bold text-gray-900 hover:text-[#FF7135] transition-colors cursor-pointer mr-2 shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <span className="text-gray-300">/</span>
            <span className="hover:text-gray-900 transition-colors cursor-pointer">Catalogue</span>
            <span className="text-gray-300">/</span>
            <span className="hover:text-gray-900 transition-colors cursor-pointer font-medium">{product.category}</span>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 font-semibold truncate max-w-[200px] sm:max-w-sm">
              {product.name}
            </span>
          </div>

          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: product.name, url: window.location.href }).catch(() => {});
              } else {
                navigator.clipboard.writeText(window.location.href);
                showToast('Product link copied to clipboard!', 'info');
              }
            }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer shrink-0"
            title="Share Product"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Product Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-14">
          
          {/* ======================================================== */}
          {/* LEFT COLUMN: Large Product Image Gallery */}
          {/* ======================================================== */}
          <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4 items-start">
            
            {/* Vertical Thumbnails (Horizontal on small screens) */}
            <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto sm:max-h-[620px] pb-2 sm:pb-0 shrink-0 w-full sm:w-20 no-scrollbar">
              {galleryImages.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer bg-gray-50 ${
                    selectedImageIndex === idx
                      ? 'border-[#FF7135] ring-2 ring-[#FF7135]/25 shadow-md'
                      : 'border-gray-200/80 hover:border-gray-400 opacity-80 hover:opacity-100'
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`${product.name} angle ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Main Stage Image with Zoom Button */}
            <div className="relative w-full aspect-[3/4] sm:aspect-[4/5] rounded-2xl overflow-hidden bg-gray-50 border border-gray-200/80 shadow-sm group">
              <img
                src={galleryImages[selectedImageIndex] || product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-zoom-in"
                onClick={() => setIsZoomOpen(true)}
              />

              {/* Discount Badge */}
              <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#FF7135] text-white font-mono text-xs font-bold shadow-md shadow-[#FF7135]/30 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{discountPercent}% OFF</span>
              </div>

              {/* Wishlist Button on Image */}
              <button
                onClick={() => {
                  setIsWishlisted(!isWishlisted);
                  showToast(isWishlisted ? 'Removed from Wishlist' : 'Saved to Wishlist!', isWishlisted ? 'info' : 'success');
                }}
                className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-md transition-all shadow-md cursor-pointer ${
                  isWishlisted
                    ? 'bg-rose-50 text-rose-500 border border-rose-200'
                    : 'bg-white/80 hover:bg-white text-gray-700 hover:text-rose-500 border border-gray-200/60'
                }`}
                title="Save to Wishlist"
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>

              {/* Zoom Trigger Pill */}
              <button
                onClick={() => setIsZoomOpen(true)}
                className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-white/90 hover:bg-white text-gray-800 text-xs font-semibold backdrop-blur-md border border-gray-200/60 shadow-md flex items-center gap-1.5 transition-all cursor-pointer opacity-90 hover:opacity-100"
              >
                <ZoomIn className="w-3.5 h-3.5 text-[#FF7135]" />
                <span>Click to Zoom</span>
              </button>
            </div>

          </div>

          {/* ======================================================== */}
          {/* RIGHT COLUMN: Product Information & Purchase Options */}
          {/* ======================================================== */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Header: Title, Category, SKU, Rating */}
            <div className="space-y-2.5 pb-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold tracking-wider uppercase text-[#FF7135] bg-orange-50 px-2.5 py-0.5 rounded-md border border-orange-200/60">
                  {product.category} • Wholesale Ready
                </span>
                <span className="text-xs font-mono text-gray-400">
                  {product.sku || `SKU: LPM-${product.id.slice(-4).toUpperCase()}`}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950 tracking-tight leading-tight">
                {product.name}
              </h1>

              {/* Rating & Reviews Bar */}
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md text-amber-900 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{product.rating ? product.rating.toFixed(1) : '4.8'}</span>
                </div>
                <span className="text-gray-500 font-medium hover:underline cursor-pointer">
                  {product.reviewsCount || 142} Verified Reviews
                </span>
                <span className="text-gray-300">•</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  100% Quality Verified
                </span>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="p-4 rounded-2xl bg-orange-50/40 border border-orange-200/50 space-y-1.5">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-black text-[#FF7135] font-mono">
                  ₹{product.wholesalePrice.toLocaleString()}
                </span>
                <span className="text-sm sm:text-base text-gray-400 line-through font-mono">
                  ₹{product.retailMrp.toLocaleString()}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold font-mono">
                  Save {discountPercent}%
                </span>
              </div>
              <p className="text-[11px] text-gray-500">
                Direct Mill Factory Rate • Inclusive of all bulk packing • Excl. 5% GST
              </p>
            </div>

            {/* Stock Availability Indicator */}
            <div className="flex items-center gap-2 text-xs">
              <span className={`w-2 h-2 rounded-full ${isOutOfStock ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'}`} />
              <span className={`font-semibold ${isOutOfStock ? 'text-rose-600' : 'text-emerald-700'}`}>
                {isOutOfStock 
                  ? 'Out of Stock for Selected Size' 
                  : `In Stock — Ready to Dispatch from Tirupur Central Mill (${currentStockForSize} pcs available)`}
              </span>
            </div>

            {/* Colour Selector */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-900">
                  Select Colour: <span className="font-medium text-gray-600">{selectedColor}</span>
                </span>
                <span className="text-gray-400 text-[11px]">
                  {product.colors.length} Available
                </span>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {product.colors.map(col => {
                  const isSelected = selectedColor === col;
                  return (
                    <button
                      key={col}
                      onClick={() => setSelectedColor(col)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border flex items-center gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-gray-900 text-white border-gray-900 shadow-md ring-2 ring-gray-900/10'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <span 
                        className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0" 
                        style={{ backgroundColor: col.toLowerCase().includes('white') ? '#FFFFFF' : col.toLowerCase().includes('black') ? '#18181B' : col.toLowerCase().includes('blue') ? '#2563EB' : col.toLowerCase().includes('olive') ? '#556B2F' : col.toLowerCase().includes('beige') ? '#F5F5DC' : col.toLowerCase().includes('grey') ? '#9CA3AF' : '#FF7135' }}
                      />
                      <span>{col}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Size Selector */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-900">
                  Select Size: <span className="text-[#FF7135] font-mono font-bold">{selectedSize}</span>
                </span>

                <button
                  onClick={() => setIsSizeChartOpen(true)}
                  className="inline-flex items-center gap-1 text-[#FF7135] hover:text-[#FF5C1B] font-semibold text-xs transition-colors cursor-pointer"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Size Chart</span>
                </button>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {sizesList.map(sz => {
                  const stockQty = product.stock[sz] ?? 0;
                  const isAvailable = stockQty > 0;
                  const isSelected = selectedSize === sz;

                  return (
                    <button
                      key={sz}
                      disabled={!isAvailable}
                      onClick={() => {
                        setSelectedSize(sz);
                        setQuantity(1);
                      }}
                      className={`relative py-3 rounded-xl border text-center font-bold text-sm transition-all cursor-pointer ${
                        !isAvailable
                          ? 'bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed line-through'
                          : isSelected
                          ? 'bg-[#FF7135] border-[#FF7135] text-white shadow-md shadow-[#FF7135]/25 ring-2 ring-[#FF7135]/20'
                          : 'bg-white border-gray-200/90 text-gray-900 hover:border-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      <span>{sz}</span>
                      <span className={`block text-[9px] font-mono font-normal mt-0.5 ${
                        isSelected ? 'text-white/80' : isAvailable ? 'text-gray-400' : 'text-gray-300'
                      }`}>
                        {isAvailable ? `${stockQty} left` : 'Sold out'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Model Info */}
              {product.modelInfo && (
                <p className="text-[11px] text-gray-500 italic pt-1">
                  💡 {product.modelInfo}
                </p>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-900">
                Quantity (Pieces)
              </label>
              
              <div className="flex items-center gap-4">
                <div className="inline-flex items-center border border-gray-200 rounded-xl bg-white shadow-xs p-1">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent font-bold text-base transition-colors cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-mono font-bold text-sm text-gray-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={currentStockForSize > 0 && quantity >= currentStockForSize}
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent font-bold text-base transition-colors cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                <div className="text-xs text-gray-500 font-mono">
                  Subtotal: <strong className="text-gray-900 font-bold">₹{(quantity * product.wholesalePrice).toLocaleString()}</strong>
                </div>
              </div>
            </div>

            {/* ======================================================== */}
            {/* Action Buttons: ADD TO CART & BUY NOW */}
            {/* ======================================================== */}
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* 1. ADD TO CART Button (Dark) */}
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-gray-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-gray-900/10 hover:shadow-gray-900/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>ADD TO CART</span>
                </button>

                {/* 2. BUY NOW Button (Orange #FF7135) */}
                <button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-[#FF7135] hover:bg-[#FF5C1B] text-white font-bold text-xs uppercase tracking-wider shadow-xl shadow-[#FF7135]/25 hover:shadow-[#FF7135]/40 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>BUY NOW</span>
                </button>

              </div>

              {/* Security & Logistics Badges */}
              <div className="grid grid-cols-3 gap-2 py-3 border-y border-gray-100 text-[11px] text-gray-600">
                <div className="flex items-center gap-1.5 justify-center">
                  <Truck className="w-4 h-4 text-[#FF7135]" />
                  <span>Express B2B Transit</span>
                </div>
                <div className="flex items-center gap-1.5 justify-center border-x border-gray-100">
                  <RotateCcw className="w-4 h-4 text-[#FF7135]" />
                  <span>7-Day Replacement</span>
                </div>
                <div className="flex items-center gap-1.5 justify-center">
                  <ShieldCheck className="w-4 h-4 text-[#FF7135]" />
                  <span>Direct Mill Invoice</span>
                </div>
              </div>
            </div>

            {/* ======================================================== */}
            {/* Expandable Accordion Information Sections */}
            {/* ======================================================== */}
            <div className="divide-y divide-gray-100 border-t border-gray-100 pt-1 text-xs">
              
              {/* Accordion 1: Description */}
              <div className="py-3.5">
                <button
                  onClick={() => toggleAccordion('description')}
                  className="w-full flex items-center justify-between font-bold text-gray-900 text-left cursor-pointer"
                >
                  <span>Product Description</span>
                  {openAccordions.description ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openAccordions.description && (
                  <p className="mt-2.5 text-gray-600 leading-relaxed text-xs">
                    {product.description || `Crafted from premium grade ${product.fabric}, this garment is engineered for commercial high-durability and rich colorfastness. Tailored with double-stitched lock seams and soft enzyme wash finishing, ensuring immediate shelf-appeal for retail stores.`}
                  </p>
                )}
              </div>

              {/* Accordion 2: Product Specifications */}
              <div className="py-3.5">
                <button
                  onClick={() => toggleAccordion('specifications')}
                  className="w-full flex items-center justify-between font-bold text-gray-900 text-left cursor-pointer"
                >
                  <span>Product Specifications</span>
                  {openAccordions.specifications ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openAccordions.specifications && (
                  <div className="mt-2.5 space-y-1.5 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <div className="flex justify-between py-1 border-b border-gray-200/50">
                      <span className="text-gray-500">Fabric Composition</span>
                      <span className="font-semibold text-gray-900">{product.fabric}</span>
                    </div>
                    {product.gsm && (
                      <div className="flex justify-between py-1 border-b border-gray-200/50">
                        <span className="text-gray-500">Weight / GSM</span>
                        <span className="font-semibold text-gray-900">{product.gsm} GSM</span>
                      </div>
                    )}
                    <div className="flex justify-between py-1 border-b border-gray-200/50">
                      <span className="text-gray-500">Weave & Finish</span>
                      <span className="font-semibold text-gray-900">Pre-shrunk Enzyme Bio-wash</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-200/50">
                      <span className="text-gray-500">Wholesale MOQ</span>
                      <span className="font-semibold text-gray-900">{product.moq} pcs standard lot</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-500">Origin</span>
                      <span className="font-semibold text-gray-900">Tirupur Apparel Cluster, India</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion 3: Fabric and Material */}
              <div className="py-3.5">
                <button
                  onClick={() => toggleAccordion('fabric')}
                  className="w-full flex items-center justify-between font-bold text-gray-900 text-left cursor-pointer"
                >
                  <span>Fabric and Material Care</span>
                  {openAccordions.fabric ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openAccordions.fabric && (
                  <ul className="mt-2.5 space-y-1 text-gray-600 list-disc list-inside">
                    <li>100% long-staple natural fibers for breathable all-day comfort.</li>
                    <li>Machine wash warm at 40°C with similar colors.</li>
                    <li>Do not bleach. Iron medium heat on reverse side.</li>
                    <li>Colorfast dyes resistant to chlorine and sunlight fading.</li>
                  </ul>
                )}
              </div>

              {/* Accordion 4: Size and Fit */}
              <div className="py-3.5">
                <button
                  onClick={() => toggleAccordion('sizeFit')}
                  className="w-full flex items-center justify-between font-bold text-gray-900 text-left cursor-pointer"
                >
                  <span>Size & Fit Guidance</span>
                  {openAccordions.sizeFit ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openAccordions.sizeFit && (
                  <div className="mt-2.5 text-gray-600 space-y-1.5 leading-relaxed">
                    <p>Designed for regular commercial Indian retail fitting. Sits comfortably across the shoulders with a tapered torso.</p>
                    <p className="font-medium text-gray-800">{product.modelInfo || "Model is 6'1\" wearing size L."}</p>
                  </div>
                )}
              </div>

              {/* Accordion 5: Shipping Information */}
              <div className="py-3.5">
                <button
                  onClick={() => toggleAccordion('shipping')}
                  className="w-full flex items-center justify-between font-bold text-gray-900 text-left cursor-pointer"
                >
                  <span>Shipping & Freight Transit</span>
                  {openAccordions.shipping ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openAccordions.shipping && (
                  <div className="mt-2.5 text-gray-600 space-y-1 leading-relaxed">
                    <p>• Dispatched directly from Loopmex Central Mill within 24–48 hours.</p>
                    <p>• Pan-India surface road freight handled by Delhivery B2B Logistics.</p>
                    <p>• Estimated door delivery within 3–5 working days with live Waybill tracking.</p>
                  </div>
                )}
              </div>

              {/* Accordion 6: Return Policy */}
              <div className="py-3.5">
                <button
                  onClick={() => toggleAccordion('returnPolicy')}
                  className="w-full flex items-center justify-between font-bold text-gray-900 text-left cursor-pointer"
                >
                  <span>Wholesale Return & Replacement Policy</span>
                  {openAccordions.returnPolicy ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openAccordions.returnPolicy && (
                  <div className="mt-2.5 text-gray-600 space-y-1 leading-relaxed">
                    <p>• 7-day factory replacement guarantee for any weaving, stitching, or color defects.</p>
                    <p>• Pre-authorization inspection arranged with instant credit note or replacement dispatch.</p>
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>

        {/* ======================================================== */}
        {/* Customer Reviews & Ratings Section */}
        {/* ======================================================== */}
        <div className="mt-16 pt-12 border-t border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                Customer Ratings & Feedback
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Verified feedback from licensed apparel retailers and boutique buyers
              </p>
            </div>

            <div className="flex items-center gap-4 bg-orange-50/60 border border-orange-200/50 p-4 rounded-2xl">
              <div className="text-center">
                <span className="text-3xl font-black text-gray-900 font-mono">
                  {product.rating ? product.rating.toFixed(1) : '4.8'}
                </span>
                <div className="flex text-amber-400 text-xs mt-0.5">
                  {'★★★★★'}
                </div>
              </div>
              <div className="text-xs text-gray-600 pl-4 border-l border-orange-200/60">
                <p className="font-bold text-gray-900">{product.reviewsCount || 142} Reviews</p>
                <p className="text-emerald-700 font-semibold">96% Recommend this SKU</p>
              </div>
            </div>
          </div>

          {/* Testimonial Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                name: 'Kavita Sundaram',
                store: 'Sundaram Fabrics, Chennai',
                rating: 5,
                comment: 'The fabric drape and colorfastness are exceptional. Sold out our initial 50-piece order in under a week. Re-ordering size L & XL.',
                date: '2 weeks ago',
              },
              {
                name: 'Rajiv Mehra',
                store: 'Urban Stitch Boutiques, Jaipur',
                rating: 5,
                comment: 'Precision sizing matches standard Indian retail fit perfectly. Stitching quality on collars and cuffs exceeds expectations at this wholesale rate.',
                date: '3 weeks ago',
              },
              {
                name: 'Amitabh Sen',
                store: 'Sen Garments, Kolkata',
                rating: 4,
                comment: 'Fast freight delivery via Delhivery. Packed neatly in 50-pc cartons with individual poly-packs. Very good gross margin for retail.',
                date: '1 month ago',
              },
            ].map((rev, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-white border border-gray-100 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex text-amber-400 text-xs">
                    {'★'.repeat(rev.rating)}
                  </div>
                  <span className="text-[10px] text-gray-400">{rev.date}</span>
                </div>
                <p className="text-xs text-gray-700 leading-relaxed italic">
                  "{rev.comment}"
                </p>
                <div className="pt-2 border-t border-gray-50 flex items-center justify-between text-xs">
                  <div>
                    <h5 className="font-bold text-gray-900">{rev.name}</h5>
                    <p className="text-[10px] text-gray-500">{rev.store}</p>
                  </div>
                  <span className="text-emerald-600 text-[10px] font-bold bg-emerald-50 px-2 py-0.5 rounded">
                    Verified Buyer
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ======================================================== */}
        {/* Related Products Grid */}
        {/* ======================================================== */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 pt-12 border-t border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">
                  Related Wholesale Garments
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Frequently ordered alongside this {product.category} collection
                </p>
              </div>
              <button 
                onClick={onBack}
                className="text-xs text-[#FF7135] font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View Full Catalogue</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {relatedProducts.map(rel => (
                <div
                  key={rel.id}
                  onClick={() => setSelectedProductForDetail(rel)}
                  className="rounded-2xl bg-white border border-gray-200/80 overflow-hidden hover:shadow-lg transition-all cursor-pointer group flex flex-col"
                >
                  <div className="relative aspect-[3/4] bg-gray-50 overflow-hidden">
                    <img
                      src={rel.image}
                      alt={rel.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-white font-mono text-[9px]">
                      {rel.category}
                    </span>
                  </div>
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900 text-xs truncate group-hover:text-[#FF7135] transition-colors">
                        {rel.name}
                      </h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">{rel.fabric}</p>
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between">
                      <span className="font-bold text-[#FF7135] text-xs font-mono">
                        ₹{rel.wholesalePrice}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">
                        MOQ {rel.moq}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ======================================================== */}
      {/* Lightbox Image Zoom Modal */}
      {/* ======================================================== */}
      {isZoomOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in"
          onClick={() => setIsZoomOpen(false)}
        >
          <div 
            className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsZoomOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black text-white transition-colors z-10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={galleryImages[selectedImageIndex] || product.image}
              alt={product.name}
              className="w-full h-auto max-h-[85vh] object-contain rounded-2xl"
            />
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* Size Chart Modal Component */}
      {/* ======================================================== */}
      <SizeChartModal
        isOpen={isSizeChartOpen}
        onClose={() => setIsSizeChartOpen(false)}
        category={product.category}
      />

    </div>
  );
};
