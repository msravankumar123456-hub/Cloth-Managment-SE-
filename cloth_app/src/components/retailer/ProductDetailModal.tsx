import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, SizeBreakdown } from '../../types';
import { X, Check, AlertCircle, ShoppingBag, ShieldCheck, TrendingUp, Sparkles } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const { addToCart, setIsCartOpen, currentUser } = useApp();

  const [selectedColor, setSelectedColor] = useState<string>('');
  const [sizes, setSizes] = useState<SizeBreakdown>({
    S: 0,
    M: 0,
    L: 0,
    XL: 0,
    XXL: 0,
  });

  useEffect(() => {
    if (product) {
      setSelectedColor(product.colors[0] || 'Default');
      // Set default balanced ratio meeting MOQ
      const halfMoq = Math.ceil(product.moq / 3);
      setSizes({
        S: 0,
        M: halfMoq,
        L: halfMoq,
        XL: product.moq - (halfMoq * 2) > 0 ? product.moq - (halfMoq * 2) : 0,
        XXL: 0,
      });
    }
  }, [product]);

  if (!product) return null;

  // Only verified retailer accounts may build a cart / place an order.
  // Factory members and guests see a read-only stock sheet instead.
  const canOrder = currentUser?.role === 'retailer';

  const totalQuantity = Object.values(sizes).reduce((a, b) => a + b, 0);
  const isMoqMet = totalQuantity >= product.moq;
  const totalPrice = totalQuantity * product.wholesalePrice;
  const retailMargin = Math.round(((product.retailMrp - product.wholesalePrice) / product.retailMrp) * 100);

  const handleSizeChange = (sizeKey: keyof SizeBreakdown, val: string) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    // Don't exceed available stock
    const maxStock = product.stock[sizeKey];
    setSizes(prev => ({
      ...prev,
      [sizeKey]: Math.min(num, maxStock)
    }));
  };

  const handleApplyPresetRatio = (ratio: 'standard' | 'large') => {
    if (ratio === 'standard') {
      const perSize = Math.ceil(product.moq / 4);
      setSizes({
        S: Math.min(perSize, product.stock.S),
        M: Math.min(perSize, product.stock.M),
        L: Math.min(perSize, product.stock.L),
        XL: Math.min(perSize, product.stock.XL),
        XXL: 0,
      });
    } else {
      const perSize = Math.ceil((product.moq * 2) / 4);
      setSizes({
        S: Math.min(Math.floor(perSize * 0.7), product.stock.S),
        M: Math.min(perSize, product.stock.M),
        L: Math.min(perSize, product.stock.L),
        XL: Math.min(perSize, product.stock.XL),
        XXL: Math.min(Math.floor(perSize * 0.5), product.stock.XXL),
      });
    }
  };

  const handleAdd = () => {
    if (!canOrder || !isMoqMet) return;

    addToCart({
      id: `cart-${product.id}-${selectedColor}-${Date.now()}`,
      product,
      sizes,
      selectedColor,
      totalQuantity,
      itemTotal: totalPrice,
    });

    onClose();
    setIsCartOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl bg-[#17181C] border border-white/15 shadow-2xl shadow-black/90 text-[#F5F5F5]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Window Titlebar (Raycast Window Aesthetic) */}
        <div className="sticky top-0 z-20 px-5 py-3.5 bg-[#141519]/95 backdrop-blur-md border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
            <span className="ml-2 text-xs font-mono text-[#A1A1AA] hidden sm:inline">
              Garment Lot: {product.id} — Wholesale Specification Sheet
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/10 text-[#A1A1AA] hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 grid grid-cols-1 md:grid-cols-12 gap-7">
          
          {/* Left Column: Garment Image & Fabric Specs */}
          <div className="md:col-span-5 space-y-4">
            <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-[#101114] border border-white/10 shadow-lg">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-mono text-white">
                {product.category}
              </div>
              {product.gsm && (
                <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded bg-[#FF7135] text-[10px] font-mono font-bold text-white shadow-md">
                  {product.gsm} GSM
                </div>
              )}
            </div>

            {/* Fabric Specification Card */}
            <div className="p-4 rounded-xl bg-[#101114] border border-white/[0.08] space-y-2 text-xs">
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#FF7135] font-semibold">
                Technical Specifications
              </div>
              <div className="flex justify-between py-1 border-b border-white/[0.06]">
                <span className="text-[#71717A]">Fabric:</span>
                <span className="font-medium text-white text-right">{product.fabric}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/[0.06]">
                <span className="text-[#71717A]">Suggested Retail MRP:</span>
                <span className="font-semibold text-white">₹{product.retailMrp}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/[0.06]">
                <span className="text-[#71717A]">Retail Gross Margin:</span>
                <span className="font-bold text-emerald-400">~{retailMargin}% Profit</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#71717A]">Minimum Order Quantity:</span>
                <span className="font-mono font-bold text-white">{product.moq} pcs</span>
              </div>
            </div>
          </div>

          {/* Right Column: Pricing, Color Swatches, Size Breakdown Matrix */}
          <div className="md:col-span-7 flex flex-col justify-between space-y-6">
            <div>
              
              {/* Product Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {product.name}
                  </h3>
                  <p className="text-xs text-[#A1A1AA] mt-1 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              </div>

              {/* Wholesale Rate Banner */}
              <div className="mt-4 p-4 rounded-xl bg-[#101114] border border-[#FF7135]/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717A]">Direct Mill Rate</span>
                  <div className="text-2xl font-black text-white flex items-baseline gap-1 mt-0.5">
                    <span className="text-[#FF7135]">₹{product.wholesalePrice}</span>
                    <span className="text-xs text-[#71717A] font-normal">/ piece + 5% GST</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717A]">Total Ready Stock</span>
                  <div className="text-sm font-bold text-emerald-400">
                    {Object.values(product.stock).reduce((a, b) => a + b, 0)} units
                  </div>
                </div>
              </div>

              {/* Colorway Selection — ordering control, retailers only */}
              {canOrder && (
                <div className="mt-5">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#A1A1AA] block mb-2 font-semibold">
                    Select Colorway ({product.colors.length} options)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map(col => (
                      <button
                        key={col}
                        onClick={() => setSelectedColor(col)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                          selectedColor === col
                            ? 'bg-[#FF7135]/20 border-[#FF7135] text-white shadow-sm'
                            : 'bg-[#101114] border-white/10 text-[#A1A1AA] hover:border-white/20'
                        }`}
                      >
                        {col}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {canOrder ? (
                /* Size-wise Quantity Matrix — ordering control, retailers only */
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-mono uppercase tracking-wider text-[#A1A1AA] font-semibold">
                      Size-wise Quantity Breakdown (S to XXL)
                    </label>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-[#71717A]">Presets:</span>
                      <button
                        onClick={() => handleApplyPresetRatio('standard')}
                        className="text-[11px] text-[#FF7135] hover:underline"
                      >
                        Standard MOQ Ratio
                      </button>
                      <span>•</span>
                      <button
                        onClick={() => handleApplyPresetRatio('large')}
                        className="text-[11px] text-[#FF7135] hover:underline"
                      >
                        2x Carton Run
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-5 gap-2.5">
                    {(['S', 'M', 'L', 'XL', 'XXL'] as const).map(sz => {
                      const available = product.stock[sz];
                      return (
                        <div key={sz} className="p-2.5 rounded-xl bg-[#101114] border border-white/10 text-center">
                          <div className="text-xs font-bold text-[#FF7135]">{sz}</div>
                          <input
                            type="number"
                            min="0"
                            max={available}
                            value={sizes[sz] || ''}
                            onChange={(e) => handleSizeChange(sz, e.target.value)}
                            placeholder="0"
                            className="w-full text-center bg-[#17181C] border border-white/10 rounded-lg py-1.5 text-sm font-bold text-white mt-1.5 focus:outline-none focus:border-[#FF7135]"
                          />
                          <div className="text-[10px] text-[#71717A] mt-1 truncate">
                            Stock: {available}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Validation Status */}
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      {isMoqMet ? (
                        <span className="text-emerald-400 flex items-center gap-1 font-medium">
                          <Check className="w-3.5 h-3.5" />
                          MOQ Requirement Met ({totalQuantity} / {product.moq} pcs)
                        </span>
                      ) : (
                        <span className="text-amber-400 flex items-center gap-1 font-medium">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Add {product.moq - totalQuantity} more pcs to satisfy MOQ of {product.moq}
                        </span>
                      )}
                    </div>

                    <span className="font-mono text-white">
                      Total: <strong>{totalQuantity} pieces</strong>
                    </span>
                  </div>
                </div>
              ) : (
                /* Read-only stock sheet for factory members / guests */
                <div className="mt-6">
                  <div className="mb-2 text-xs font-mono uppercase tracking-wider text-[#A1A1AA] font-semibold">
                    Size-wise Available Stock (Read Only)
                  </div>
                  <div className="p-3 mb-3 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs flex items-start gap-2">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>
                      Stock is shown for factory reference only. Ordering is restricted to authorized retailer accounts.
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-2.5">
                    {(['S', 'M', 'L', 'XL', 'XXL'] as const).map(sz => (
                      <div key={sz} className="p-2.5 rounded-xl bg-[#101114] border border-white/10 text-center">
                        <div className="text-xs font-bold text-[#FF7135]">{sz}</div>
                        <div className="text-lg font-black text-white mt-1">{product.stock[sz]}</div>
                        <div className="text-[10px] text-[#71717A] mt-0.5">pcs available</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-xs text-[#71717A]">
                    Total ready stock:{' '}
                    <strong className="text-emerald-400">
                      {Object.values(product.stock).reduce((a, b) => a + b, 0)} pieces
                    </strong>
                  </div>
                </div>
              )}

            </div>

            {/* Bottom Action Footer */}
            <div className="pt-5 border-t border-white/[0.08] flex items-center justify-between gap-4">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#71717A]">
                  {canOrder ? 'Order Line Subtotal' : 'Reference Line Value'}
                </div>
                <div className="text-xl font-black text-white">
                  ₹{(canOrder ? totalPrice : product.wholesalePrice * product.moq).toLocaleString()}
                </div>
                {!canOrder && (
                  <div className="text-[10px] text-[#71717A] mt-0.5">at standard MOQ of {product.moq} pcs</div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/[0.04] text-xs font-medium text-[#A1A1AA] hover:text-white transition-colors"
                >
                  Cancel
                </button>

                {canOrder && (
                  <button
                    onClick={handleAdd}
                    disabled={!isMoqMet}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-xs tracking-wide uppercase transition-all duration-200 cursor-pointer ${
                      isMoqMet
                        ? 'bg-[#FF7135] hover:bg-[#FF5C1B] text-white shadow-xl shadow-[#FF7135]/30'
                        : 'bg-white/10 text-[#71717A] cursor-not-allowed opacity-50'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Bulk Order</span>
                  </button>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
