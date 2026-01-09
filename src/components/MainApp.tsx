import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import Header from './Header';
import Sidebar from './Sidebar';
import DailySales from './pages/DailySales';
import CreateInvoice from './pages/CreateInvoice';
import PendingOrders from './pages/PendingOrders';
import PriceLists from './pages/PriceLists';
import Inventory from './pages/Inventory';
import SalesRecord from './pages/SalesRecord';
import OfferPrices from './pages/OfferPrices';
import ShelfPrices from './pages/ShelfPrices';
import Settings from './pages/Settings';

const MainApp: React.FC = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dailySales');
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    if (showWelcome && user) {
      const timer = setTimeout(() => {
        setShowWelcome(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showWelcome, user]);

  const renderPage = () => {
    switch (activeTab) {
      case 'dailySales':
        return <DailySales />;
      case 'createInvoice':
        return <CreateInvoice />;
      case 'pendingOrders':
        return <PendingOrders />;
      case 'priceLists':
        return <PriceLists />;
      case 'inventory':
        return <Inventory />;
      case 'salesRecord':
        return <SalesRecord />;
      case 'offerPrices':
        return <OfferPrices />;
      case 'shelfPrices':
        return <ShelfPrices />;
      case 'settings':
        return <Settings />;
      default:
        return <DailySales />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Welcome modal */}
      {showWelcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass-card text-center animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full gradient-bg flex items-center justify-center">
              <span className="text-3xl">👋</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">مرحباً</h2>
            <p className="text-xl gradient-text">{user?.name}</p>
          </div>
        </div>
      )}

      <Header onMenuClick={() => setSidebarOpen(true)} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default MainApp;
