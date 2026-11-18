import React from 'react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus } from '../../types';
import { X, Check, Truck, Package, Clock, ShieldCheck, MapPin } from 'lucide-react';

interface OrderTrackingModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const steps: { status: OrderStatus; label: string; desc: string }[] = [
    { status: 'Confirmed', label: 'Order Confirmed', desc: 'Fabric requisition and batch lot assigned at mill' },
    { status: 'In Production', label: 'Cutting & Stitching', desc: 'Fabric rolls cut and precision assembled in unit 2' },
    { status: 'Quality Check', label: 'QC & Packaging', desc: 'Tear-strength verified, ironed & packed into 50-pc cartons' },
    { status: 'Dispatched', label: 'Freight Dispatched', desc: `Handed over to ${order.courierName} with Waybill` },
    { status: 'Out for Delivery', label: 'Out for Local Transit', desc: 'Arrived at destination logistics hub' },
    { status: 'Delivered', label: 'Delivered to Retailer', desc: 'Received and verified at retail shop' },
  ];

  const getStepIndex = (st: OrderStatus) => {
    return steps.findIndex(s => s.status === st);
  };

  const currentIndex = getStepIndex(order.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-xl rounded-2xl bg-[#17181C] border border-white/15 shadow-2xl shadow-black/95 text-[#F5F5F5] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Titlebar */}
        <div className="px-5 py-3.5 bg-[#141519] border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
            <span className="ml-2 text-xs font-mono text-[#A1A1AA]">
              Consignment Tracking — {order.orderNumber}
            </span>
          </div>

          <button onClick={onClose} className="p-1 rounded hover:bg-white/10 text-[#A1A1AA]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[82vh] overflow-y-auto">
          
          {/* Waybill Strip */}
          <div className="p-4 rounded-xl bg-[#101114] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-[#71717A] uppercase font-mono text-[10px]">Logistics Partner</span>
              <div className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                <Truck className="w-4 h-4 text-[#FF7135]" />
                <span>{order.courierName}</span>
              </div>
            </div>

            <div>
              <span className="text-[#71717A] uppercase font-mono text-[10px]">Tracking Number</span>
              <div className="font-mono text-sm text-[#FF7135] font-bold mt-0.5">{order.trackingNumber}</div>
            </div>

            <div>
              <span className="text-[#71717A] uppercase font-mono text-[10px]">Est. Store Delivery</span>
              <div className="text-sm font-bold text-emerald-400 mt-0.5">{order.estimatedDelivery}</div>
            </div>
          </div>

          {/* Destination */}
          <div className="flex items-start gap-2.5 text-xs text-[#A1A1AA]">
            <MapPin className="w-4 h-4 text-[#FF7135] shrink-0 mt-0.5" />
            <div>
              <span className="text-white font-medium">{order.retailerStore}</span>
              <span className="text-[#71717A]"> — {order.retailerCity}</span>
            </div>
          </div>

          {/* Timeline */}
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-white/10">
            {steps.map((step, idx) => {
              const isPast = idx < currentIndex;
              const isCurrent = idx === currentIndex;
              const isFuture = idx > currentIndex;

              return (
                <div key={step.status} className="relative flex items-start gap-4">
                  {/* Indicator Dot */}
                  <div className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isPast
                      ? 'bg-emerald-500 text-black'
                      : isCurrent
                      ? 'bg-[#FF7135] text-white ring-4 ring-[#FF7135]/25 animate-pulse'
                      : 'bg-[#101114] border border-white/20 text-[#71717A]'
                  }`}>
                    {isPast ? <Check className="w-3 h-3 stroke-[3]" /> : idx + 1}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className={`text-sm font-semibold ${isFuture ? 'text-[#71717A]' : 'text-white'}`}>
                        {step.label}
                      </h4>
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded bg-[#FF7135]/20 text-[#FF7135] text-[10px] font-mono font-medium">
                          Active Phase
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#71717A] mt-0.5">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Packed Items Preview in Order */}
          <div className="p-4 rounded-xl bg-[#101114] border border-white/[0.06] space-y-2 text-xs">
            <span className="text-[#71717A] font-mono uppercase text-[10px]">Carton Contents</span>
            {order.items.map(item => (
              <div key={item.id} className="flex justify-between py-1 border-b border-white/[0.04] last:border-0">
                <span className="text-white font-medium">{item.product.name} ({item.selectedColor})</span>
                <span className="font-mono text-[#A1A1AA]">{item.totalQuantity} pcs • ₹{item.itemTotal.toLocaleString()}</span>
              </div>
            ))}
            <div className="pt-2 flex justify-between font-bold text-white">
              <span>Grand Total (+5% GST)</span>
              <span className="text-[#FF7135]">₹{order.grandTotal.toLocaleString()}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
