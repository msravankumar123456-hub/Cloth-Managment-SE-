import React from 'react';
import { useApp } from './context/AppContext';
import { TopNav } from './components/shared/TopNav';
import { Toast } from './components/shared/Toast';

// Landing Page Components
import { Hero } from './components/landing/Hero';
import { TrustStrip } from './components/landing/TrustStrip';
import { FeaturedCollection } from './components/landing/FeaturedCollection';
import { AppPreviewSection } from './components/landing/AppPreviewSection';
import { FactoryShowcase } from './components/landing/FactoryShowcase';
import { BentoBenefits } from './components/landing/BentoBenefits';
import { AccessPortals } from './components/landing/AccessPortals';
import { AboutContact } from './components/landing/AboutContact';
import { Footer } from './components/landing/Footer';

// Portal Views
import { RetailerPortal } from './components/retailer/RetailerPortal';
import { FactoryAdminPortal } from './components/factory/FactoryAdminPortal';
import { AdminPortal } from './components/admin/AdminPortal';

// Auth Views
import { RetailerAuth } from './components/shared/RetailerAuth';
import { FactoryAuth } from './components/shared/FactoryAuth';
import { AdminAuth } from './components/shared/AdminAuth';

// Modals on Landing Page
import { ProductDetailModal } from './components/retailer/ProductDetailModal';
import { ProductDetailPage } from './components/product/ProductDetailPage';
import { CartDrawer } from './components/retailer/CartDrawer';
import { CheckoutModal } from './components/retailer/CheckoutModal';
import { OrderConfirmationModal } from './components/retailer/OrderConfirmationModal';
import { OrderTrackingModal } from './components/retailer/OrderTrackingModal';
import { InvoicesView } from './components/retailer/InvoicesView';
import { Order } from './types';

export const App: React.FC = () => {
  const { 
    currentView, 
    setCurrentView,
    selectedProductForDetail, 
    setSelectedProductForDetail,
    isCartOpen, 
    setIsCartOpen,
    trackingOrder, 
    setTrackingOrder,
    activeInvoice, 
    setActiveInvoice,
    isAuthenticated 
  } = useApp();

  const [isCheckoutOpen, setIsCheckoutOpen] = React.useState(false);
  const [confirmedOrder, setConfirmedOrder] = React.useState<Order | null>(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-[#101114] text-[#F5F5F5] font-sans antialiased selection:bg-[#FF7135]/30 selection:text-white">
      {/* Universal Floating Navigation Bar */}
      <TopNav />

      {/* Main Content Area Based on Current View */}
      <main>
        {selectedProductForDetail ? (
          <>
            <ProductDetailPage
              product={selectedProductForDetail}
              onBack={() => setSelectedProductForDetail(null)}
              onBuyNow={() => {
                setSelectedProductForDetail(null);
                if (!isAuthenticated) {
                  setCurrentView('retailer-auth');
                } else {
                  setIsCheckoutOpen(true);
                }
              }}
            />

            <CartDrawer
              isOpen={isCartOpen}
              onClose={() => setIsCartOpen(false)}
              onOpenCheckout={() => setIsCheckoutOpen(true)}
            />

            <CheckoutModal
              isOpen={isCheckoutOpen}
              onClose={() => setIsCheckoutOpen(false)}
              onOrderSuccess={(order) => {
                setIsCheckoutOpen(false);
                setConfirmedOrder(order);
                setIsConfirmationOpen(true);
              }}
            />

            <OrderConfirmationModal
              order={confirmedOrder}
              isOpen={isConfirmationOpen}
              onClose={() => setIsConfirmationOpen(false)}
              onViewMyOrders={() => {
                setIsConfirmationOpen(false);
                setCurrentView('retailer');
                if (confirmedOrder) {
                  setTrackingOrder(confirmedOrder);
                }
              }}
            />

            <OrderTrackingModal
              order={trackingOrder}
              onClose={() => setTrackingOrder(null)}
            />

            <InvoicesView
              invoice={activeInvoice}
              onClose={() => setActiveInvoice(null)}
            />
          </>
        ) : (
          currentView === 'landing' && (
            <>
              <Hero />
              <TrustStrip />
              <FeaturedCollection />
              <AccessPortals />
              <Footer />

              {/* Modals triggered from landing page */}
              <CartDrawer
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                onOpenCheckout={() => setIsCheckoutOpen(true)}
              />

              <CheckoutModal
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                onOrderSuccess={(order) => {
                  setIsCheckoutOpen(false);
                  setConfirmedOrder(order);
                  setIsConfirmationOpen(true);
                }}
              />

              <OrderConfirmationModal
                order={confirmedOrder}
                isOpen={isConfirmationOpen}
                onClose={() => setIsConfirmationOpen(false)}
                onViewMyOrders={() => {
                  setIsConfirmationOpen(false);
                  setCurrentView('retailer');
                  if (confirmedOrder) {
                    setTrackingOrder(confirmedOrder);
                  }
                }}
              />

              <OrderTrackingModal
                order={trackingOrder}
                onClose={() => setTrackingOrder(null)}
              />

              <InvoicesView
                invoice={activeInvoice}
                onClose={() => setActiveInvoice(null)}
              />
            </>
          )
        )}

        {currentView === 'retailer-auth' && (
          <>
            <RetailerAuth />
          </>
        )}

        {currentView === 'factory-auth' && (
          <>
            <FactoryAuth />
          </>
        )}

        {currentView === 'admin-auth' && (
          <>
            <AdminAuth />
          </>
        )}

        {currentView === 'retailer' && (
          <>
            <RetailerPortal />
            <Footer />
          </>
        )}

        {currentView === 'factory' && (
          <>
            <FactoryAdminPortal />
            <Footer />
          </>
        )}

        {currentView === 'admin' && (
          <>
            <AdminPortal />
            <Footer />
          </>
        )}
      </main>

      {/* Global Notification Toast */}
      <Toast />
    </div>
  );
};
export default App;
