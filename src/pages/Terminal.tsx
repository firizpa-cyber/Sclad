import { useState, useMemo } from 'react';
import { Search, ShoppingCart, X, Plus, Minus, CreditCard, Package } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Card, Input, Button, AnimatedPage } from '../components/ui';
import { formatCurrency, cn } from '../lib/utils';
import { Product, Location, CartItem } from '../types';
import { categories as mockCategories } from '../data/mockProducts';

export function Terminal() {
  const { products, addSale } = useStore();
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('Все');
  const [sellLocation, setSellLocation] = useState<Location>('shop');

  const categories = ['Все', ...mockCategories];

  const filteredProducts = useMemo(() => {
    const s = search.toLowerCase();
    return products.filter(p => {
      const matchesSearch = s ? (p.name.toLowerCase().includes(s) || 
                            p.brand.toLowerCase().includes(s) || 
                            p.model.toLowerCase().includes(s) || 
                            (p.barcode && p.barcode.includes(s))) : true;
      const matchesCategory = activeCategory === 'Все' ? true : p.name.toLowerCase().includes(activeCategory.toLowerCase());
      return matchesSearch && matchesCategory;
    });
  }, [search, products, activeCategory]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock[sellLocation]) return prev;
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      if (product.stock[sellLocation] <= 0) return prev;
      return [...prev, { product, quantity: 1, location: sellLocation }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === id) {
        const newQ = item.quantity + delta;
        if (newQ <= 0) return item;
        if (newQ > item.product.stock[sellLocation]) return item;
        return { ...item, quantity: newQ };
      }
      return item;
    }));
  };

  const removeCartItem = (id: string) => {
    setCart(prev => prev.filter(item => item.product.id !== id));
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    addSale(cart);
    setCart([]);
  };

  const total = cart.reduce((acc, item) => acc + item.product.sellPrice * item.quantity, 0);

  return (
    <AnimatedPage className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Main Area - Products */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden h-full">
        
        {/* Top Bar: Search & Location */}
        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input 
              placeholder="Поиск товаров..." 
              className="pl-11 bg-white border-slate-200/60 shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select 
            className="h-11 px-4 rounded-xl border border-slate-200/60 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium shrink-0 shadow-sm"
            value={sellLocation}
            onChange={(e) => setSellLocation(e.target.value as Location)}
          >
            <option value="shop">Склад: Магазин</option>
            <option value="khona">Склад: Хона</option>
            <option value="main">Склад: Основной</option>
          </select>
        </div>

        {/* Categories Horizontal Scroll */}
        <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar shrink-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all",
                activeCategory === cat 
                  ? "bg-slate-800 text-white shadow-sm" 
                  : "bg-white text-slate-600 border border-slate-200/60 hover:bg-slate-50 hover:border-slate-300"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 pb-10 lg:pb-0">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 min-h-[300px]">
              <Package size={48} className="opacity-20 mb-4" strokeWidth={1} />
              <p className="font-medium">Ничего не найдено</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredProducts.map(product => {
                const stock = product.stock[sellLocation];
                const isOutOfStock = stock <= 0;
                
                return (
                  <div 
                    key={product.id} 
                    className={cn(
                      "bg-white p-4 rounded-2xl border border-slate-200/60 transition-all flex flex-col justify-between h-[140px] group relative overflow-hidden",
                      isOutOfStock ? "opacity-50 grayscale" : "hover:border-blue-300 hover:shadow-md hover:shadow-blue-500/5 cursor-pointer"
                    )}
                    onClick={() => !isOutOfStock && addToCart(product)}
                  >
                    <div>
                      <div className="text-[10px] text-slate-500 mb-1.5 font-semibold tracking-wider">{product.brand} {product.model}</div>
                      <h3 className="font-semibold text-sm text-slate-800 line-clamp-2 leading-snug group-hover:text-blue-700 transition-colors">{product.name}</h3>
                    </div>
                    <div className="flex items-end justify-between mt-auto pt-2">
                      <div className="font-bold text-slate-900">{formatCurrency(product.sellPrice)}</div>
                      <div className={cn(
                        "text-[10px] px-2 py-1 rounded-md font-bold tracking-wide",
                        stock > 0 ? "bg-green-50 text-green-700 ring-1 ring-green-600/10" : "bg-slate-100 text-slate-500 ring-1 ring-slate-400/20"
                      )}>
                        {stock} шт
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Cart Section */}
      <Card className="w-full lg:w-[380px] flex flex-col h-[50vh] lg:h-full shrink-0 overflow-hidden border-slate-200/60 shadow-sm mb-4 lg:mb-0">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-2.5 font-bold text-lg text-slate-800">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <ShoppingCart size={16} />
            </div>
            Корзина
          </div>
          <div className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold ring-1 ring-slate-200">
            {cart.reduce((a, b) => a + b.quantity, 0)} тов.
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar bg-slate-50/50">
          {cart.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-slate-400 flex-col gap-3">
              <ShoppingCart size={40} strokeWidth={1} className="text-slate-300" />
              <p className="text-sm font-medium">Корзина пуста</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.product.id} className="flex flex-col gap-3 p-3 bg-white border border-slate-200/60 rounded-xl shadow-sm">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm leading-tight text-slate-800 truncate">{item.product.name}</div>
                    <div className="text-[10px] text-slate-500 mt-1 font-medium">В наличии: {item.product.stock[sellLocation]}</div>
                  </div>
                  <button onClick={() => removeCartItem(item.product.id)} className="text-slate-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-colors shrink-0">
                    <X size={16} />
                  </button>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="font-bold text-slate-900">{formatCurrency(item.product.sellPrice * item.quantity)}</div>
                  <div className="flex items-center gap-1 bg-slate-50 rounded-lg p-1 ring-1 ring-slate-200/60">
                    <button onClick={() => updateQuantity(item.product.id, -1)} className="w-7 h-7 flex items-center justify-center hover:bg-white rounded-md transition-colors text-slate-600 shadow-sm">
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-slate-800">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product.id, 1)} className="w-7 h-7 flex items-center justify-center hover:bg-white rounded-md transition-colors text-slate-600 shadow-sm">
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-5 border-t border-slate-100 bg-white shrink-0">
          <div className="flex justify-between items-center mb-5">
            <span className="text-sm font-semibold text-slate-500">Итого к оплате</span>
            <span className="text-2xl font-bold text-slate-900 tracking-tight">{formatCurrency(total)}</span>
          </div>
          <Button 
            variant="primary"
            className="w-full h-14 text-base font-bold gap-2 shadow-lg shadow-blue-500/20"
            disabled={cart.length === 0}
            onClick={handleCheckout}
          >
            <CreditCard size={20} />
            Оформить заказ
          </Button>
        </div>
      </Card>
    </AnimatedPage>
  );
}
