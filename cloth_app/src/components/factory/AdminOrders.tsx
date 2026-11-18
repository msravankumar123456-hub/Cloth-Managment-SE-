import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OrderStatus, Order } from '../../types';
import { ShoppingBag, ChevronDown, ChevronUp, Truck, FileText, CheckCircle2, Clock } from 'lucide-react';

export const AdminOrders: React.FC = () => {
  const { orders, updateOrderStatus, setTrackingOrder, setActiveInvoice, invoices } = useApp();
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedOrderId(prev => prev === id ? null : id);
  };

  const statusOptions: OrderStatus[] = [
    'Pending',
    'Confirmed',
    'In Production',
    'Quality Check',
    'Dispatched',
    'Out for Delivery',
    'Delivered'
  ];

  return (
    <div className="space-y-6">
      
      <div>
        <h2 className="text-xl font-bold text-white">Wholesale Order Processing Pipeline</h2>
        <p className="text-xs text-[#71717A]">
          Manage production queuing, fabric cut assignments, and freight status. Changes sync live with the retailer portal.
        </p>
      </div>

      <div className="space-y-4">
        {orders.map(order => {
          const isExpanded = expandedOrderId === order.id;
          const invoice = invoices.find(i => i.orderId === order.id);

          return (
            <div
              key={order.id}
              className="rounded-2xl bg-[#17181C] border border-white/[0.08] hover:border-white/15 transition-all overflow-hidden"
            >
              {/* Header Summary Bar */}
              <div 
                onClick={() => toggleExpand(order.id)}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer bg-[#17181C] hover:bg-white/[0.02]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#FF7135]/15 border border-[#FF7135]/30 flex items-center justify-center text-[#FF7135] shrink-0 font-bold font-mono text-xs">
                    {order.totalPieces}p
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white text-sm">{order.orderNumber}</span>
                      <span className="text-xs text-[#71717A]">({order.date})</span>
                    </div>
                    <div className="text-xs text-[#A1A1AA] mt-0.5">
                      <strong>{order.retailerStore}</strong> • {order.retailerCity} ({order.retailerName})
                    </div>
                  </div>
                </div>

                {/* Right controls: Status selector & value */}
                <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
                  <div className="text-right">
                    <div className="text-sm font-bold text-[#FF7135] font-mono">₹{order.grandTotal.toLocaleString()}</div>
                    <div className="text-[10px] text-[#71717A]">{order.paymentMethod}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                      className="px-3 py-1.5 rounded-lg bg-[#101114] border border-white/10 text-xs font-semibold text-white focus:outline-none focus:border-[#FF7135]"
                    >
                      {statusOptions.map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>

                    <button
                      onClick={() => toggleExpand(order.id)}
                      className="p-1 rounded text-[#71717A] hover:text-white"
                      aria-label="Toggle details"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Details Pane */}
              {isExpanded && (
                <div className="p-5 bg-[#141519] border-t border-white/[0.06] space-y-4 text-xs animate-fade-in">
                  
                  {/* Carton Line Items */}
                  <div className="space-y-2">
                    <span className="font-mono text-[#71717A] uppercase text-[10px] font-semibold">
                      Packed Garment Lots
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {order.items.map(item => (
                        <div key={item.id} className="p-3 rounded-xl bg-[#101114] border border-white/10 flex items-start gap-3">
                          <img 
                            src={item.product.image} 
                            alt={item.product.name} 
                            className="w-12 h-14 object-cover rounded bg-[#17181C]" 
                          />
                          <div className="flex-1 min-w-0">
                            <h5 className="font-bold text-white text-xs truncate">{item.product.name}</h5>
                            <div className="text-[#A1A1AA] text-[11px] mt-0.5">
                              Color: {item.selectedColor} • Total: {item.totalQuantity} pcs
                            </div>

                            {/* Size matrix tags */}
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {Object.entries(item.sizes)
                                .filter(([_, q]) => q > 0)
                                .map(([s, q]) => (
                                  <span key={s} className="px-1.5 py-0.2 rounded bg-white/[0.04] text-[10px] font-mono text-[#D4D4D8]">
                                    {s}: {q}
                                  </span>
                                ))}
                            </div>
                          </div>

                          <div className="font-mono font-bold text-white text-right">
                            ₹{item.itemTotal.toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Consignment & Logistics Strip */}
                  <div className="p-3.5 rounded-xl bg-[#101114] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-[#FF7135]" />
                      <span className="text-[#A1A1AA]">
                        Logistics: <strong>{order.courierName}</strong> ({order.trackingNumber})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setTrackingOrder(order)}
                        className="px-3 py-1 rounded-lg bg-white/[0.05] hover:bg-white/10 text-white font-medium"
                      >
                        Inspect Tracking Timeline
                      </button>

                      {invoice && (
                        <button
                          onClick={() => setActiveInvoice(invoice)}
                          className="px-3 py-1 rounded-lg bg-[#FF7135]/20 hover:bg-[#FF7135]/30 border border-[#FF7135]/30 text-[#FF7135] font-semibold"
                        >
                          View GST Invoice
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
