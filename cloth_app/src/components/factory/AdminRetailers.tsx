import React from 'react';
import { useApp } from '../../context/AppContext';
import { Users, Building2, MapPin, Phone, Mail, ShieldCheck, BadgePercent } from 'lucide-react';

export const AdminRetailers: React.FC = () => {
  const { retailers, showToast } = useApp();

  const handleAdjustCredit = (businessName: string) => {
    showToast(`Credit limit review initiated for ${businessName}. Credit memo updated.`, 'info');
  };

  return (
    <div className="space-y-6">
      
      <div>
        <h2 className="text-xl font-bold text-white">Verified Retail Buyer Network</h2>
        <p className="text-xs text-[#71717A]">
          Authorized garment store owners, boutique chains, and regional wholesale distributors.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {retailers.map(r => (
          <div 
            key={r.id}
            className="p-5 rounded-2xl bg-[#17181C] border border-white/[0.08] hover:border-white/15 transition-all space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-white font-bold">
                  <Building2 className="w-5 h-5 text-[#FF7135]" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">{r.businessName}</h3>
                  <div className="text-xs text-[#A1A1AA] flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3 h-3 text-[#71717A]" />
                    <span>{r.city}, {r.state}</span>
                  </div>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-bold">
                GSTIN Verified
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#101114] border border-white/[0.04] grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[#71717A] text-[10px] uppercase font-mono">Authorized Contact</span>
                <div className="text-white font-medium mt-0.5">{r.name}</div>
                <div className="text-[#71717A] text-[11px]">{r.phone}</div>
              </div>

              <div>
                <span className="text-[#71717A] text-[10px] uppercase font-mono">Buyer GSTIN</span>
                <div className="text-white font-mono mt-0.5">{r.gstNumber}</div>
                <div className="text-[#71717A] text-[11px]">Since {r.joinedDate}</div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-white/[0.04]">
              <div>
                <span className="text-[#71717A]">Lifetime Procurement: </span>
                <span className="font-mono font-bold text-white">₹{r.totalSpent.toLocaleString()}</span>
              </div>

              <div className="text-right">
                <span className="text-[#71717A]">Credit Limit: </span>
                <span className="font-mono font-bold text-[#FF7135]">₹{r.creditLimit.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => handleAdjustCredit(r.businessName)}
              className="w-full py-2 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-colors"
            >
              Review Factory Credit Line
            </button>
          </div>
        ))}
      </div>

    </div>
  );
};
