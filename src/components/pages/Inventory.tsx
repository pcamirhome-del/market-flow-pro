import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Search, ChevronDown, Printer, FileSpreadsheet, Package } from 'lucide-react';
import { toast } from 'sonner';

const Inventory: React.FC = () => {
  const { companies, products, settings } = useData();
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [searchCompany, setSearchCompany] = useState('');
  const [productCodeSearch, setProductCodeSearch] = useState('');

  const selectedCompany = companies.find(c => c.id === selectedCompanyId);
  
  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(searchCompany.toLowerCase()) ||
    c.code.includes(searchCompany)
  );

  const companyProducts = products.filter(p => p.companyId === selectedCompanyId);
  
  const searchedProduct = productCodeSearch 
    ? products.find(p => p.code === productCodeSearch.trim())
    : null;

  const displayProducts = searchedProduct 
    ? [searchedProduct] 
    : companyProducts;

  const handleExport = () => {
    if (displayProducts.length === 0) {
      toast.error('لا توجد منتجات للتصدير');
      return;
    }
    toast.success('جاري التصدير...');
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold gradient-text">{settings.sidebarLabels.inventory}</h2>

      {/* Search controls */}
      <div className="glass-card space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Company search */}
          <div className="flex-1 relative">
            <label className="text-sm text-muted-foreground block mb-1">بحث بالشركة</label>
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
                  placeholder="بحث..."
                  className="glass-input mb-2"
                  autoFocus
                />
                
                <button
                  onClick={() => {
                    setSelectedCompanyId('');
                    setShowCompanyDropdown(false);
                    setSearchCompany('');
                  }}
                  className="w-full p-3 text-right hover:bg-white/10 rounded-lg transition-colors text-muted-foreground"
                >
                  جميع الشركات
                </button>
                
                {filteredCompanies.map(company => (
                  <button
                    key={company.id}
                    onClick={() => {
                      setSelectedCompanyId(company.id);
                      setShowCompanyDropdown(false);
                      setSearchCompany('');
                      setProductCodeSearch('');
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

          {/* Product code search */}
          <div className="flex-1">
            <label className="text-sm text-muted-foreground block mb-1">بحث بكود الصنف</label>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={productCodeSearch}
                onChange={(e) => setProductCodeSearch(e.target.value)}
                placeholder="أدخل كود الصنف"
                className="glass-input pr-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Inventory table */}
      <div className="glass-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            المخزون الحالي
          </h3>
          <div className="flex gap-2">
            <button onClick={handleExport} className="btn-glass flex items-center gap-2 text-sm">
              <Printer className="w-4 h-4" />
              طباعة
            </button>
            <button onClick={handleExport} className="btn-glass flex items-center gap-2 text-sm">
              <FileSpreadsheet className="w-4 h-4" />
              Excel
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-glass">
            <thead>
              <tr>
                <th>الكود</th>
                <th>اسم الصنف</th>
                <th>الشركة</th>
                <th>المخزون</th>
                <th>الحد الأدنى</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {displayProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-muted-foreground">
                    {selectedCompanyId || productCodeSearch 
                      ? 'لا توجد منتجات'
                      : 'اختر شركة أو أدخل كود الصنف للبحث'}
                  </td>
                </tr>
              ) : (
                displayProducts.map(product => {
                  const isLowStock = product.stock <= product.lowStockThreshold;
                  return (
                    <tr key={product.id}>
                      <td className="font-mono">{product.code}</td>
                      <td>{product.name}</td>
                      <td>{product.companyName}</td>
                      <td className={isLowStock ? 'text-destructive font-bold' : ''}>
                        {product.stock}
                      </td>
                      <td>{product.lowStockThreshold}</td>
                      <td>
                        {isLowStock ? (
                          <span className="status-unpaid">نقص</span>
                        ) : (
                          <span className="status-paid">متوفر</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Signature area for print */}
        {displayProducts.length > 0 && (
          <div className="mt-8 pt-4 border-t border-border/50 text-left">
            <p className="text-muted-foreground">توقيع المدير: ____________________</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;
