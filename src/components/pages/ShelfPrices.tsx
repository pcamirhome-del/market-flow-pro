import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { ChevronDown, Printer, FileSpreadsheet, Check, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toast } from 'sonner';

const ShelfPrices: React.FC = () => {
  const { companies, products, settings } = useData();
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [searchCompany, setSearchCompany] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const selectedCompany = companies.find(c => c.id === selectedCompanyId);
  
  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(searchCompany.toLowerCase()) ||
    c.code.includes(searchCompany)
  );

  const companyProducts = products.filter(p => p.companyId === selectedCompanyId);

  const toggleProduct = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const selectAll = () => {
    if (selectedProducts.length === companyProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(companyProducts.map(p => p.id));
    }
  };

  const handlePrint = () => {
    if (selectedProducts.length === 0) {
      toast.error('يرجى اختيار منتج واحد على الأقل');
      return;
    }
    window.print();
  };

  const handleExport = () => {
    if (selectedProducts.length === 0) {
      toast.error('يرجى اختيار منتج واحد على الأقل');
      return;
    }
    toast.success('جاري التصدير...');
  };

  const selectedProductsData = products.filter(p => selectedProducts.includes(p.id));

  return (
    <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold gradient-text">{settings.sidebarLabels.shelfPrices}</h2>

      {/* Company selector */}
      <div className="glass-card">
        <label className="text-sm text-muted-foreground block mb-2">اختر الشركة</label>
        <div className="relative">
          <button
            onClick={() => setShowCompanyDropdown(!showCompanyDropdown)}
            className="glass-input w-full max-w-md flex items-center justify-between"
          >
            <span className={selectedCompany ? '' : 'text-muted-foreground'}>
              {selectedCompany ? selectedCompany.name : 'اختر الشركة'}
            </span>
            <ChevronDown className="w-5 h-5" />
          </button>

          {showCompanyDropdown && (
            <div className="absolute top-full mt-2 w-full max-w-md glass-card z-10 max-h-60 overflow-y-auto">
              <input
                type="text"
                value={searchCompany}
                onChange={(e) => setSearchCompany(e.target.value)}
                placeholder="بحث..."
                className="glass-input mb-2"
                autoFocus
              />
              
              {filteredCompanies.map(company => (
                <button
                  key={company.id}
                  onClick={() => {
                    setSelectedCompanyId(company.id);
                    setShowCompanyDropdown(false);
                    setSearchCompany('');
                    setSelectedProducts([]);
                  }}
                  className="w-full p-3 text-right hover:bg-white/10 rounded-lg transition-colors"
                >
                  <div className="font-medium">{company.name}</div>
                  <div className="text-sm text-muted-foreground">كود: {company.code}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Products table */}
      {selectedCompanyId && (
        <div className="glass-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Tag className="w-5 h-5 text-primary" />
                أسعار الشيلف
              </h3>
              <button onClick={selectAll} className="text-sm text-primary hover:underline">
                {selectedProducts.length === companyProducts.length ? 'إلغاء الكل' : 'تحديد الكل'}
              </button>
            </div>
            <span className="text-sm text-muted-foreground">
              المحدد: {selectedProducts.length} من {companyProducts.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full table-glass">
              <thead>
                <tr>
                  <th className="w-12"></th>
                  <th>الباركود</th>
                  <th>اسم الصنف</th>
                  <th>السعر</th>
                </tr>
              </thead>
              <tbody>
                {companyProducts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-muted-foreground">
                      لا توجد منتجات
                    </td>
                  </tr>
                ) : (
                  companyProducts.map(product => {
                    const isSelected = selectedProducts.includes(product.id);
                    const displayPrice = product.offerPrice || product.sellingPrice;
                    
                    return (
                      <tr 
                        key={product.id} 
                        className={`cursor-pointer ${isSelected ? 'bg-primary/10' : ''}`}
                        onClick={() => toggleProduct(product.id)}
                      >
                        <td className="text-center">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mx-auto
                            ${isSelected ? 'bg-primary border-primary' : 'border-muted-foreground'}`}
                          >
                            {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                          </div>
                        </td>
                        <td className="font-mono">{product.code}</td>
                        <td>{product.name}</td>
                        <td className="text-primary font-semibold">{displayPrice.toFixed(2)} ج.م</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Actions */}
          {selectedProducts.length > 0 && (
            <div className="flex gap-2 mt-4 pt-4 border-t border-border/50">
              <button onClick={handlePrint} className="btn-primary flex items-center gap-2">
                <Printer className="w-4 h-4" />
                طباعة الأسعار
              </button>
              <button onClick={handleExport} className="btn-glass flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4" />
                تصدير Excel
              </button>
            </div>
          )}
        </div>
      )}

      {/* Preview for print */}
      {selectedProducts.length > 0 && (
        <div className="glass-card print:block hidden">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">{settings.appName}</h1>
            <p className="text-sm text-muted-foreground mt-2">
              تاريخ الطباعة: {format(new Date(), 'dd MMMM yyyy', { locale: ar })}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {selectedProductsData.map(product => {
              const displayPrice = product.offerPrice || product.sellingPrice;
              
              return (
                <div key={product.id} className="border border-border rounded-lg p-4 text-center">
                  <p className="font-medium mb-2">{product.name}</p>
                  <p className="text-2xl font-bold text-primary">{displayPrice.toFixed(2)} ج.م</p>
                  <p className="text-xs font-mono mt-2">{product.code}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShelfPrices;
