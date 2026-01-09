import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Search, Check, X, DollarSign, Printer, FileSpreadsheet, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toast } from 'sonner';
import { Invoice } from '@/types';

const PendingOrders: React.FC = () => {
  const { invoices, settings, updateInvoice, addPayment, updateStock, products } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedInvoice, setExpandedInvoice] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  const filteredInvoices = invoices.filter(inv => 
    inv.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.companyCode.includes(searchQuery) ||
    inv.invoiceNumber.toString().includes(searchQuery) ||
    inv.items.some(item => item.productName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleDelivery = (invoice: Invoice) => {
    const confirmed = window.confirm('هل تريد تأكيد استلام هذه الطلبية؟');
    if (!confirmed) return;

    // Update stock for each item
    invoice.items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        updateStock(product.id, product.stock + item.quantity);
      }
    });

    updateInvoice(invoice.id, { 
      status: invoice.paidAmount > 0 ? 'partial' : 'delivered',
      deliveredAt: new Date().toISOString()
    });
    toast.success('تم تأكيد استلام الطلبية');
  };

  const handleAddPayment = (invoiceId: string) => {
    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0) {
      toast.error('يرجى إدخال مبلغ صحيح');
      return;
    }

    addPayment(invoiceId, amount);
    setPaymentAmount('');
    toast.success('تم إضافة الدفعة بنجاح');
  };

  const getStatusBadge = (invoice: Invoice) => {
    if (invoice.status === 'paid') {
      return <span className="status-paid">تم الدفع بالكامل</span>;
    }
    if (invoice.status === 'partial') {
      return <span className="status-pending">فاتورة مجزئة</span>;
    }
    if (invoice.status === 'delivered') {
      return <span className="text-success text-sm">تم التسليم</span>;
    }
    return <span className="status-unpaid">قيد الانتظار</span>;
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold gradient-text">{settings.sidebarLabels.pendingOrders}</h2>

      {/* Search */}
      <div className="glass-card">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالشركة أو رقم الفاتورة أو الصنف..."
            className="glass-input pr-10"
          />
        </div>
      </div>

      {/* Invoices list */}
      <div className="space-y-4">
        {filteredInvoices.length === 0 ? (
          <div className="glass-card text-center py-12 text-muted-foreground">
            لا توجد فواتير
          </div>
        ) : (
          filteredInvoices.map(invoice => (
            <div key={invoice.id} className="glass-card">
              {/* Invoice header */}
              <div 
                className="flex flex-wrap items-center justify-between gap-4 cursor-pointer"
                onClick={() => setExpandedInvoice(expandedInvoice === invoice.id ? null : invoice.id)}
              >
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="font-semibold">{invoice.companyName}</h3>
                    <p className="text-sm text-muted-foreground">
                      كود: {invoice.companyCode} | فاتورة رقم: {invoice.invoiceNumber}
                    </p>
                  </div>
                  {getStatusBadge(invoice)}
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-left">
                    <p className="text-lg font-bold text-primary">{invoice.totalAmount.toFixed(2)} ج.م</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(invoice.createdAt), 'dd/MM/yyyy', { locale: ar })}
                    </p>
                  </div>
                  {expandedInvoice === invoice.id ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </div>
              </div>

              {/* Expanded content */}
              {expandedInvoice === invoice.id && (
                <div className="mt-4 pt-4 border-t border-border/50 space-y-4">
                  {/* Items table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-primary/10">
                        <tr>
                          <th className="p-2 text-right">الكود</th>
                          <th className="p-2 text-right">الصنف</th>
                          <th className="p-2 text-right">الكمية</th>
                          <th className="p-2 text-right">السعر</th>
                          <th className="p-2 text-right">المبلغ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoice.items.map((item, idx) => (
                          <tr key={idx} className="border-t border-border/30">
                            <td className="p-2 font-mono">{item.productCode}</td>
                            <td className="p-2">{item.productName}</td>
                            <td className="p-2">{item.quantity}</td>
                            <td className="p-2">{item.price.toFixed(2)}</td>
                            <td className="p-2 text-primary">{item.total.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Payment info */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-3 bg-white/5 rounded-lg">
                      <p className="text-sm text-muted-foreground">إجمالي الفاتورة</p>
                      <p className="text-lg font-bold">{invoice.totalAmount.toFixed(2)} ج.م</p>
                    </div>
                    <div className="p-3 bg-success/10 rounded-lg">
                      <p className="text-sm text-muted-foreground">المدفوع</p>
                      <p className="text-lg font-bold text-success">{invoice.paidAmount.toFixed(2)} ج.م</p>
                    </div>
                    <div className="p-3 bg-destructive/10 rounded-lg">
                      <p className="text-sm text-muted-foreground">المتبقي</p>
                      <p className="text-lg font-bold text-destructive">{invoice.remainingAmount.toFixed(2)} ج.م</p>
                    </div>
                  </div>

                  {/* Payments history */}
                  {invoice.payments.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">الدفعات</h4>
                      {invoice.payments.map((payment, idx) => (
                        <div key={payment.id} className="flex justify-between items-center p-2 bg-white/5 rounded">
                          <span>دفعة {idx + 1}</span>
                          <span>{payment.amount.toFixed(2)} ج.م</span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(payment.date), 'dd/MM/yyyy hh:mm a', { locale: ar })}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add payment */}
                  {invoice.remainingAmount > 0 && invoice.payments.length < 3 && (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="number"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        placeholder="أدخل مبلغ الدفعة"
                        className="glass-input flex-1"
                      />
                      <button
                        onClick={() => handleAddPayment(invoice.id)}
                        className="btn-primary flex items-center justify-center gap-2"
                      >
                        <DollarSign className="w-4 h-4" />
                        إضافة دفعة
                      </button>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-border/50">
                    {invoice.status === 'pending' && (
                      <button
                        onClick={() => handleDelivery(invoice)}
                        className="btn-glass flex items-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        تم التسليم
                      </button>
                    )}
                    <button className="btn-glass flex items-center gap-2">
                      <Printer className="w-4 h-4" />
                      طباعة
                    </button>
                    <button className="btn-glass flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4" />
                      تصدير Excel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PendingOrders;
