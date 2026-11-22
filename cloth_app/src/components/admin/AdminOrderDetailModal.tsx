import React from 'react';
import { Order } from '../../types';
import {
  X, Package, MapPin, Phone, CreditCard, Truck, Calendar,
  ShoppingBag, Receipt, Image as ImageIcon
} from 'lucide-react';

interface AdminOrderDetailModalProps {
  order: Order | null;
  onClose: () => void;
}

const sizeKeys = ['S', 'M', 'L', 'XL', 'XXL'] as const;

export const AdminOrderDetailModal: React.FC<AdminOrderDetailModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#17181C] border border-white/15 shadow-2xl shadow-black/95 text-[#F5F5F5]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Titlebar */}
        <div className="sticky top-0 z-10 px-5 py-3.5 bg-[#141519]/95 backdrop-blur-md border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
            </div>
            <span className="ml-2 text-xs font-mono text-[#A1A1AA]">
              Order Dossier — {order.orderNumber}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-[#A1A1AA] hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-6">
          {/* Header strip */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-white">{order.orderNumber}</h2>
              <p className="text-xs text-[#71717A] mt-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Placed on {order.date}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#FF7135]/15 border border-[#FF7135]/30 text-[#FF7135] text-[11px] font-mono font-bold">
                {order.status}
              </span>
              <span className={`px-3 py-1 rounded-full border text-[11px] font-mono font-bold ${
                order.paymentStatus === 'Paid'
                  ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                  : 'bg-amber-500/10 border-amber-500/25 text-amber-400'
              }`}>
                {order.paymentStatus}
              </span>
            </div>
          </div>

          {/* Retailer details */}
          <div className="p-4 rounded-xl bg-[#101114] border border-white/[0.08] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#71717A]">Retailer</div>
              <div className="font-bold text-white text-sm">{order.retailerName}</div>
              <div className="text-[#A1A1AA] flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-[#FF7135]" /> {order.retailerStore}
              </div>
              <div className="text-[#A1A1AA] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#FF7135]" /> {order.retailerCity}
              </div>
              <div className="text-[#A1A1AA] flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#FF7135]" /> {order.retailerPhone || '—'}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#71717A]">Payment</div>
              <div className="text-white flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-[#FF7135]" /> {order.paymentMethod}
              </div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#71717A] pt-2">Logistics</div>
              <div className="text-white flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-[#FF7135]" /> {order.courierName}
              </div>
              <div className="font-mono text-[#FF7135]">{order.trackingNumber}</div>
              <div className="text-[#71717A]">Est. delivery: {order.estimatedDelivery}</div>
            </div>
          </div>

          {/* Ordered items with photos */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-4 h-4 text-[#FF7135]" />
              <h3 className="text-sm font-bold text-white">
                Items Ordered ({order.items?.length || 0})
              </h3>
              <span className="text-[11px] text-[#71717A]">— {order.totalPieces} total pieces</span>
            </div>

            <div className="space-y-3">
              {(order.items || []).map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-[#101114] border border-white/[0.08] flex flex-col sm:flex-row gap-4"
                >
                  {/* Product photo */}
                  <div className="w-full sm:w-28 h-32 sm:h-28 shrink-0 rounded-lg overflow-hidden bg-[#17181C] border border-white/10 flex items-center justify-center">
                    {item.product?.image ? (
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-[#52525B]" />
                    )}
                  </div>

                  {/* Item info */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-bold text-white text-sm">{item.product?.name}</div>
                        <div className="text-[11px] text-[#71717A] mt-0.5">
                          {item.product?.category} • {item.selectedColor}
                        </div>
                        <div className="text-[10px] text-[#71717A] truncate max-w-md">{item.product?.fabric}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-mono font-bold text-[#FF7135]">₹{item.itemTotal?.toLocaleString()}</div>
                        <div className="text-[10px] text-[#71717A]">
                          ₹{item.product?.wholesalePrice}/pc
                        </div>
                      </div>
                    </div>

                    {/* Size breakdown */}
                    <div className="flex flex-wrap gap-1.5">
                      {sizeKeys.map(sz => {
                        const qty = item.sizes?.[sz] || 0;
                        if (!qty) return null;
                        return (
                          <span key={sz} className="px-2 py-1 rounded-md bg-[#FF7135]/10 border border-[#FF7135]/25 text-[11px] font-mono text-[#FFB38A]">
                            {sz}: <strong className="text-white">{qty}</strong>
                          </span>
                        );
                      })}
                      <span className="px-2 py-1 rounded-md bg-white/[0.05] border border-white/10 text-[11px] font-mono text-[#D4D4D8]">
                        Total: <strong className="text-white">{item.totalQuantity}</strong>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {(!order.items || order.items.length === 0) && (
                <p className="text-xs text-[#52525B]">No line items recorded for this order.</p>
              )}
            </div>
          </div>

          {/* Bill summary */}
          <div className="p-4 rounded-xl bg-[#101114] border border-white/[0.08] space-y-2 text-xs">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#71717A] mb-2 flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5" /> Bill Summary
            </div>
            <div className="flex justify-between text-[#A1A1AA]">
              <span>Subtotal ({order.totalPieces} pcs)</span>
              <span className="font-mono text-white">₹{order.subtotal?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[#A1A1AA]">
              <span>GST (5%)</span>
              <span className="font-mono text-white">₹{order.gstAmount?.toLocaleString()}</span>
            </div>
            <div className="pt-2 border-t border-white/[0.08] flex justify-between text-sm font-bold text-white">
              <span>Grand Total</span>
              <span className="text-[#FF7135] text-base font-black">₹{order.grandTotal?.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <button className="absolute inset-0 z-0 bg-black/60" onClick={onClose} aria-label="Close order details" />
    </div>
  );
};
