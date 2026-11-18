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

// Auth Views
import { RetailerAuth } from './components/shared/RetailerAuth';
import { FactoryAuth } from './components/shared/FactoryAuth';

// Modals on Landing Page
import { ProductDetailModal } from './components/retailer/ProductDetailModal';
import { CartDrawer } from './components/retailer/CartDrawer';
import { CheckoutModal } from './components/retailer/CheckoutModal';
import { OrderTrackingModal } from './components/retailer/OrderTrackingModal';
import { InvoicesView } from './components/retailer/InvoicesView';

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
    setActiveInvoice 
  } = useApp();

  const [isCheckoutOpen, setIsCheckoutOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-[#101114] text-[#F5F5F5] font-sans antialiased selection:bg-[#FF7135]/30 selection:text-white">
      {/* Universal Floating Navigation Bar */}
      <TopNav />

      {/* Main Content Area Based on Current View */}
      <main>
        {currentView === 'landing' && (
          <>
            <Hero />
            <TrustStrip />
            <FeaturedCollection />
            <AppPreviewSection />
            <FactoryShowcase />
            <BentoBenefits />
            <AccessPortals />
            <AboutContact />
            <Footer />

            {/* Modals triggered from landing page */}
            <ProductDetailModal
              product={selectedProductForDetail}
              onClose={() => setSelectedProductForDetail(null)}
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
                setCurrentView('retailer');
                setTrackingOrder(order);
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
      </main>

      {/* Global Notification Toast */}
      <Toast />
    </div>
  );
};
export default App;
