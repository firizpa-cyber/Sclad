import { useState } from 'react';
import { CornerDownLeft, Search, Package } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Card, Input, Button, AnimatedPage } from '../components/ui';
import { formatCurrency, cn } from '../lib/utils';
import { Location } from '../types';

export function Returns() {
  const { products, addReturn } = useStore();
  const [search, setSearch] = useState('');
  const [returnState, setReturnState] = useState<{ productId: string, quantity: number, price: number, location: Location } | null>(null);

  const filteredProducts = products.filter(p => {
    if (!search) return false;
    const s = search.toLowerCase();
    return p.name.toLowerCase().includes(s) || 
           p.brand.toLowerCase().includes(s) || 
           p.model.toLowerCase().includes(s) ||
           (p.barcode && p.barcode.includes(s));
  });

  const handleReturn = () => {
    if (!returnState || returnState.quantity <= 0 || returnState.price <= 0) return;
    addReturn(returnState.productId, returnState.quantity, returnState.price, returnState.location);
    setSearch('');
    setReturnState(null);
  };

  return (
    <AnimatedPage className="flex flex-col gap-6 h-full">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Возвраты</h1>
        <p className="text-sm text-slate-500 mt-1">Оформлейие возвратов от покупателей</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-0">
        <Card className="flex-1 flex flex-col h-full overflow-hidden bg-white">
          <div className="p-5 border-b border-slate-100 shrink-0">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <Input 
                placeholder="Поиск товара для возврата..." 
                className="pl-11 h-13 text-base bg-slate-50/50"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full ctext-slate-400">
                <Package size={48} className="opacity-20 mb-4" strokeWidth={1} />
                <p>{search ? 'Ничего не найдено' : 'Введите название или штрихкод'}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredProducts.map(product => {
                  const isSelected = returnState?.productId === product.id;
                  return (
                    <div 
                      key={product.id} 
                      className={cn(
                        "bg-white p-4 rounded-xl border cursor-pointer transition-all",
                        isSelected 
                          ? "border-red-500 ring-2 ring-red-500/20" 
                          : "border-slate-200/60 hover:border-red-300 hover:shadow-sm"
                      )}
                      onClick={() => setReturnState({ productId: product.id, quantity: 1, price: product.sellPrice, location: 'shop' })}
                    >
                      <div className="text-[10px] text-slate-500 mb-1 font-medium">{product.brand} {product.model}</div>
                      <h3 className="font-bold text-slate-800 mb-2 line-clamp-2 leading-tight">{product.name}</h3>
                      <div className="text-orange-600 font-bold text-sm">{formatCurrency(product.sellPrice)}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>

        <Card className="w-full md:w-[400px] p-6 flex flex-col gap-5 shrink-0 bg-white">
          <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <CornerDownLeft size={20} className="text-red-500" />
            Детали возврата
          </h2>
          
          {!returnState ? (
            <div className="flex-1 flex col items-center justify-center text-slate-400 py-10">
              Выберите товар для возврата
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-2 block">Склад для возврата</label>
                <select 
                  className="w-full h-12 px-4 rounded-xl border border-slate-200/60 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-red-500/20 text-slate-700 text-sm font-medium"
                  value={returnState.location}
                  onChange={(e) => setReturnState({ ...returnState, location: e.target.value as Location })}
                >
                  <option value="shop">Магазин</option>
                  <option value="khona">Хона</option>
                  <option value="main">Основной</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-2 block">Кол.</label>
                  <Input 
                    type="number" 
                    min={1} 
                    value={returnState.quantity} 
                    onChange={(e) => setReturnState({ ...returnState, quantity: Number(e.target.value) })} 
                    className="h-12 text-lg font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-2 block">Цена (сом)</label>
                  <Input 
                    type="number" 
                    min={0.1} 
                    value={returnState.price} 
                    onChange={(e) => setReturnState({ ...returnState, price: Number(e.target.value) })} 
                    className="h-12 text-lg font-bold"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-500">Сумма возврата</span>
                  <span className="text-2xl font-bold text-red-600">{formatCurrency(returnState.price * returnState.quantity)}</span>
                </div>
              </div>

              <Button variant="danger" className="w-full h-14 text-base font-bold mt-2" onClick={handleReturn}>
                Оформить возврат
              </Button>
            </div>
          )}
        </Card>
      </div>
    </AnimatedPage>
  );
}
