import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { ChevronDown, Save, Search, Tag } from 'lucide-react';
import { toast } from 'sonner';

const OfferPrices: React.FC = () => {
  const { companies, products, settings, updateProduct } = useData();
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [searchCompany, setSearchCompany] = useState('');
  const [productCodeSearch, setProductCodeSearch] = useState('');
  const [offerPrices, setOfferPrices] = useState<Record<string, string>>({});

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

  const handleSave = () => {
    let updated = 0;
    Object.entries(offerPrices).forEach(([productId, price]) => {
      const numPrice = parseFloat(price);
      if (!isNaN(numPrice) && numPrice > 0) {
        updateProduct(productId, { offerPrice: numPrice });
        updated++;
      }
    });
    
    if (updated > 0) {
      toast.success(`تم تحديث ${updated} أسعار عروض`);
      setOfferPrices({});
    } else {
      toast.error('لم يتم تحديث أي أسعار');
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold gradient-text">{settings.sidebarLabels.offerPrices}</h2>

      {/* Search controls */}
      <div className="glass-card space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Company search */}
          <div className="flex-1 relative">
            <label className="text-sm text-muted-foreground block mb-1">اختر الشركة</label>
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

          {/* Barcode search */}
          <div className="flex-1">
            <label className="text-sm text-muted-foreground block mb-1">باركود الصنف</label>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={productCodeSearch}
                onChange={(e) => setProductCodeSearch(e.target.value)}
                placeholder="أدخل باركود الصنف"
                className="glass-input pr-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Products table */}
      {(selectedCompanyId || searchedProduct) && (
        <div className="glass-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Tag className="w-5 h-5 text-primary" />
              أسعار العروض
            </h3>
            <button onClick={handleSave} className="btn-primary flex items-center gap-2">
              <Save className="w-4 h-4" />
              حفظ الأسعار
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full table-glass">
              <thead>
                <tr>
                  <th>الكود</th>
                  <th>اسم الصنف</th>
                  <th>سعر الشراء</th>
                  <th>سعر البيع ({settings.profitMargin}%)</th>
                  <th>سعر العرض</th>
                </tr>
              </thead>
              <tbody>
                {displayProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-muted-foreground">
                      لا توجد منتجات
                    </td>
                  </tr>
                ) : (
                  displayProducts.map(product => (
                    <tr key={product.id}>
                      <td className="font-mono">{product.code}</td>
                      <td>{product.name}</td>
                      <td>{product.priceAfterTax.toFixed(2)} ج.م</td>
                      <td className="text-primary">{product.sellingPrice.toFixed(2)} ج.م</td>
                      <td>
                        <input
                          type="number"
                          value={offerPrices[product.id] ?? product.offerPrice ?? ''}
                          onChange={(e) => setOfferPrices({
                            ...offerPrices,
                            [product.id]: e.target.value
                          })}
                          placeholder="سعر العرض"
                          className="glass-input text-center py-1 w-28"
                          step="0.01"
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfferPrices;
