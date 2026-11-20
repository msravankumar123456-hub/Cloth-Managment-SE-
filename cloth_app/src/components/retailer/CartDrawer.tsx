import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, Trash2, ArrowRight, ShoppingBag, ShieldCheck, Truck } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onOpenCheckout }) => {
  const { cart, removeFromCart, setCurrentView, currentUser } = useApp();

  if (!isOpen) return null;

  // Checkout is a retailer-only capability.
  const canCheckout = currentUser?.role === 'retailer';

  const totalPieces = cart.reduce((sum, item) => sum + item.totalQuantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.itemTotal, 0);
  const gstAmount = Math.round(subtotal * 0.05); // 5% GST
  const grandTotal = subtotal + gstAmount;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-md bg-[#17181C] border-l border-white/10 h-full flex flex-col justify-between shadow-2xl text-[#F5F5F5]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Drawer Header */}
        <div className="p-5 border-b border-white/[0.08] flex items-center justify-between bg-[#141519]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FF7135]/15 border border-[#FF7135]/30 flex items-center justify-center text-[#FF7135]">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Wholesale Bulk Cart</h3>
              <p className="text-xs text-[#71717A]">{totalPieces} total pieces in queue</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/10 text-[#A1A1AA] hover:text-white transition-colors"
            aria-label="Close cart"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#71717A]">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-[#71717A] mb-4">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-white mb-1">Your Wholesale Cart is Empty</h4>
              <p className="text-xs text-[#A1A1AA] max-w-xs mb-6">
                Explore garments from our mill collections and specify your size breakdown to create a bulk order.
              </p>
              <button
                onClick={() => {
                  onClose();
                  setCurrentView('retailer');
                }}
                className="px-5 py-2.5 rounded-xl bg-[#FF7135] text-white font-medium text-xs shadow-md shadow-[#FF7135]/20 hover:bg-[#FF5C1B] transition-all"
              >
                Browse Catalog
              </button>
            </div>
          ) : (
            cart.map(item => (
              <div 
                key={item.id}
                className="p-4 rounded-xl bg-[#101114] border border-white/[0.06] hover:border-white/15 transition-all space-y-3"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-14 h-16 object-cover rounded-lg bg-[#141519] border border-white/10 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-white truncate">{item.product.name}</h4>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-[#A1A1AA]">
                      <span className="text-[#FF7135] font-mono">₹{item.product.wholesalePrice}/pc</span>
                      <span>•</span>
                      <span>{item.selectedColor}</span>
                    </div>

                    {/* Size distribution chips */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {Object.entries(item.sizes)
                        .filter(([_, qty]) => qty > 0)
                        .map(([size, qty]) => (
                          <span 
                            key={size}
                            className="px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/10 text-[10px] font-mono text-[#D4D4D8]"
                          >
                            {size}: <strong>{qty}</strong>
                          </span>
                        ))}
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-1 rounded text-[#71717A] hover:text-rose-400 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-xs">
                  <span className="text-[#71717A]">
                    {item.totalQuantity} pieces
                  </span>
                  <span className="font-bold text-white">
                    ₹{item.itemTotal.toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer / Financial Summary */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-white/[0.08] bg-[#141519] space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-[#A1A1AA]">
                <span>Wholesale Subtotal ({totalPieces} pcs)</span>
                <span className="font-mono text-white">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[#A1A1AA]">
                <span>GST (5% Indian Apparel Standard)</span>
                <span className="font-mono text-white">₹{gstAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[#A1A1AA]">
                <span>B2B Road Freight (Tirupur Hub)</span>
                <span className="text-emerald-400 font-mono">Standard Tariff (Calculated)</span>
              </div>
              <div className="pt-2 border-t border-white/[0.08] flex justify-between text-sm font-bold text-white">
                <span>Grand Total</span>
                <span className="text-[#FF7135] text-base font-black">₹{grandTotal.toLocaleString()}</span>
              </div>
            </div>

            {canCheckout ? (
              <button
                onClick={() => {
                  onClose();
                  onOpenCheckout();
                }}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#FF7135] hover:bg-[#FF5C1B] text-white font-semibold text-xs tracking-wider uppercase shadow-xl shadow-[#FF7135]/25 hover:shadow-[#FF7135]/40 transition-all cursor-pointer"
              >
                <span>Proceed to B2B Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Checkout is available to retailer accounts only. Factory members can view stock but cannot place orders.
                </span>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
