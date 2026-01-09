import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Company, Product, Invoice, Sale, Notification, Settings, PriceList } from '@/types';

interface DataContextType {
  companies: Company[];
  products: Product[];
  invoices: Invoice[];
  sales: Sale[];
  notifications: Notification[];
  settings: Settings;
  priceLists: PriceList[];
  
  // Company actions
  addCompany: (company: Omit<Company, 'id' | 'code' | 'createdAt'>) => void;
  updateCompany: (id: string, company: Partial<Company>) => void;
  deleteCompany: (id: string) => void;
  
  // Product actions
  addProduct: (product: Omit<Product, 'id' | 'code'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProductByCode: (code: string) => Product | undefined;
  
  // Invoice actions
  addInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt'>) => Invoice;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => void;
  addPayment: (invoiceId: string, amount: number) => void;
  
  // Sales actions
  addSale: (sale: Omit<Sale, 'id' | 'createdAt'>) => void;
  getSalesByDateRange: (startDate: string, endDate: string) => Sale[];
  
  // Notification actions
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markNotificationRead: (id: string) => void;
  checkLowStock: () => void;
  
  // Settings actions
  updateSettings: (settings: Partial<Settings>) => void;
  
  // Price list actions
  addPriceList: (priceList: Omit<PriceList, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePriceList: (id: string, priceList: Partial<PriceList>) => void;
  deletePriceList: (id: string) => void;
  
  // Stock management
  getStock: (productId: string) => number;
  updateStock: (productId: string, quantity: number) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const defaultSettings: Settings = {
  appName: 'Market Pro',
  profitMargin: 14,
  lowStockThreshold: 10,
  sidebarLabels: {
    dailySales: 'المبيعات اليومية',
    createInvoice: 'إنشاء فاتورة',
    pendingOrders: 'الأوردارات المرحلة',
    priceLists: 'قوائم أسعار الشركات',
    inventory: 'المخزون',
    salesRecord: 'سجل المبيعات',
    offerPrices: 'أسعار العروض',
    shelfPrices: 'سعر شيلف',
    settings: 'الإعدادات',
  },
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [priceLists, setPriceLists] = useState<PriceList[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const loadData = (key: string, setter: (data: any) => void, defaultValue: any) => {
      const data = localStorage.getItem(`marketpro_${key}`);
      if (data) {
        setter(JSON.parse(data));
      } else {
        setter(defaultValue);
      }
    };

    loadData('companies', setCompanies, []);
    loadData('products', setProducts, []);
    loadData('invoices', setInvoices, []);
    loadData('sales', setSales, []);
    loadData('notifications', setNotifications, []);
    loadData('settings', setSettings, defaultSettings);
    loadData('priceLists', setPriceLists, []);
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('marketpro_companies', JSON.stringify(companies));
  }, [companies]);

  useEffect(() => {
    localStorage.setItem('marketpro_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('marketpro_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('marketpro_sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('marketpro_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('marketpro_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('marketpro_priceLists', JSON.stringify(priceLists));
  }, [priceLists]);

  // Company actions
  const addCompany = (company: Omit<Company, 'id' | 'code' | 'createdAt'>) => {
    const newCode = (10 + companies.length).toString();
    const newCompany: Company = {
      ...company,
      id: Date.now().toString(),
      code: newCode,
      createdAt: new Date().toISOString(),
    };
    setCompanies([...companies, newCompany]);
  };

  const updateCompany = (id: string, company: Partial<Company>) => {
    setCompanies(companies.map(c => c.id === id ? { ...c, ...company } : c));
  };

  const deleteCompany = (id: string) => {
    setCompanies(companies.filter(c => c.id !== id));
    setProducts(products.filter(p => p.companyId !== id));
  };

  // Product actions
  const addProduct = (product: Omit<Product, 'id' | 'code'>) => {
    const companyProducts = products.filter(p => p.companyId === product.companyId);
    const newCode = `${product.companyId}-${(companyProducts.length + 1).toString().padStart(4, '0')}`;
    const sellingPrice = product.priceAfterTax * (1 + settings.profitMargin / 100);
    
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      code: newCode,
      sellingPrice: Math.round(sellingPrice * 100) / 100,
    };
    setProducts([...products, newProduct]);
  };

  const updateProduct = (id: string, product: Partial<Product>) => {
    setProducts(products.map(p => {
      if (p.id === id) {
        const updated = { ...p, ...product };
        if (product.priceAfterTax !== undefined) {
          updated.sellingPrice = Math.round(product.priceAfterTax * (1 + settings.profitMargin / 100) * 100) / 100;
        }
        return updated;
      }
      return p;
    }));
  };

  const deleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const getProductByCode = (code: string) => {
    return products.find(p => p.code === code);
  };

  // Invoice actions
  const addInvoice = (invoice: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt'>) => {
    const lastInvoiceNumber = invoices.length > 0 
      ? Math.max(...invoices.map(i => i.invoiceNumber))
      : 999;
    
    const newInvoice: Invoice = {
      ...invoice,
      id: Date.now().toString(),
      invoiceNumber: lastInvoiceNumber + 1,
      createdAt: new Date().toISOString(),
    };
    setInvoices([...invoices, newInvoice]);
    return newInvoice;
  };

  const updateInvoice = (id: string, invoice: Partial<Invoice>) => {
    setInvoices(invoices.map(i => i.id === id ? { ...i, ...invoice } : i));
  };

  const addPayment = (invoiceId: string, amount: number) => {
    setInvoices(invoices.map(i => {
      if (i.id === invoiceId) {
        const newPayment = { id: Date.now().toString(), amount, date: new Date().toISOString() };
        const payments = [...i.payments, newPayment];
        const paidAmount = payments.reduce((sum, p) => sum + p.amount, 0);
        const remainingAmount = i.totalAmount - paidAmount;
        const status = remainingAmount <= 0 ? 'paid' : 'partial';
        
        return { ...i, payments, paidAmount, remainingAmount, status };
      }
      return i;
    }));
  };

  // Sales actions
  const addSale = (sale: Omit<Sale, 'id' | 'createdAt'>) => {
    const newSale: Sale = {
      ...sale,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setSales([...sales, newSale]);
    
    // Update stock
    sale.items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        updateStock(product.id, product.stock - item.quantity);
      }
    });
  };

  const getSalesByDateRange = (startDate: string, endDate: string) => {
    return sales.filter(s => {
      const saleDate = new Date(s.createdAt);
      return saleDate >= new Date(startDate) && saleDate <= new Date(endDate);
    });
  };

  // Notification actions
  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setNotifications([newNotification, ...notifications]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const checkLowStock = () => {
    const lowStockProducts = products.filter(p => p.stock <= (p.lowStockThreshold || settings.lowStockThreshold));
    
    lowStockProducts.forEach(product => {
      const existingNotification = notifications.find(
        n => n.type === 'low_stock' && n.products?.some(p => p.id === product.id) && !n.read
      );
      
      if (!existingNotification) {
        addNotification({
          type: 'low_stock',
          title: 'تنبيه نقص مخزون',
          message: `المنتج ${product.name} من شركة ${product.companyName} وصل للحد الأدنى`,
          companyId: product.companyId,
          companyName: product.companyName,
          products: [product],
          read: false,
        });
      }
    });
  };

  // Settings actions
  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings({ ...settings, ...newSettings });
  };

  // Price list actions
  const addPriceList = (priceList: Omit<PriceList, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newPriceList: PriceList = {
      ...priceList,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setPriceLists([...priceLists, newPriceList]);
  };

  const updatePriceList = (id: string, priceList: Partial<PriceList>) => {
    setPriceLists(priceLists.map(pl => 
      pl.id === id ? { ...pl, ...priceList, updatedAt: new Date().toISOString() } : pl
    ));
  };

  const deletePriceList = (id: string) => {
    setPriceLists(priceLists.filter(pl => pl.id !== id));
  };

  // Stock management
  const getStock = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product?.stock || 0;
  };

  const updateStock = (productId: string, quantity: number) => {
    setProducts(products.map(p => 
      p.id === productId ? { ...p, stock: Math.max(0, quantity) } : p
    ));
    checkLowStock();
  };

  return (
    <DataContext.Provider value={{
      companies,
      products,
      invoices,
      sales,
      notifications,
      settings,
      priceLists,
      addCompany,
      updateCompany,
      deleteCompany,
      addProduct,
      updateProduct,
      deleteProduct,
      getProductByCode,
      addInvoice,
      updateInvoice,
      addPayment,
      addSale,
      getSalesByDateRange,
      addNotification,
      markNotificationRead,
      checkLowStock,
      updateSettings,
      addPriceList,
      updatePriceList,
      deletePriceList,
      getStock,
      updateStock,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
