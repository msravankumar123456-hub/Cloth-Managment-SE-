import React from 'react';
import { useApp } from '../../context/AppContext';
import { SizeBreakdown } from '../../types';
import { Layers, AlertTriangle, CheckCircle2, Plus, Minus } from 'lucide-react';

export const AdminInventory: React.FC = () => {
  const { products, updateStock } = useApp();

  const handleAdjust = (productId: string, size: keyof SizeBreakdown, delta: number, current: number) => {
    updateStock(productId, size, Math.max(0, current + delta));
  };

  return (
    <div className="space-y-6">
      
      <div>
        <h2 className="text-xl font-bold text-white">Size-wise Stock & Inventory Matrix</h2>
        <p className="text-xs text-[#71717A]">
          Direct mill floor stock controls. Real-time changes immediately update the retailer ordering catalogue.
        </p>
      </div>

      <div className="rounded-2xl bg-[#17181C] border border-white/[0.08] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#141519] border-b border-white/[0.08] text-[#71717A] font-mono text-[11px]">
              <tr>
                <th className="py-3 px-4">Garment Line</th>
                <th className="py-3 px-3 text-center">Size S</th>
                <th className="py-3 px-3 text-center">Size M</th>
                <th className="py-3 px-3 text-center">Size L</th>
                <th className="py-3 px-3 text-center">Size XL</th>
                <th className="py-3 px-3 text-center">Size XXL</th>
                <th className="py-3 px-4 text-center">Total Pcs</th>
                <th className="py-3 px-4 text-right">Loom Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {products.map(p => {
                const total = Object.values(p.stock).reduce((a, b) => a + b, 0);
                const hasLowStock = Object.values(p.stock).some(qty => qty < 80);

                return (
                  <tr key={p.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img 
                          src={p.image} 
                          alt={p.name} 
                          className="w-9 h-11 object-cover rounded bg-[#101114] border border-white/10 shrink-0" 
                        />
                        <div>
                          <div className="font-bold text-white">{p.name}</div>
                          <div className="text-[10px] text-[#71717A] font-mono">{p.category} • ₹{p.wholesalePrice}/pc</div>
                        </div>
                      </div>
                    </td>

                    {/* S, M, L, XL, XXL Columns with Inline Adjusters */}
                    {(['S', 'M', 'L', 'XL', 'XXL'] as (keyof SizeBreakdown)[]).map(sz => {
                      const qty = p.stock[sz];
                      const isLow = qty < 80;

                      return (
                        <td key={sz} className="py-3 px-2 text-center">
                          <div className={`p-1.5 rounded-lg border flex items-center justify-between gap-1 w-24 mx-auto ${
                            isLow ? 'bg-amber-500/10 border-amber-500/30' : 'bg-[#101114] border-white/10'
                          }`}>
                            <button
                              onClick={() => handleAdjust(p.id, sz, -10, qty)}
                              className="w-5 h-5 rounded flex items-center justify-center text-[#71717A] hover:text-white hover:bg-white/10"
                              title="Decrease 10 pcs"
                            >
                              <Minus className="w-3 h-3" />
                            </button>

                            <span className={`font-mono font-bold text-xs ${isLow ? 'text-amber-400' : 'text-white'}`}>
                              {qty}
                            </span>

                            <button
                              onClick={() => handleAdjust(p.id, sz, 10, qty)}
                              className="w-5 h-5 rounded flex items-center justify-center text-[#71717A] hover:text-white hover:bg-white/10"
                              title="Increase 10 pcs"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      );
                    })}

                    <td className="py-3 px-4 text-center font-mono font-bold text-white text-sm">
                      {total}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {hasLowStock ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          <AlertTriangle className="w-3 h-3" />
                          Low Stock Alert
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          Balanced Buffer
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
