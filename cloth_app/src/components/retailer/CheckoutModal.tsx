import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  CreditCard, 
  Building2, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  QrCode,
  FileText,
  Clock
} from 'lucide-react';
import { Order } from '../../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onOrderSuccess }) => {
  const { cart, placeOrder, setTrackingOrder, currentUser } = useApp();

  const [retailerName, setRetailerName] = useState(() => currentUser?.name || 'Rajesh Sharma');
  const [retailerStore, setRetailerStore] = useState(() => currentUser?.name ? `${currentUser.name}'s Boutique` : 'Aura Garments & Apparels');
  const [retailerCity, setRetailerCity] = useState(() => currentUser?.place || 'Mumbai, Maharashtra');
  const [retailerPhone, setRetailerPhone] = useState(() => currentUser?.phone || '+91 98201 44520');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'NEFT / RTGS' | 'Factory Credit (15 Days)'>('UPI');
  
  // Update state if currentUser becomes available
  React.useEffect(() => {
    if (currentUser) {
      if (currentUser.name) setRetailerName(currentUser.name);
      if (currentUser.place) setRetailerCity(currentUser.place);
      if (currentUser.phone) setRetailerPhone(currentUser.phone);
    }
  }, [currentUser]);

  // Simulation states
  const [isProcessing, setIsProcessing] = useState(false);
  const [simulationResult, setSimulationResult] = useState<'success' | 'failure' | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const totalPieces = cart.reduce((sum, item) => sum + item.totalQuantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.itemTotal, 0);
  const gstAmount = Math.round(subtotal * 0.05);
  const grandTotal = subtotal + gstAmount;

  const handleSimulatePayment = async (forceResult: 'success' | 'failure') => {
    setIsProcessing(true);
    setSimulationResult(null);
    setErrorMessage('');

    if (forceResult === 'failure') {
      setTimeout(() => {
        setIsProcessing(false);
        setSimulationResult('failure');
        setErrorMessage('Simulated Bank Gateway Error: Insufficient B2B overdraft limit or transaction timeout. Please retry with NEFT or Factory Credit.');
      }, 800);
      return;
    }

    try {
      const createdOrder = await placeOrder({
        retailerName,
        retailerStore,
        retailerCity,
        retailerPhone,
        paymentMethod,
      });
      setIsProcessing(false);
      setSimulationResult('success');
      onOrderSuccess(createdOrder);
    } catch (error) {
      setIsProcessing(false);
      setSimulationResult('failure');
      setErrorMessage(error instanceof Error ? error.message : 'Unable to place the order. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-2xl rounded-2xl bg-[#17181C] border border-white/15 shadow-2xl shadow-black/95 text-[#F5F5F5] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#141519] border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
            <span className="ml-2 text-xs font-mono text-[#A1A1AA]">
              B2B Wholesale Checkout Terminal & Escrow Settlement
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-[#A1A1AA] hover:text-white"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-7 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Order Summary Strip */}
          <div className="p-4 rounded-xl bg-[#101114] border border-white/[0.08] flex items-center justify-between text-xs">
            <div>
              <span className="text-[#71717A] uppercase font-mono">Carton Lot</span>
              <div className="text-sm font-bold text-white mt-0.5">{totalPieces} Pieces across {cart.length} SKUs</div>
            </div>
            <div className="text-right">
              <span className="text-[#71717A] uppercase font-mono">Settlement Amount</span>
              <div className="text-base font-black text-[#FF7135] mt-0.5">₹{grandTotal.toLocaleString()}</div>
            </div>
          </div>

          {/* Business Details Form */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#FF7135] font-semibold">
              Consignee & Retailer Details
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-[#A1A1AA] mb-1">Store / Business Name</label>
                <input
                  type="text"
                  value={retailerStore}
                  onChange={(e) => setRetailerStore(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#101114] border border-white/10 text-xs text-white focus:outline-none focus:border-[#FF7135]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#A1A1AA] mb-1">Authorized Contact Person</label>
                <input
                  type="text"
                  value={retailerName}
                  onChange={(e) => setRetailerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#101114] border border-white/10 text-xs text-white focus:outline-none focus:border-[#FF7135]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#A1A1AA] mb-1">Destination City & State</label>
                <input
                  type="text"
                  value={retailerCity}
                  onChange={(e) => setRetailerCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#101114] border border-white/10 text-xs text-white focus:outline-none focus:border-[#FF7135]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#A1A1AA] mb-1">Dispatch Phone Contact</label>
                <input
                  type="text"
                  value={retailerPhone}
                  onChange={(e) => setRetailerPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#101114] border border-white/10 text-xs text-white focus:outline-none focus:border-[#FF7135]"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#FF7135] font-semibold">
              Select Wholesale Settlement Method
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                { id: 'UPI', label: 'B2B UPI Instant', icon: <QrCode className="w-4 h-4" /> },
                { id: 'NEFT / RTGS', label: 'NEFT / RTGS Wire', icon: <Building2 className="w-4 h-4" /> },
                { id: 'Factory Credit (15 Days)', label: 'Factory Credit (15D)', icon: <Clock className="w-4 h-4" /> },
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPaymentMethod(opt.id as any)}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    paymentMethod === opt.id
                      ? 'bg-[#FF7135]/15 border-[#FF7135] text-white shadow-sm'
                      : 'bg-[#101114] border-white/10 text-[#A1A1AA] hover:border-white/20'
                  }`}
                >
                  <div className="text-[#FF7135] mb-2">{opt.icon}</div>
                  <div className="text-xs font-bold">{opt.label}</div>
                  <div className="text-[10px] text-[#71717A] mt-1">Verified settlement</div>
                </button>
              ))}
            </div>
          </div>

          {/* Simulation Gateway Controls */}
          <div className="p-4 rounded-xl bg-[#101114] border border-white/10 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-[#D4D4D8] font-semibold">Interactive Prototype Simulation Sandbox</span>
              <span className="text-[10px] text-[#71717A]">Test both scenarios</span>
            </div>

            {simulationResult === 'failure' && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => handleSimulatePayment('success')}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#FF7135] hover:bg-[#FF5C1B] text-white font-semibold text-xs transition-all shadow-md shadow-[#FF7135]/25 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <span>Processing Gateway...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Simulate Payment Success</span>
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={isProcessing}
                onClick={() => handleSimulatePayment('failure')}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/[0.04] hover:bg-rose-950/30 border border-white/10 hover:border-rose-500/30 text-rose-300 font-medium text-xs transition-all cursor-pointer disabled:opacity-50"
              >
                <AlertCircle className="w-4 h-4" />
                <span>Simulate Gateway Failure</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
