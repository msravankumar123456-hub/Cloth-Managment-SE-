import React, { useState, useEffect } from 'react';
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
  Clock,
  RotateCcw,
  MapPin,
  Phone,
  Store,
  User,
  ShoppingBag,
  Loader2
} from 'lucide-react';
import { Order } from '../../types';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onOrderSuccess }) => {
  const { cart, placeOrder, currentUser, setCurrentView } = useApp();

  // Delivery & Business Details
  const [retailerName, setRetailerName] = useState('');
  const [retailerStore, setRetailerStore] = useState('');
  const [retailerCity, setRetailerCity] = useState('');
  const [retailerPhone, setRetailerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [pincode, setPincode] = useState('');

  // Payment Selection
  const [paymentMethod, setPaymentMethod] = useState<'Razorpay' | 'NEFT' | 'Credit'>('Razorpay');
  
  // Status & Error handling
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentFailed, setPaymentFailed] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Populate form with current retailer information
  useEffect(() => {
    if (currentUser) {
      setRetailerName(currentUser.name || '');
      setRetailerStore(currentUser.name ? `${currentUser.name} Fashion Store` : 'Loopmex Retail Partner');
      setRetailerCity(currentUser.place || 'Mumbai, Maharashtra');
      setRetailerPhone(currentUser.phone || '+91 98201 44520');
      setPincode(currentUser.pincode || '400001');
      if (!shippingAddress) {
        setShippingAddress(currentUser.place ? `Shop #12, Wholesale Textile Market, ${currentUser.place}` : 'Wholesale Textile Market');
      }
    }
  }, [currentUser]);

  if (!isOpen) return null;

  // Authorization check
  const isRetailer = currentUser?.role === 'retailer';

  // Order Financial calculations
  const totalPieces = cart.reduce((sum, item) => sum + (item.totalQuantity || 0), 0);
  const subtotal = cart.reduce((sum, item) => sum + (item.itemTotal || 0), 0);
  const gstAmount = Math.round(subtotal * 0.05);
  const grandTotal = subtotal + gstAmount;

  // 1. Process Successful Payment into Database
  const completeOrderPlacement = async (txnId: string, methodLabel: string) => {
    setIsProcessing(true);
    setPaymentFailed(false);
    setErrorMessage('');

    try {
      const createdOrder = await placeOrder({
        retailerName: retailerName.trim() || currentUser?.name || 'Retailer',
        retailerStore: retailerStore.trim() || 'Wholesale Boutique',
        retailerCity: retailerCity.trim() || 'Mumbai, Maharashtra',
        retailerPhone: retailerPhone.trim() || '+91 9876543210',
        shippingAddress: `${shippingAddress.trim()}${pincode ? `, PIN: ${pincode.trim()}` : ''}`,
        paymentMethod: methodLabel,
        paymentStatus: 'Paid',
        transactionId: txnId,
      });

      setIsProcessing(false);
      onOrderSuccess(createdOrder);
    } catch (err) {
      setIsProcessing(false);
      setPaymentFailed(true);
      const msg = err instanceof Error ? err.message : 'Database error while registering order.';
      setErrorMessage(`Order processing failed: ${msg}. Please retry.`);
    }
  };

  // 2. Open Razorpay Gateway
  const handleProceedToPayment = () => {
    if (!isRetailer) {
      setPaymentFailed(true);
      setErrorMessage('Only authorized retailer accounts can place orders.');
      return;
    }

    if (cart.length === 0) {
      setPaymentFailed(true);
      setErrorMessage('Your cart is empty. Please select products first.');
      return;
    }

    if (!retailerName.trim() || !retailerPhone.trim() || !shippingAddress.trim()) {
      setPaymentFailed(true);
      setErrorMessage('Please fill in your contact person name, phone number, and delivery address.');
      return;
    }

    setPaymentFailed(false);
    setErrorMessage('');

    // If Bank Wire or Factory Credit selected:
    if (paymentMethod === 'NEFT') {
      const fakeTxn = `NEFT-${Date.now().toString().slice(-8)}`;
      completeOrderPlacement(fakeTxn, 'NEFT / RTGS Wire');
      return;
    }

    if (paymentMethod === 'Credit') {
      const fakeTxn = `CREDIT-15D-${Date.now().toString().slice(-8)}`;
      completeOrderPlacement(fakeTxn, 'Factory Credit (15 Days)');
      return;
    }

    // Razorpay Integration
    setIsProcessing(true);

    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_51792567627loopmex';

    // Check if Razorpay Checkout script is loaded
    if (typeof window !== 'undefined' && window.Razorpay) {
      try {
        const options = {
          key: razorpayKey,
          amount: Math.round(grandTotal * 100), // amount in paise
          currency: 'INR',
          name: 'Loopmex Apparel Mills',
          description: `Wholesale Garment Order (${totalPieces} pcs)`,
          image: 'https://cdn-icons-png.flaticon.com/512/892/892458.png',
          prefill: {
            name: retailerName || currentUser?.name || '',
            email: currentUser?.email || '',
            contact: retailerPhone || currentUser?.phone || '',
          },
          theme: {
            color: '#FF7135',
            backdrop_color: 'rgba(16, 17, 20, 0.85)',
          },
          modal: {
            ondismiss: function () {
              setIsProcessing(false);
              setPaymentFailed(true);
              setErrorMessage('Payment cancelled by user. Cart items are preserved. Click Retry Payment to try again.');
            },
          },
          handler: function (response: any) {
            const txnId = response.razorpay_payment_id || `pay_${Date.now()}`;
            completeOrderPlacement(txnId, 'Razorpay UPI / Cards');
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
          setIsProcessing(false);
          setPaymentFailed(true);
          const reason = response.error?.description || response.error?.reason || 'Transaction declined by bank or gateway.';
          setErrorMessage(`Payment Failed: ${reason}`);
        });

        rzp.open();
      } catch (err) {
        setIsProcessing(false);
        setPaymentFailed(true);
        const msg = err instanceof Error ? err.message : 'Unable to initialize Razorpay gateway.';
        setErrorMessage(msg);
      }
    } else {
      // Fallback if third-party script is blocked by browser adblocker or offline
      setIsProcessing(false);
      setPaymentFailed(true);
      setErrorMessage('Razorpay Checkout SDK is still loading or blocked. You can use the Test Mode Instant Pay button below.');
    }
  };

  // Immediate Test Mode Payment Execution (for automated sandbox & quick demo)
  const handleTestModeQuickPay = () => {
    const testTxn = `pay_test_${Date.now()}`;
    completeOrderPlacement(testTxn, 'Razorpay Test Mode');
  };

  // If user is not logged in as a retailer:
  if (!isRetailer) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
        <div
          className="relative w-full max-w-md rounded-2xl bg-[#17181C] border border-amber-500/30 shadow-2xl shadow-black/95 text-[#F5F5F5] p-6 space-y-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          
          <div>
            <h3 className="text-lg font-bold text-white">Retailer Sign In Required</h3>
            <p className="text-xs text-[#A1A1AA] mt-1 leading-relaxed">
              Only authenticated Retailer accounts can purchase wholesale garments. Factory members and visitors can inspect inventory but cannot place orders.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => {
                onClose();
                setCurrentView('retailer-auth');
              }}
              className="w-full py-3 rounded-xl bg-[#FF7135] hover:bg-[#FF5C1B] text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-[#FF7135]/25"
            >
              Sign In to Retailer Account
            </button>
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/10 text-[#A1A1AA] hover:text-white text-xs font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl my-auto rounded-2xl bg-[#17181C] border border-white/15 shadow-2xl shadow-black/95 text-[#F5F5F5] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Titlebar */}
        <div className="px-6 py-4 bg-[#141519] border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
            <span className="ml-2 text-xs font-mono font-medium text-[#A1A1AA]">
              Loopmex B2B Checkout Terminal • Secured by Razorpay
            </span>
          </div>

          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1 rounded-lg hover:bg-white/10 text-[#A1A1AA] hover:text-white transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form Content */}
        <div className="p-6 sm:p-7 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Failure Alert Banner (Preserves Cart & Allows Retry) */}
          {paymentFailed && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-2 animate-fade-in">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white">Payment Incomplete / Failed</h4>
                  <p className="text-rose-300 mt-0.5">{errorMessage || 'The payment could not be completed.'}</p>
                  <p className="text-[11px] text-[#A1A1AA] mt-1">
                    Your cart items and delivery details have been safely preserved. No amount was deducted.
                  </p>
                </div>
              </div>

              <div className="pt-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleProceedToPayment}
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>RETRY PAYMENT</span>
                </button>
                <button
                  type="button"
                  onClick={handleTestModeQuickPay}
                  disabled={isProcessing}
                  className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors"
                >
                  Pay via Test Mode
                </button>
              </div>
            </div>
          )}

          {/* Order Summary Strip */}
          <div className="p-4 rounded-xl bg-[#101114] border border-white/[0.08] flex items-center justify-between text-xs">
            <div>
              <span className="text-[#71717A] uppercase font-mono text-[10px]">Consignment Lot</span>
              <div className="text-sm font-bold text-white mt-0.5 flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-[#FF7135]" />
                <span>{totalPieces} Pieces across {cart.length} SKUs</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[#71717A] uppercase font-mono text-[10px]">Payable Amount (+5% GST)</span>
              <div className="text-base sm:text-lg font-black text-[#FF7135] mt-0.5 font-mono">
                ₹{grandTotal.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Delivery & Consignee Form */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono uppercase tracking-wider text-[#FF7135] font-semibold flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5" />
                <span>Consignee & Shipping Destination</span>
              </h4>
              <span className="text-[10px] text-[#71717A] font-mono">Step 1 of 2</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] text-[#A1A1AA] mb-1">Store / Business Name *</label>
                <input
                  type="text"
                  value={retailerStore}
                  onChange={(e) => setRetailerStore(e.target.value)}
                  placeholder="e.g. Aura Garments & Apparels"
                  className="w-full px-3 py-2 rounded-lg bg-[#101114] border border-white/10 text-xs text-white focus:outline-none focus:border-[#FF7135]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#A1A1AA] mb-1">Authorized Contact Person *</label>
                <input
                  type="text"
                  value={retailerName}
                  onChange={(e) => setRetailerName(e.target.value)}
                  placeholder="e.g. Rajesh Sharma"
                  className="w-full px-3 py-2 rounded-lg bg-[#101114] border border-white/10 text-xs text-white focus:outline-none focus:border-[#FF7135]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#A1A1AA] mb-1">Phone Number (Dispatch Contact) *</label>
                <input
                  type="text"
                  value={retailerPhone}
                  onChange={(e) => setRetailerPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-3 py-2 rounded-lg bg-[#101114] border border-white/10 text-xs text-white focus:outline-none focus:border-[#FF7135]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#A1A1AA] mb-1">City & State *</label>
                <input
                  type="text"
                  value={retailerCity}
                  onChange={(e) => setRetailerCity(e.target.value)}
                  placeholder="e.g. Mumbai, Maharashtra"
                  className="w-full px-3 py-2 rounded-lg bg-[#101114] border border-white/10 text-xs text-white focus:outline-none focus:border-[#FF7135]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] text-[#A1A1AA] mb-1">Full Shop / Delivery Address *</label>
                <input
                  type="text"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="e.g. Shop #14, Ground Floor, Textile Market, Ring Road"
                  className="w-full px-3 py-2 rounded-lg bg-[#101114] border border-white/10 text-xs text-white focus:outline-none focus:border-[#FF7135]"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono uppercase tracking-wider text-[#FF7135] font-semibold flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" />
                <span>Select Payment Gateway Method</span>
              </h4>
              <span className="text-[10px] text-[#71717A] font-mono">Step 2 of 2</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Option 1: Razorpay */}
              <button
                type="button"
                onClick={() => setPaymentMethod('Razorpay')}
                className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  paymentMethod === 'Razorpay'
                    ? 'bg-[#FF7135]/15 border-[#FF7135] text-white shadow-md shadow-[#FF7135]/10'
                    : 'bg-[#101114] border-white/10 text-[#A1A1AA] hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className="text-[#FF7135]">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[9px] font-bold">
                    RECOMMENDED
                  </span>
                </div>
                <div className="text-xs font-bold text-white">Razorpay Secure</div>
                <div className="text-[10px] text-[#71717A] mt-0.5">UPI, QR, Cards, NetBanking</div>
              </button>

              {/* Option 2: NEFT */}
              <button
                type="button"
                onClick={() => setPaymentMethod('NEFT')}
                className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  paymentMethod === 'NEFT'
                    ? 'bg-[#FF7135]/15 border-[#FF7135] text-white shadow-md shadow-[#FF7135]/10'
                    : 'bg-[#101114] border-white/10 text-[#A1A1AA] hover:border-white/20'
                }`}
              >
                <div className="text-[#FF7135] mb-2">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-white">NEFT / RTGS Wire</div>
                <div className="text-[10px] text-[#71717A] mt-0.5">Direct Factory Escrow</div>
              </button>

              {/* Option 3: Credit */}
              <button
                type="button"
                onClick={() => setPaymentMethod('Credit')}
                className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  paymentMethod === 'Credit'
                    ? 'bg-[#FF7135]/15 border-[#FF7135] text-white shadow-md shadow-[#FF7135]/10'
                    : 'bg-[#101114] border-white/10 text-[#A1A1AA] hover:border-white/20'
                }`}
              >
                <div className="text-[#FF7135] mb-2">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-white">Factory Credit (15D)</div>
                <div className="text-[10px] text-[#71717A] mt-0.5">B2B Verified Term</div>
              </button>
            </div>
          </div>

          {/* Action Button Section */}
          <div className="space-y-3 pt-2">
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleProceedToPayment}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-[#FF7135] hover:bg-[#FF5C1B] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xl shadow-[#FF7135]/25 hover:shadow-[#FF7135]/40 cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>INITIALIZING PAYMENT GATEWAY...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>PROCEED TO PAY ₹{grandTotal.toLocaleString()}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Quick Test Mode Option */}
            <div className="flex items-center justify-between px-2 text-[11px] text-[#71717A]">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                256-bit SSL Encrypted Payment
              </span>
              <button
                type="button"
                onClick={handleTestModeQuickPay}
                disabled={isProcessing}
                className="text-[#FF7135] hover:underline font-medium cursor-pointer"
              >
                Instant Test Pay (Skip Popup)
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
