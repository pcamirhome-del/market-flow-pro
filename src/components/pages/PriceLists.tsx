import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Plus, Search, Edit2, Trash2, Save, X, Printer, FileSpreadsheet, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toast } from 'sonner';
import { Product } from '@/types';

const PriceLists: React.FC = () => {
  const { companies, products, settings, addCompany, addProduct, updateProduct, deleteProduct, deleteCompany } = useData();
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCompany, setExpandedCompany] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  
  // New company form
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newProducts, setNewProducts] = useState<{name: string; priceBeforeTax: number; priceAfterTax: number; companyId: string; companyName: string;}[]>([]);

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.includes(searchQuery)
  );

  const handleAddCompany = () => {
    if (!newCompanyName.trim()) {
      toast.error('يرجى إدخال اسم الشركة');
      return;
    }

    addCompany({ name: newCompanyName, products: [] });
    
    // Add products to the new company
    const companyId = companies[companies.length]?.id;
    if (companyId) {
      newProducts.forEach(product => {
        addProduct({
          name: product.name,
          priceBeforeTax: product.priceBeforeTax,
          priceAfterTax: product.priceAfterTax,
          sellingPrice: product.priceAfterTax * 1.14,
          companyId,
          companyName: product.companyName,
          stock: 0,
          lowStockThreshold: 10,
        });
      });
    }

    toast.success('تم إضافة الشركة بنجاح');
    setShowAddCompany(false);
    setNewCompanyName('');
    setNewProducts([]);
  };

  const handleAddProductToNew = () => {
    if (newProducts.length >= 500) {
      toast.error('الحد الأقصى 500 صنف');
      return;
    }
    setNewProducts([...newProducts, {
      name: '',
      priceBeforeTax: 0,
      priceAfterTax: 0,
      companyId: '',
      companyName: newCompanyName,
    }]);
  };

  const handleDeleteCompany = (companyId: string) => {
    const confirmed = window.confirm('هل تريد حذف هذه الشركة وجميع منتجاتها؟');
    if (!confirmed) return;
    deleteCompany(companyId);
    toast.success('تم حذف الشركة');
  };

  const companyProducts = (companyId: string) => products.filter(p => p.companyId === companyId);

  return (
    <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold gradient-text">{settings.sidebarLabels.priceLists}</h2>
        <button
          onClick={() => setShowAddCompany(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          إضافة شركة
        </button>
      </div>

      {/* Search */}
      <div className="glass-card">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالشركة أو الكود..."
            className="glass-input pr-10"
          />
        </div>
      </div>

      {/* Add company modal */}
      {showAddCompany && (
        <div className="modal-overlay" onClick={() => setShowAddCompany(false)}>
          <div className="modal-content max-w-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">إضافة شركة جديدة</h3>
              <button onClick={() => setShowAddCompany(false)} className="p-2 hover:bg-white/10 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto scrollbar-thin">
              <div>
                <label className="text-sm text-muted-foreground">كود الشركة</label>
                <input
                  type="text"
                  value={`${10 + companies.length}`}
                  disabled
                  className="glass-input bg-white/5"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">اسم الشركة</label>
                <input
                  type="text"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  placeholder="أدخل اسم الشركة"
                  className="glass-input"
                />
              </div>

              <div className="border-t border-border/50 pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">الأصناف</h4>
                  <button
                    onClick={handleAddProductToNew}
                    className="btn-glass text-sm flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    إضافة صنف
                  </button>
                </div>

                {newProducts.map((product, index) => (
                  <div key={index} className="grid grid-cols-3 gap-2 mb-2">
                    <input
                      type="text"
                      value={product.name}
                      onChange={(e) => {
                        const updated = [...newProducts];
                        updated[index].name = e.target.value;
                        setNewProducts(updated);
                      }}
                      placeholder="اسم الصنف"
                      className="glass-input text-sm"
                    />
                    <input
                      type="number"
                      value={product.priceBeforeTax || ''}
                      onChange={(e) => {
                        const updated = [...newProducts];
                        const price = parseFloat(e.target.value) || 0;
                        updated[index].priceBeforeTax = price;
                        updated[index].priceAfterTax = price * 1.14;
                        setNewProducts(updated);
                      }}
                      placeholder="السعر قبل الضريبة"
                      className="glass-input text-sm"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={product.priceAfterTax?.toFixed(2) || ''}
                        disabled
                        placeholder="بعد الضريبة"
                        className="glass-input text-sm bg-white/5 flex-1"
                      />
                      <button
                        onClick={() => setNewProducts(newProducts.filter((_, i) => i !== index))}
                        className="p-2 text-destructive hover:bg-destructive/20 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 mt-6 pt-4 border-t border-border/50">
              <button onClick={() => setShowAddCompany(false)} className="btn-glass flex-1">
                إلغاء
              </button>
              <button onClick={handleAddCompany} className="btn-primary flex-1 flex items-center justify-center gap-2">
                <Save className="w-4 h-4" />
                إضافة القائمة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Companies list */}
      <div className="space-y-4">
        {filteredCompanies.length === 0 ? (
          <div className="glass-card text-center py-12 text-muted-foreground">
            لا توجد شركات مسجلة
          </div>
        ) : (
          filteredCompanies.map(company => (
            <div key={company.id} className="glass-card">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedCompany(expandedCompany === company.id ? null : company.id)}
              >
                <div>
                  <h3 className="font-semibold">{company.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    كود: {company.code} | الأصناف: {companyProducts(company.id).length}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    تاريخ الإضافة: {format(new Date(company.createdAt), 'dd MMMM yyyy', { locale: ar })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCompany(company.id);
                    }}
                    className="p-2 text-destructive hover:bg-destructive/20 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {expandedCompany === company.id ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </div>
              </div>

              {expandedCompany === company.id && (
                <div className="mt-4 pt-4 border-t border-border/50">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-primary/10">
                        <tr>
                          <th className="p-2 text-right">الكود</th>
                          <th className="p-2 text-right">اسم الصنف</th>
                          <th className="p-2 text-right">السعر قبل الضريبة</th>
                          <th className="p-2 text-right">السعر بعد الضريبة</th>
                          <th className="p-2 text-right">إجراءات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {companyProducts(company.id).map(product => (
                          <tr key={product.id} className="border-t border-border/30">
                            <td className="p-2 font-mono">{product.code}</td>
                            <td className="p-2">{product.name}</td>
                            <td className="p-2">{product.priceBeforeTax.toFixed(2)}</td>
                            <td className="p-2 text-primary">{product.priceAfterTax.toFixed(2)}</td>
                            <td className="p-2">
                              <div className="flex gap-1">
                                <button className="p-1 hover:bg-white/10 rounded">
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => {
                                    deleteProduct(product.id);
                                    toast.success('تم حذف الصنف');
                                  }}
                                  className="p-1 hover:bg-destructive/20 text-destructive rounded"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex gap-2 mt-4">
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

export default PriceLists;
