import React, { useState } from 'react';
import { 
  X, 
  Store, 
  Trash2, 
  AlertTriangle, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  ShoppingBag, 
  CreditCard, 
  FileText, 
  ShieldAlert,
  CheckCircle2
} from 'lucide-react';
import { Retailer, Order } from '../../types';

interface RetailerDetailModalProps {
  retailer: Retailer | null;
  orders: Order[];
  onClose: () => void;
  onRemoveRetailer: (retailerId: string) => Promise<{ success: boolean; message?: string }>;
}

export const RetailerDetailModal: React.FC<RetailerDetailModalProps> = ({
  retailer,
  orders,
  onClose,
  onRemoveRetailer,
}) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!retailer) return null;

  // Calculate order count for this retailer
  const retailerOrders = orders.filter(
    o => o.retailerName === retailer.name || 
         o.retailerStore === retailer.businessName || 
         (o as any).retailer_id === retailer.id
  );
  const totalOrdersCount = retailerOrders.length > 0 ? retailerOrders.length : retailer.activeOrdersCount || 0;

  const handleConfirmRemove = async () => {
    setErrorMessage(null);
    setIsRemoving(true);
    try {
      const res = await onRemoveRetailer(retailer.id);
      if (res.success) {
        onClose();
      } else {
        setErrorMessage(res.message || 'Failed to remove account.');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to remove account.';
      setErrorMessage(msg);
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-lg rounded-2xl bg-[#17181C] border border-white/[0.12] shadow-2xl shadow-black/90 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between bg-[#141519]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF7135]/15 border border-[#FF7135]/30 flex items-center justify-center text-[#FF7135]">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">{retailer.name}</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[10px]">
                  Verified Retailer
                </span>
              </div>
              <p className="text-xs text-[#71717A]">{retailer.businessName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isRemoving}
            className="p-2 rounded-xl text-[#A1A1AA] hover:text-white hover:bg-white/[0.06] transition-colors disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#101114] border border-white/[0.06]">
              <div className="flex items-center gap-1.5 text-[#71717A] mb-1 font-mono uppercase tracking-wider text-[10px]">
                <Store className="w-3.5 h-3.5 text-[#FF7135]" />
                Retailer Name
              </div>
              <p className="font-semibold text-white truncate">{retailer.name}</p>
            </div>

            <div className="p-3 rounded-xl bg-[#101114] border border-white/[0.06]">
              <div className="flex items-center gap-1.5 text-[#71717A] mb-1 font-mono uppercase tracking-wider text-[10px]">
                <FileText className="w-3.5 h-3.5 text-[#A78BFA]" />
                Business Name
              </div>
              <p className="font-semibold text-white truncate">{retailer.businessName}</p>
            </div>

            <div className="p-3 rounded-xl bg-[#101114] border border-white/[0.06]">
              <div className="flex items-center gap-1.5 text-[#71717A] mb-1 font-mono uppercase tracking-wider text-[10px]">
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                Email Address
              </div>
              <p className="font-mono text-white truncate text-[11px]">{retailer.email || '—'}</p>
            </div>

            <div className="p-3 rounded-xl bg-[#101114] border border-white/[0.06]">
              <div className="flex items-center gap-1.5 text-[#71717A] mb-1 font-mono uppercase tracking-wider text-[10px]">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                Phone Number
              </div>
              <p className="font-mono text-white">{retailer.phone || '—'}</p>
            </div>

            <div className="p-3 rounded-xl bg-[#101114] border border-white/[0.06]">
              <div className="flex items-center gap-1.5 text-[#71717A] mb-1 font-mono uppercase tracking-wider text-[10px]">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                City & State
              </div>
              <p className="text-white truncate">
                {retailer.city ? `${retailer.city}${retailer.state ? `, ${retailer.state}` : ''}` : '—'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#101114] border border-white/[0.06]">
              <div className="flex items-center gap-1.5 text-[#71717A] mb-1 font-mono uppercase tracking-wider text-[10px]">
                <Calendar className="w-3.5 h-3.5 text-pink-400" />
                Registration Date
              </div>
              <p className="text-white">{retailer.joinedDate || 'Nov 2026'}</p>
            </div>

            <div className="p-3 rounded-xl bg-[#101114] border border-white/[0.06]">
              <div className="flex items-center gap-1.5 text-[#71717A] mb-1 font-mono uppercase tracking-wider text-[10px]">
                <ShoppingBag className="w-3.5 h-3.5 text-indigo-400" />
                Total Orders
              </div>
              <p className="font-mono font-bold text-white text-sm">{totalOrdersCount} orders</p>
            </div>

            <div className="p-3 rounded-xl bg-[#101114] border border-white/[0.06]">
              <div className="flex items-center gap-1.5 text-[#71717A] mb-1 font-mono uppercase tracking-wider text-[10px]">
                <CreditCard className="w-3.5 h-3.5 text-[#FF7135]" />
                Total Spent
              </div>
              <p className="font-mono font-bold text-[#FF7135] text-sm">
                ₹{retailer.totalSpent.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Additional details if available */}
          {(retailer.gstNumber || retailer.address) && (
            <div className="p-3.5 rounded-xl bg-[#101114] border border-white/[0.06] text-xs space-y-1.5">
              {retailer.gstNumber && (
                <div className="flex items-center justify-between">
                  <span className="text-[#71717A] text-[11px]">GSTIN</span>
                  <span className="font-mono text-white text-[11px]">{retailer.gstNumber}</span>
                </div>
              )}
              {retailer.address && (
                <div className="flex items-start justify-between gap-4">
                  <span className="text-[#71717A] text-[11px]">Address</span>
                  <span className="text-right text-[#A1A1AA] text-[11px] truncate">{retailer.address}</span>
                </div>
              )}
            </div>
          )}

          {/* Confirmation Box (when Admin clicks Remove) */}
          {showConfirm ? (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 space-y-3 animate-fade-in">
              <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>Confirm Retailer Account Removal</span>
              </div>
              <p className="text-xs text-[#D4D4D8] leading-relaxed">
                Are you sure you want to remove this retailer account?
              </p>
              <div className="p-2.5 rounded-lg bg-black/40 border border-red-500/20 text-xs text-[#A1A1AA] space-y-1 font-mono">
                <div><span className="text-[#71717A]">Retailer:</span> <strong className="text-white">{retailer.name}</strong></div>
                <div><span className="text-[#71717A]">Email:</span> <strong className="text-white">{retailer.email || '—'}</strong></div>
              </div>
              <div className="flex items-start gap-1.5 text-[11px] text-[#A1A1AA]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>
                  Historical orders, invoices, and transaction totals will be <strong>safely preserved</strong>. The retailer will be permanently deactivated and unable to log in.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  disabled={isRemoving}
                  className="px-3 py-2 rounded-xl bg-white/[0.05] hover:bg-white/10 text-xs text-[#A1A1AA] hover:text-white transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRemove}
                  disabled={isRemoving}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition-all shadow-lg shadow-red-600/30 disabled:opacity-50 cursor-pointer"
                >
                  {isRemoving ? (
                    <>
                      <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Removing...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      Confirm Removal
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Bottom Action: Remove Retailer Account Button */
            <div className="pt-2 flex items-center justify-between border-t border-white/[0.06]">
              <button
                type="button"
                onClick={() => setShowConfirm(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 text-red-400 hover:text-red-300 text-xs font-semibold transition-all duration-200 cursor-pointer shadow-sm hover:shadow-red-500/10"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
                <span>Remove Retailer Account</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/10 text-xs text-[#A1A1AA] hover:text-white transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
