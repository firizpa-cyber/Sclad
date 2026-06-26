import { useStore } from '../store/useStore';
import { Card, AnimatedPage } from '../components/ui';
import { formatCurrency } from '../lib/utils';
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, Download, Receipt } from 'lucide-react';
import { useMemo } from 'react';

function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csvRows = [];
  csvRows.push(headers.join(','));

  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header];
      return `\"${String(val).replace(/\"/g, '\"\"')}\"`;
    });
    csvRows.push(values.join(','));
  }

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('hidden', '');
  a.setAttribute('href', url);
  a.setAttribute('download', filename);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function Finance() {
  const { transactions } = useStore();

  const sales = useMemo(() => transactions.filter(t => t.type === 'sale'), [transactions]);
  const returns = useMemo(() => transactions.filter(t => t.type === 'return'), [transactions]);
  const history = transactions;

  const totalSales = useMemo(() => {
    return sales.reduce((acc, sale) => acc + sale.totalAmount, 0);
  }, [sales]);

  const totalProfit = useMemo(() => {
    return sales.reduce((acc, sale) => acc + sale.totalProfit, 0);
  }, [sales]);

  const totalReturnsAmount = useMemo(() => {
    return returns.reduce((acc, ret) => acc + Math.abs(ret.totalAmount), 0);
  }, [returns]);

  const handleExport = () => {
    const data = history.map(h => ({
      Дата: new Date(h.date).toLocaleString(),
      Тип: h.type === 'sale' ? 'Продажа' : h.type === 'return' ? 'Возврат' : 'Перемещение',
      Сумма: h.type === 'sale' ? h.totalAmount : h.type === 'return' ? Math.abs(h.totalAmount) : 0,
    }));
    exportToCSV(data, `finance_report_${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <AnimatedPage className="flex flex-col gap-6 h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Финансы</h1>
          <p className="text-sm text-slate-500 mt-1">Обзор финансовых показателей</p>
        </div>
        <button onClick={handleExport} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200/60 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium shadow-sm">
          <Download size={18} />
          Экспорт CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
        <Card className="p-6 bg-gradient-to-br from-blue-600 to-blue-700 text-white border-none shadow-lg shadow-blue-600/20">
          <div className="flex items-center gap-3 text-blue-100 mb-4">
            <div className="p-2 bg-white/10 rounded-lg">
              <TrendingUp size={20} />
            </div>
            <span className="font-medium">Выручка (Всего)</span>
          </div>
          <div className="text-3xl font-bold tracking-tight">{formatCurrency(totalSales)}</div>
        </Card>

        <Card className="p-6 bg-white">
          <div className="flex items-center gap-3 text-slate-500 mb-4">
            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
              <TrendingUp size={20} />
            </div>
            <span className="font-medium">Чистая Прибыль</span>
          </div>
          <div className="text-3xl font-bold tracking-tight text-slate-900">{formatCurrency(totalProfit)}</div>
          <div className="text-xs text-slate-400 mt-2">После вычета закупочной стоимости</div>
        </Card>

        <Card className="p-6 bg-white">
          <div className="flex items-center gap-3 text-slate-500 mb-4">
            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
              <TrendingDown size={20} />
            </div>
            <span className="font-medium">Сумма Возвратов</span>
          </div>
          <div className="text-3xl font-bold tracking-tight text-slate-900">{formatCurrency(totalReturnsAmount)}</div>
          <div className="text-xs text-slate-400 mt-2">{returns.length} операций возврата</div>
        </Card>
      </div>

      <Card className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-white flex items-center gap-2">
          <Receipt size={18} className="text-slate-400" />
          <h2 className="font-bold text-slate-800">История операций</h2>
        </div>
        
         {/* Desktop Table View */}
        <div className="hidden md:block flex-1 overflow-auto custom-scrollbar bg-slate-50/50">
          <table className="w-full text-sm text-left">
            <thead className="bg-white text-slate-500 text-xs uppercase font-semibold sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-4">Дата</th>
                <th className="px-6 py-4">Тип</th>
                <th className="px-6 py-4">Описание</th>
                <th className="px-6 py-4 text-right">Сумма</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    Нет записей операций
                  </td>
                </tr>
              ) : history.map(t => (
                <tr key={t.id} className="bg-white hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-slate-500">{new Date(t.date).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {t.type === 'sale' && <span className="bg-green-50 text-green-700 px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 w-fit uppercase tracking-wider ring-1 ring-green-600/10"><ArrowUpRight size={12}/> Продажа</span>}
                    {t.type === 'return' && <span className="bg-red-50 text-red-700 px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 w-fit uppercase tracking-wider ring-1 ring-red-600/10"><ArrowDownRight size={12}/> Возврат</span>}
                    {t.type === 'move' && <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 w-fit uppercase tracking-wider ring-1 ring-blue-600/10">Перемещение</span>}
                  </td>
                  <td className="px-6 py-4 truncate max-w-md text-slate-700 font-medium">
                    {t.type === 'sale' && `Продажа ${t.items.length} позиций`}
                    {t.type === 'return' && `Возврат товара (${t.items[0]?.quantity || 0} шт)`}
                    {t.type === 'move' && `Перемещение: ${t.from} ➔ ${t.to} (${t.items[0]?.quantity || 0} шт)`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-slate-900">
                    {t.type === 'sale' && <span className="text-green-600">+{formatCurrency(t.totalAmount)}</span>}
                    {t.type === 'return' && <span className="text-red-500">-{formatCurrency(Math.abs(t.totalAmount))}</span>}
                    {t.type === 'move' && <span className="text-slate-400">—</span>}
                  </td>
                </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Mobile List View */}
        <div className="md:hidden flex-1 overflow-y-auto bg-slate-50/50 p-4 flex flex-col gap-3 custom-scrollbar">
          {history.length === 0 ? (
            <div className="text-center text-slate-400 py-10">
              Нет записей операций
            </div>
          ) : history.map(t => (
            <div key={t.id} className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div className="text-xs text-slate-500 font-medium">{new Date(t.date).toLocaleString()}</div>
                {t.type === 'sale' && <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-md text-[10px] font-bold ring-1 ring-green-600/10">Продажа</span>}
                {t.type === 'return' && <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded-md text-[10px] font-bold ring-1 ring-red-600/10">Возврат</span>}
                {t.type === 'move' && <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md text-[10px] font-bold ring-1 ring-blue-600/10">Перемещение</span>}
              </div>
              <div className="text-sm font-medium text-slate-800">
                {t.type === 'sale' && `Продажа ${t.items.length} позиций`}
                {t.type === 'return' && `Возврат товара (${t.items[0]?.quantity || 0} шт)`}
                {t.type === 'move' && `И�7: ${t.from} В: ${t.to} (${t.items[0]?.quantity || 0} шт)`}
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <span className="font-bold text-base">
                  {t.type === 'sale' && <span className="text-green-600">+{formatCurrency(t.totalAmount)}</span>}
                  {t.type === 'return' && <span className="text-red-500">-{formatCurrency(Math.abs(t.totalAmount))}</span>}
                  {t.type === 'move' && <span className="text-slate-400">—</span>}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </AnimatedPage>
  );
}
