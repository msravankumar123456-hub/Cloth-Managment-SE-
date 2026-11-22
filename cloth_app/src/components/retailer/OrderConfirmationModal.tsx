import React from 'react';
import { 
  CheckCircle2, 
  ShoppingBag, 
  Truck, 
  MapPin, 
  Calendar, 
  CreditCard, 
  Receipt, 
  Download, 
  ArrowRight, 
  ExternalLink,
  Copy,
  Check,
  PackageCheck,
  ShieldCheck,
  X
} from 'lucide-react';
import { Order } from '../../types';

interface OrderConfirmationModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onViewMyOrders: () => void;
  onViewInvoice?: (order: Order) => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  order,
  isOpen,
  onClose,
  onViewMyOrders,
  onViewInvoice,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !order) return null;

  const handleCopyOrderId = () => {
    if (order.orderNumber) {
      navigator.clipboard.writeText(order.orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formattedDateTime = order.date ? (
    order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }) : `${order.date}, Just now`
  ) : new Date().toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl my-auto rounded-2xl bg-[#17181C] border border-white/15 shadow-2xl shadow-black/95 text-[#F5F5F5] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Glow Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-[#FF7135] to-emerald-400" />

        {/* Modal Window Control Header */}
        <div className="px-6 py-4 bg-[#141519] border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping inline-block" />
            <span className="text-xs font-mono font-semibold tracking-wider uppercase text-emerald-400">
              Escrow Payment Verified & Order Authenticated
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-white/[0.08] transition-colors"
            title="Close dialog"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[82vh] overflow-y-auto">
          
          {/* Hero Success Badge */}
          <div className="text-center space-y-3 pb-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/15 border-2 border-emerald-500/40 text-emerald-400 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
            </div>

            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-[11px] font-bold uppercase tracking-wider">
                Transaction Successful
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight pt-1">
                ORDER CONFIRMED!
              </h2>
              <p className="text-xs sm:text-sm text-[#A1A1AA] max-w-md mx-auto">
                Thank you, <strong className="text-white">{order.retailerName}</strong>! Your wholesale apparel order has been registered and sent directly to our Tirupur mill cutting & packing unit.
              </p>
            </div>
          </div>

          {/* Key Reference Data Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Order Reference */}
            <div className="p-4 rounded-xl bg-[#101114] border border-white/[0.08] space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#71717A] tracking-wider block">
                Unique Order ID
              </span>
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm sm:text-base font-bold text-[#FF7135]">
                  {order.orderNumber}
                </span>
                <button
                  onClick={handleCopyOrderId}
                  className="p-1 rounded hover:bg-white/10 text-[#A1A1AA] hover:text-white transition-colors"
                  title="Copy Order ID"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <span className="text-[10px] text-[#71717A] block">
                Order Date: {formattedDateTime}
              </span>
            </div>

            {/* Payment & Status Badges */}
            <div className="p-4 rounded-xl bg-[#101114] border border-white/[0.08] space-y-2">
              <span className="text-[10px] font-mono uppercase text-[#71717A] tracking-wider block">
                Verification & Status
              </span>
              <div className="flex flex-wrap gap-2 items-center">
                <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-mono font-bold text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  PAYMENT: {order.paymentStatus || 'PAID'}
                </span>
                <span className="px-2.5 py-1 rounded-md bg-blue-500/15 border border-blue-500/30 text-blue-300 font-mono font-bold text-xs">
                  ORDER: {order.status || 'CONFIRMED'}
                </span>
              </div>
              {order.transactionId && (
                <div className="text-[10px] text-[#71717A] font-mono truncate">
                  Ref ID: <span className="text-white">{order.transactionId}</span>
                </div>
              )}
            </div>
          </div>

          {/* Consignee & Shipping Info */}
          <div className="p-4 rounded-xl bg-[#101114] border border-white/[0.08] space-y-2.5 text-xs">
            <div className="flex items-center gap-1.5 text-[#FF7135] font-mono text-[11px] font-bold uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5" />
              <span>Consignee Delivery Details</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#A1A1AA]">
              <div>
                <span className="text-[#71717A] text-[10px] block">Retailer / Business:</span>
                <p className="text-white font-medium">{order.retailerStore} ({order.retailerName})</p>
                <p className="text-[11px] text-[#A1A1AA]">{order.retailerPhone}</p>
              </div>

              <div>
                <span className="text-[#71717A] text-[10px] block">Destination Shipping Address:</span>
                <p className="text-white">
                  {order.shippingAddress || order.retailerCity || 'Registered Shop Address'}
                </p>
                <p className="text-[11px] text-[#A1A1AA]">
                  {order.retailerCity} • Est. Courier: {order.courierName || 'Delhivery B2B Freight'}
                </p>
              </div>
            </div>
          </div>

          {/* Ordered Products Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-[#FF7135] font-semibold">
              <span className="flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5" />
                Ordered Garments ({order.totalPieces || 0} Total Pieces)
              </span>
              <span className="text-[#71717A] text-[10px] font-normal">
                {(order.items || []).length} SKU(s)
              </span>
            </div>

            <div className="rounded-xl border border-white/[0.08] bg-[#101114] divide-y divide-white/[0.05] overflow-hidden text-xs">
              {(order.items || []).map((item, idx) => {
                const productName = item.product?.name || (item as any).name || 'Garment Lot';
                const productImage = item.product?.image || (item as any).image;
                const wholesalePrice = item.product?.wholesalePrice || (item as any).wholesalePrice || (item.itemTotal ? Math.round(item.itemTotal / (item.totalQuantity || 1)) : 0);
                const color = item.selectedColor || 'Factory Standard';

                // Size breakdown text
                const sizeList = item.sizes
                  ? Object.entries(item.sizes)
                      .filter(([_, q]) => Number(q) > 0)
                      .map(([s, q]) => `${s}: ${q}`)
                      .join(' | ')
                  : `${item.totalQuantity} pcs`;

                return (
                  <div key={item.id || idx} className="p-3.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {productImage ? (
                        <img 
                          src={productImage} 
                          alt={productName}
                          className="w-12 h-12 rounded-lg object-cover bg-white/5 border border-white/10 shrink-0" 
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#71717A] shrink-0 font-mono text-[10px]">
                          LOT
                        </div>
                      )}

                      <div className="min-w-0">
                        <h4 className="font-semibold text-white truncate text-xs sm:text-sm">
                          {productName}
                        </h4>
                        <div className="text-[11px] text-[#A1A1AA] flex items-center gap-2 mt-0.5">
                          <span>Color: <strong className="text-white">{color}</strong></span>
                          <span>•</span>
                          <span className="font-mono text-[#D4D4D8]">{sizeList}</span>
                        </div>
                        <div className="text-[10px] text-[#71717A] font-mono mt-0.5">
                          ₹{wholesalePrice.toLocaleString()} / piece
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono text-xs font-bold text-white block">
                        ₹{(item.itemTotal || 0).toLocaleString()}
                      </span>
                      <span className="text-[10px] font-mono text-[#A1A1AA]">
                        {item.totalQuantity || 0} pcs
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Financial Breakdown Card */}
          <div className="p-4 rounded-xl bg-[#101114] border border-white/[0.08] space-y-2 text-xs">
            <div className="flex justify-between text-[#A1A1AA]">
              <span>Wholesale Subtotal ({order.totalPieces || 0} pieces)</span>
              <span className="font-mono text-white">₹{(order.subtotal || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[#A1A1AA]">
              <span>Apparel GST (5% Standard)</span>
              <span className="font-mono text-white">₹{(order.gstAmount || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[#A1A1AA]">
              <span>Logistics & Freight Tariff</span>
              <span className="font-mono text-emerald-400">Paid by Mill (Factory Transit)</span>
            </div>
            <div className="pt-2 border-t border-white/[0.08] flex justify-between items-center text-sm font-bold text-white">
              <span className="text-white">Total Amount Paid</span>
              <span className="text-[#FF7135] text-lg font-black font-mono">
                ₹{(order.grandTotal || 0).toLocaleString()}
              </span>
            </div>
            <div className="pt-1 text-[10px] text-[#71717A] font-mono flex items-center justify-between">
              <span>Settlement: {order.paymentMethod || 'Razorpay Gateway'}</span>
              <span className="text-emerald-400 font-semibold">Payment Confirmed</span>
            </div>
          </div>

          {/* Action Navigation Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => {
                onClose();
                onViewMyOrders();
              }}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-[#FF7135] hover:bg-[#FF5C1B] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#FF7135]/25 hover:shadow-[#FF7135]/40 transition-all cursor-pointer"
            >
              <PackageCheck className="w-4 h-4" />
              <span>VIEW MY ORDERS</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-white/[0.06] hover:bg-white/10 border border-white/10 text-white font-semibold text-xs tracking-wider uppercase transition-colors cursor-pointer"
            >
              <span>CONTINUE SHOPPING</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
