import React, { useState, useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { Search, Calendar, Printer, FileSpreadsheet, TrendingUp } from 'lucide-react';
import { format, isWithinInterval, parseISO, startOfDay, endOfDay } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toast } from 'sonner';

const SalesRecord: React.FC = () => {
  const { sales, settings } = useData();
  const [dateFilter, setDateFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const saleDate = parseISO(sale.createdAt);
      
      if (dateFilter) {
        const filterDate = parseISO(dateFilter);
        return format(saleDate, 'yyyy-MM-dd') === format(filterDate, 'yyyy-MM-dd');
      }
      
      if (startDate && endDate) {
        return isWithinInterval(saleDate, {
          start: startOfDay(parseISO(startDate)),
          end: endOfDay(parseISO(endDate)),
        });
      }
      
      return true;
    });
  }, [sales, dateFilter, startDate, endDate]);

  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0);

  const handleExport = () => {
    if (filteredSales.length === 0) {
      toast.error('لا توجد مبيعات للتصدير');
      return;
    }
    toast.success('جاري التصدير...');
  };

  const clearFilters = () => {
    setDateFilter('');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold gradient-text">{settings.sidebarLabels.salesRecord}</h2>
        <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
          <TrendingUp className="w-5 h-5 text-primary" />
          <span className="text-sm text-muted-foreground">إجمالي المبيعات:</span>
          <span className="text-lg font-bold text-primary">{totalSales.toFixed(2)} ج.م</span>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm text-muted-foreground block mb-1">بحث يوم معين</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setStartDate('');
                setEndDate('');
              }}
              className="glass-input"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground block mb-1">من تاريخ</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setDateFilter('');
              }}
              className="glass-input"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground block mb-1">إلى تاريخ</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setDateFilter('');
              }}
              className="glass-input"
            />
          </div>
          <div className="flex items-end">
            <button onClick={clearFilters} className="btn-glass w-full">
              مسح الفلاتر
            </button>
          </div>
        </div>
      </div>

      {/* Sales table */}
      <div className="glass-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">سجل المبيعات</h3>
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
                <th>#</th>
                <th>التاريخ</th>
                <th>الوقت</th>
                <th>عدد الأصناف</th>
                <th>الإجمالي</th>
                <th>المستلم</th>
                <th>الباقي</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-muted-foreground">
                    لا توجد مبيعات
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale, index) => (
                  <tr key={sale.id}>
                    <td>{index + 1}</td>
                    <td>{format(new Date(sale.createdAt), 'dd/MM/yyyy', { locale: ar })}</td>
                    <td>{format(new Date(sale.createdAt), 'hh:mm a', { locale: ar })}</td>
                    <td>{sale.items.length}</td>
                    <td className="text-primary font-semibold">{sale.totalAmount.toFixed(2)} ج.م</td>
                    <td>{sale.receivedAmount.toFixed(2)} ج.م</td>
                    <td className="text-success">{sale.changeAmount.toFixed(2)} ج.م</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        {filteredSales.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-white/5 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">عدد الفواتير</p>
                <p className="text-xl font-bold">{filteredSales.length}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">إجمالي المبيعات</p>
                <p className="text-xl font-bold text-primary">{totalSales.toFixed(2)} ج.م</p>
              </div>
              <div className="p-3 bg-success/10 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">إجمالي المستلم</p>
                <p className="text-xl font-bold text-success">
                  {filteredSales.reduce((sum, s) => sum + s.receivedAmount, 0).toFixed(2)} ج.م
                </p>
              </div>
              <div className="p-3 bg-accent/10 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">متوسط الفاتورة</p>
                <p className="text-xl font-bold text-accent">
                  {(totalSales / filteredSales.length).toFixed(2)} ج.م
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesRecord;
