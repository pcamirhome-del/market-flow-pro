import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Plus, Trash2, Save, FileText, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { InvoiceItem } from '@/types';

const CreateInvoice: React.FC = () => {
  const { companies, products, settings, addInvoice } = useData();
  const { user } = useAuth();
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [searchCompany, setSearchCompany] = useState('');
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [productCode, setProductCode] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [showInvoice, setShowInvoice] = useState(false);

  const selectedCompany = companies.find(c => c.id === selectedCompanyId);
  const companyProducts = products.filter(p => p.companyId === selectedCompanyId);
  const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(searchCompany.toLowerCase()) ||
    c.code.includes(searchCompany)
  );

  const handleAddProduct = () => {
    if (!productCode.trim()) {
      toast.error('يرجى إدخال كود الصنف');
      return;
    }

    const product = companyProducts.find(p => p.code === productCode.trim());
    if (!product) {
      toast.error('لم يتم العثور على الصنف في قائمة هذه الشركة');
      return;
    }

    const existingItem = items.find(i => i.productId === product.id);
    if (existingItem) {
      setItems(items.map(i => 
        i.productId === product.id 
          ? { ...i, quantity: i.quantity + quantity, total: (i.quantity + quantity) * i.price }
          : i
      ));
    } else {
      const newItem: InvoiceItem = {
        productId: product.id,
        productCode: product.code,
        productName: product.name,
        quantity,
        price: product.priceAfterTax,
        total: product.priceAfterTax * quantity,
        stock: product.stock,
      };
      setItems([...items, newItem]);
    }

    setProductCode('');
    setQuantity(1);
    toast.success(`تمت إضافة ${product.name}`);
  };

  const removeItem = (productId: string) => {
    setItems(items.filter(i => i.productId !== productId));
  };

  const handleSaveInvoice = () => {
    if (!selectedCompanyId) {
      toast.error('يرجى اختيار الشركة');
      return;
    }

    if (items.length === 0) {
      toast.error('يرجى إضافة أصناف للفاتورة');
      return;
    }

    const confirmed = window.confirm('هل تريد حفظ وترحيل هذه الفاتورة؟');
    if (!confirmed) return;

    const invoice = addInvoice({
      companyId: selectedCompanyId,
      companyCode: selectedCompany?.code || '',
      companyName: selectedCompany?.name || '',
      items,
      totalAmount,
      paidAmount: 0,
      remainingAmount: totalAmount,
      payments: [],
      status: 'pending',
      createdBy: user?.name || '',
    });

    toast.success(`تم إنشاء الفاتورة رقم ${invoice.invoiceNumber} بنجاح`);
    setItems([]);
    setSelectedCompanyId('');
    setShowInvoice(false);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold gradient-text">{settings.sidebarLabels.createInvoice}</h2>

      {!showInvoice ? (
        <div className="glass-card max-w-md mx-auto space-y-4">
          <h3 className="text-lg font-semibold">اختر الشركة</h3>
          
          <div className="relative">
            <button
              onClick={() => setShowCompanyDropdown(!showCompanyDropdown)}
              className="glass-input w-full flex items-center justify-between"
            >
              <span className={selectedCompany ? '' : 'text-muted-foreground'}>
                {selectedCompany ? selectedCompany.name : 'اختر الشركة'}
              </span>
              <ChevronDown className="w-5 h-5" />
            </button>

            {showCompanyDropdown && (
              <div className="absolute top-full mt-2 w-full glass-card z-10 max-h-60 overflow-y-auto">
                <input
                  type="text"
                  value={searchCompany}
                  onChange={(e) => setSearchCompany(e.target.value)}
                  placeholder="بحث عن شركة..."
                  className="glass-input mb-2"
                  autoFocus
                />
                
                {filteredCompanies.length === 0 ? (
                  <p className="text-center py-4 text-muted-foreground">لا توجد شركات</p>
                ) : (
                  filteredCompanies.map(company => (
                    <button
                      key={company.id}
                      onClick={() => {
                        setSelectedCompanyId(company.id);
                        setShowCompanyDropdown(false);
                        setSearchCompany('');
                      }}
                      className="w-full p-3 text-right hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <div className="font-medium">{company.name}</div>
                      <div className="text-sm text-muted-foreground">كود: {company.code}</div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {selectedCompany && (
            <button
              onClick={() => setShowInvoice(true)}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <FileText className="w-5 h-5" />
              إنشاء الفاتورة
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Invoice header */}
          <div className="glass-card">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">فاتورة جديدة</h3>
                <p className="text-muted-foreground">شركة: {selectedCompany?.name}</p>
              </div>
              <button
                onClick={() => {
                  setShowInvoice(false);
                  setItems([]);
                }}
                className="btn-glass"
              >
                تغيير الشركة
              </button>
            </div>
          </div>

          {/* Add product */}
          <div className="glass-card">
            <h4 className="font-semibold mb-4">إضافة صنف</h4>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={productCode}
                  onChange={(e) => setProductCode(e.target.value)}
                  placeholder="كود الصنف"
                  className="glass-input"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddProduct()}
                />
              </div>
              <div className="w-32">
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  min="1"
                  placeholder="الكمية"
                  className="glass-input text-center"
                />
              </div>
              <button
                onClick={handleAddProduct}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                إضافة
              </button>
            </div>
          </div>

          {/* Items table */}
          <div className="glass-card">
            <div className="overflow-x-auto">
              <table className="w-full table-glass">
                <thead>
                  <tr>
                    <th>الكود</th>
                    <th>اسم الصنف</th>
                    <th>السعر</th>
                    <th>الكمية</th>
                    <th>المخزون</th>
                    <th>المبلغ</th>
                    <th>إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-muted-foreground">
                        لا توجد أصناف - أضف أصناف للفاتورة
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => (
                      <tr key={item.productId}>
                        <td className="font-mono">{item.productCode}</td>
                        <td>{item.productName}</td>
                        <td>{item.price.toFixed(2)} ج.م</td>
                        <td>{item.quantity}</td>
                        <td>{item.stock}</td>
                        <td className="text-primary font-semibold">{item.total.toFixed(2)} ج.م</td>
                        <td>
                          <button
                            onClick={() => removeItem(item.productId)}
                            className="p-2 rounded hover:bg-destructive/20 text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Total and save */}
          <div className="glass-card">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="text-lg">إجمالي الفاتورة:</span>
                <span className="text-2xl font-bold text-primary">{totalAmount.toFixed(2)} ج.م</span>
              </div>
              <button
                onClick={handleSaveInvoice}
                className="btn-primary flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                حفظ وترحيل
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateInvoice;
