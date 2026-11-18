import React from 'react';
import { useApp } from '../../context/AppContext';
import { Truck, MapPin, Package, CheckCircle2, ArrowRight } from 'lucide-react';

export const AdminDeliveries: React.FC = () => {
  const { orders, setTrackingOrder, showToast } = useApp();

  const handleUpdateDeliveryNotice = (orderNumber: string) => {
    showToast(`Logistics dispatch notice broadcasted to driver for ${orderNumber}`, 'success');
  };

  return (
    <div className="space-y-6">
      
      <div>
        <h2 className="text-xl font-bold text-white">Factory Dispatch & Freight Logistics</h2>
        <p className="text-xs text-[#71717A]">
          Manage master carton waybills, driver dispatches, and interstate road freight.
        </p>
      </div>

      <div className="rounded-2xl bg-[#17181C] border border-white/[0.08] overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#141519] border-b border-white/[0.08] text-[#71717A] font-mono text-[11px]">
            <tr>
              <th className="py-3 px-4">Order Ref</th>
              <th className="py-3 px-4">Carrier / Freight Partner</th>
              <th className="py-3 px-4">Consignment #</th>
              <th className="py-3 px-4">Destination Store</th>
              <th className="py-3 px-4 text-center">Volume</th>
              <th className="py-3 px-4">Est. Delivery</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {orders.map(o => (
              <tr key={o.id} className="hover:bg-white/[0.02]">
                <td className="py-3 px-4 font-mono font-bold text-white">{o.orderNumber}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2 font-medium text-white">
                    <Truck className="w-3.5 h-3.5 text-[#FF7135]" />
                    <span>{o.courierName}</span>
                  </div>
                </td>
                <td className="py-3 px-4 font-mono text-[#FF7135]">{o.trackingNumber}</td>
                <td className="py-3 px-4">
                  <div className="font-semibold text-white">{o.retailerStore}</div>
                  <div className="text-[10px] text-[#71717A]">{o.retailerCity}</div>
                </td>
                <td className="py-3 px-4 text-center font-mono text-white">{o.totalPieces} pcs</td>
                <td className="py-3 px-4 text-[#A1A1AA]">{o.estimatedDelivery}</td>
                <td className="py-3 px-4 text-center">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    o.status === 'Delivered'
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : o.status === 'Dispatched'
                      ? 'bg-[#FF7135]/20 text-[#FF7135]'
                      : 'bg-white/10 text-[#A1A1AA]'
                  }`}>
                    {o.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => setTrackingOrder(o)}
                    className="px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-[#FF7135] text-white text-[11px] font-semibold transition-colors"
                  >
                    Track Timeline
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};
