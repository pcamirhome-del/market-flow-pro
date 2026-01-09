import React, { useState, useRef, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Plus, Minus, Trash2, Printer, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { SaleItem } from '@/types';

const DailySales: React.FC = () => {
  const { products, settings, addSale } = useData();
  const { user } = useAuth();
  const [searchCode, setSearchCode] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [items, setItems] = useState<SaleItem[]>([]);
  const [receivedAmount, setReceivedAmount] = useState('');
  const codeInputRef = useRef<HTMLInputElement>(null);

  const totalAmount = items.reduce((sum, item) => sum + item.total, 0);
  const changeAmount = receivedAmount ? parseFloat(receivedAmount) - totalAmount : 0;

  useEffect(() => {
    codeInputRef.current?.focus();
  }, []);

  const handleCodeSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchCode.trim()) {
      const product = products.find(p => p.code === searchCode.trim());
      
      if (!product) {
        toast.error('لم يتم العثور على المنتج');
        return;
      }

      const price = product.offerPrice || product.sellingPrice;
      const existingItem = items.find(i => i.productId === product.id);

      if (existingItem) {
        setItems(items.map(i => 
          i.productId === product.id 
            ? { ...i, quantity: i.quantity + quantity, total: (i.quantity + quantity) * i.price }
            : i
        ));
      } else {
        const newItem: SaleItem = {
          productId: product.id,
          productCode: product.code,
          productName: product.name,
          quantity,
          price,
          total: price * quantity,
        };
        setItems([...items, newItem]);
      }

      setSearchCode('');
      setQuantity(1);
      toast.success(`تمت إضافة ${product.name}`);
    }
  };

  const updateItemQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems(items.map(i => 
      i.productId === productId 
        ? { ...i, quantity: newQuantity, total: newQuantity * i.price }
        : i
    ));
  };

  const removeItem = (productId: string) => {
    setItems(items.filter(i => i.productId !== productId));
  };

  const handleSave = () => {
    if (items.length === 0) {
      toast.error('لا توجد أصناف في الفاتورة');
      return;
    }

    const confirmed = window.confirm('هل تريد حفظ هذه الفاتورة؟');
    if (!confirmed) return;

    addSale({
      items,
      totalAmount,
      receivedAmount: parseFloat(receivedAmount) || totalAmount,
      changeAmount: changeAmount > 0 ? changeAmount : 0,
      createdBy: user?.name || '',
    });

    toast.success('تم حفظ الفاتورة بنجاح');
    setItems([]);
    setReceivedAmount('');
    codeInputRef.current?.focus();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold gradient-text">{settings.sidebarLabels.dailySales}</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product entry */}
        <div className="lg:col-span-2 glass-card space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                ref={codeInputRef}
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                onKeyDown={handleCodeSearch}
                placeholder="أدخل كود الصنف واضغط Enter"
                className="glass-input pr-10"
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
          </div>

          {/* Items table */}
          <div className="overflow-x-auto">
            <table className="w-full table-glass">
              <thead>
                <tr>
                  <th>الكود</th>
                  <th>اسم الصنف</th>
                  <th>السعر</th>
                  <th>الكمية</th>
                  <th>الإجمالي</th>
                  <th>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-muted-foreground">
                      لا توجد أصناف - أدخل كود الصنف للبدء
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.productId}>
                      <td className="font-mono">{item.productCode}</td>
                      <td>{item.productName}</td>
                      <td>{item.price.toFixed(2)} ج.م</td>
                      <td>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => updateItemQuantity(item.productId, item.quantity - 1)}
                            className="p-1 rounded hover:bg-white/10"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateItemQuantity(item.productId, item.quantity + 1)}
                            className="p-1 rounded hover:bg-white/10"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
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

        {/* Payment summary */}
        <div className="glass-card space-y-4">
          <h3 className="text-lg font-semibold border-b border-border/50 pb-2">ملخص الفاتورة</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
              <span>إجمالي الفاتورة</span>
              <span className="text-2xl font-bold text-primary">{totalAmount.toFixed(2)} ج.م</span>
            </div>

            <div>
              <label className="text-sm text-muted-foreground block mb-1">المستلم من العميل</label>
              <input
                type="number"
                value={receivedAmount}
                onChange={(e) => setReceivedAmount(e.target.value)}
                placeholder="0.00"
                className="glass-input text-center text-lg"
              />
            </div>

            {receivedAmount && parseFloat(receivedAmount) >= totalAmount && (
              <div className="flex justify-between items-center p-3 bg-success/10 rounded-lg">
                <span>المتبقي للعميل</span>
                <span className="text-xl font-bold text-success">{changeAmount.toFixed(2)} ج.م</span>
              </div>
            )}

            {receivedAmount && parseFloat(receivedAmount) < totalAmount && (
              <div className="flex justify-between items-center p-3 bg-destructive/10 rounded-lg">
                <span>المتبقي على العميل</span>
                <span className="text-xl font-bold text-destructive">{(totalAmount - parseFloat(receivedAmount)).toFixed(2)} ج.م</span>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <button onClick={handlePrint} className="btn-glass flex-1 flex items-center justify-center gap-2">
              <Printer className="w-4 h-4" />
              طباعة
            </button>
            <button onClick={handleSave} className="btn-primary flex-1 flex items-center justify-center gap-2">
              <Save className="w-4 h-4" />
              حفظ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailySales;
