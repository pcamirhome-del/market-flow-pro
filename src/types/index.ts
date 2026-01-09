export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'manager' | 'employee';
  name: string;
  phone?: string;
  address?: string;
  startDate: string;
  permissions: string[];
}

export interface Company {
  id: string;
  code: string;
  name: string;
  products: Product[];
  createdAt: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  priceBeforeTax: number;
  priceAfterTax: number;
  sellingPrice: number;
  offerPrice?: number;
  stock: number;
  lowStockThreshold: number;
  companyId: string;
  companyName: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: number;
  companyId: string;
  companyCode: string;
  companyName: string;
  items: InvoiceItem[];
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  payments: Payment[];
  status: 'pending' | 'delivered' | 'partial' | 'paid';
  createdAt: string;
  createdBy: string;
  deliveredAt?: string;
}

export interface InvoiceItem {
  productId: string;
  productCode: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
  stock: number;
}

export interface Payment {
  id: string;
  amount: number;
  date: string;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  totalAmount: number;
  receivedAmount: number;
  changeAmount: number;
  createdAt: string;
  createdBy: string;
}

export interface SaleItem {
  productId: string;
  productCode: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Notification {
  id: string;
  type: 'low_stock' | 'order' | 'payment';
  title: string;
  message: string;
  companyId?: string;
  companyName?: string;
  products?: Product[];
  read: boolean;
  createdAt: string;
}

export interface Settings {
  appName: string;
  profitMargin: number;
  lowStockThreshold: number;
  sidebarLabels: Record<string, string>;
}

export interface PriceList {
  id: string;
  companyId: string;
  companyName: string;
  products: Product[];
  createdAt: string;
  updatedAt: string;
}
