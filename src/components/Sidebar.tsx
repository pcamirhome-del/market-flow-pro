import React from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  ShoppingCart,
  FileText,
  Package,
  Warehouse,
  BarChart3,
  Tag,
  Percent,
  Settings,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, activeTab, onTabChange }) => {
  const { settings } = useData();
  const { user } = useAuth();

  const menuItems = [
    { id: 'dailySales', label: settings.sidebarLabels.dailySales, icon: ShoppingCart },
    { id: 'createInvoice', label: settings.sidebarLabels.createInvoice, icon: FileText },
    { id: 'pendingOrders', label: settings.sidebarLabels.pendingOrders, icon: Package },
    { id: 'priceLists', label: settings.sidebarLabels.priceLists, icon: Tag },
    { id: 'inventory', label: settings.sidebarLabels.inventory, icon: Warehouse },
    { id: 'salesRecord', label: settings.sidebarLabels.salesRecord, icon: BarChart3 },
    { id: 'offerPrices', label: settings.sidebarLabels.offerPrices, icon: Percent },
    { id: 'shelfPrices', label: settings.sidebarLabels.shelfPrices, icon: Tag },
    { id: 'settings', label: settings.sidebarLabels.settings, icon: Settings },
  ];

  const hasPermission = (itemId: string) => {
    if (user?.permissions.includes('all')) return true;
    if (itemId === 'settings') return false;
    return user?.permissions.includes(itemId) ?? false;
  };

  const handleItemClick = (itemId: string) => {
    onTabChange(itemId);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 right-0 h-full w-72 glass z-50 transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          lg:translate-x-0 lg:static lg:z-30`}
      >
        <div className="p-4 flex items-center justify-between border-b border-border/50">
          <h2 className="text-lg font-bold gradient-text">القائمة الرئيسية</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-80px)] scrollbar-thin">
          {menuItems.map((item) => {
            if (!hasPermission(item.id)) return null;
            
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`sidebar-item w-full ${isActive ? 'active' : ''}`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border/50 text-center text-sm text-muted-foreground">
          مع تحيات المطور <span className="text-primary font-semibold">Amir Lamay</span>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
