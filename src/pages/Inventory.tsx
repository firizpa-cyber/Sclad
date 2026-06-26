import React from 'react';
import { useState, useMemo } from 'react';
import { Package, Search, Plus, Edit2, Trash2, ArrowRightLeft, Settings } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Card, Input, Button, AnimatedPage } from '../components/ui';
import { formatCurrency, cn } from '../lib/utils';
import { Product, Location } from '../types';

export function Inventory() {
  const { products, addProduct, updateProduct, deleteProduct, moveInventory, bulkMoveInventory } = useStore();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkMoveModalOpen, setBulkMoveModalOpen] = useState(false);
  const [bulkMoveData, setBulkMoveData] = useState({ from: 'khona' as Location, to: 'shop' as Location });
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<Location | 'all'>('shop');
  
  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [moveModal, setMoveModal] = useState<{ product: Product, open: boolean }>({ product: null as any, open: false });
  
  // Form states
  const [formData, setFormData] = useState({
    name: '', brand: '', model: '', barcode: '',
    buyPrice: '', sellPrice: '', minStock: '5',
    stockKhona: '0', stockMain: '0', stockShop: '0'
  });
  const [moveData, setMoveData] = useState({ quantity: 1, from: 'khona' as Location, to: 'shop' as Location });

  const filteredProducts = useMemo(() => {
    const s = search.toLowerCase();
    return products.filter(p => {
      const matchesSearch = s ? (p.name.toLowerCase().includes(s) || 
                            p.brand.toLowerCase().includes(s) || 
                            p.model.toLowerCase().includes(s) || 
                            (p.barcode && p.barcode.includes(s))) : true;
      return matchesSearch;
    }).filter(p => activeTab === 'all' ? true : p.stock[activeTab as Location] > 0 || search);
  }, [search, products, activeTab]);

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const productData = {
      name: formData.name, brand: formData.brand, model: formData.model, barcode: formData.barcode,
      buyPrice: Number(formData.buyPrice), sellPrice: Number(formData.sellPrice), minStock: Number(formData.minStock),
      stock: {
        khona: Number(formData.stockKhona), main: Number(formData.stockMain), shop: Number(formData.stockShop)
      }
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
    } else {
      addProduct(productData);
    }
    
    setIsAddOpen(false);
    setEditingProduct(null);
    setFormData({ name: '', brand: '', model: '', barcode: '', buyPrice: '', sellPrice: '', minStock: '5', stockKhona: '0', stockMain: '0', stockShop: '0' });
  };

  const handleBulkMove = () => {
    bulkMoveInventory(Array.from(selectedIds), bulkMoveData.from, bulkMoveData.to);
    setBulkMoveModalOpen(false);
    setSelectedIds(new Set());
  };

  const handleMoveStock = () => {
    if (moveModal.product.stock[moveData.from] < moveData.quantity) {
      alert('Недостаточно товара на складе отправителе');
      return;
    }
    moveInventory(moveModal.product.id, moveData.quantity, moveData.from, moveData.to);
    setMoveModal({ product: null as any, open: false });
    setMoveData({ quantity: 1, from: 'khona', to: 'shop' });
  };

  return (
    <AnimatedPage className="flex flex-col gap-6 h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Управление складом</h1>
          <p className="text-sm text-slate-500 mt-1">{products.length} товаров в базе</p>
        </div>
        {selectedIds.size > 0 && (
          <Button variant="outline" onClick={() => setBulkMoveModalOpen(true)} className="gap-2 w-full md:w-auto text-blue-600 border-blue-200 hover:bg-blue-50">
            <ArrowRightLeft size={18} />
            Переместить ({selectedIds.size})
          </Button>
        )}
        <Button variant="primary" onClick={() => setIsAddOpen(true)} className="gap-2 w-full md:w-auto">
          <Plus size={18} />
          Добавить товар
        </Button>
      </div>

      <Card className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Filters Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 bg-white shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input 
              placeholder="Поиск по складу..." 
              className="pl-10 bg-slate-50 border-slate-200/60"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex p-1 bg-slate-100/80 rounded-xl w-full md:w-auto overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'Все' },
              { id: 'shop', label: 'Магазин' },
              { id: 'khona', label: 'Хона' },
              { id: 'main', label: 'Основной' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex-1 md:flex-none px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap",
                  activeTab === tab.id 
                    ? "bg-white text-slate-800 shadow-sm ring-1 ring-slate-200/50" 
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block flex-1 overflow-auto custom-scrollbar bg-white">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/50 text-slate-500 text-xs uppercase font-semibold sticky top-0 z-10 ring-1 ring-slate-100">
              <tr>
                <th className="px-4 py-4 rounded-tl-xl w-12">
                  <input 
                    type="checkbox" 
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    checked={filteredProducts.length > 0 && selectedIds.size === filteredProducts.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(new Set(filteredProducts.map(p => p.id)));
                      } else {
                        setSelectedIds(new Set());
                      }
                    }}
                  />
                </th>
                <th className="px-6 py-4">Товар</th>
                <th className="px-6 py-4">Марка/Модель</th>
                <th className="px-6 py-4">Штрихкод</th>
                <th className="px-6 py-4 text-right">Закупка</th>
                <th className="px-6 py-4 text-right">Продажа</th>
                <th className="px-6 py-4 text-center">Остатки</th>
                <th className="px-6 py-4 text-right rounded-tr-xl">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map(product => (
                <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      checked={selectedIds.has(product.id)}
                      onChange={(e) => {
                        const newSelected = new Set(selectedIds);
                        if (e.target.checked) {
                          newSelected.add(product.id);
                        } else {
                          newSelected.delete(product.id);
                        }
                        setSelectedIds(newSelected);
                      }}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-800">{product.name}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{product.brand} {product.model}</td>
                  <td className="px-6 py-4 text-slate-500 font-mono text-xs">{product.barcode || '—'}</td>
                  <td className="px-6 py-4 text-right font-medium text-slate-600">{formatCurrency(product.buyPrice)}</td>
                  <td className="px-6 py-4 text-right font-bold text-blue-600">{formatCurrency(product.sellPrice)}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 justify-center">
                      <div className="flex flex-col items-center">
                        <span className="text-[9px] text-slate-400 uppercase font-semibold">Маг</span>
                        <span className={cn("text-xs font-bold px-2 py-0.5 rounded-md mt-0.5", product.stock.shop > 0 ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-400")}>{product.stock.shop}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-[9px] text-slate-400 uppercase font-semibold">Хона</span>
                        <span className={cn("text-xs font-bold px-2 py-0.5 rounded-md mt-0.5", product.stock.khona > 0 ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-400")}>{product.stock.khona}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-[9px] text-slate-400 uppercase font-semibold">Осн</span>
                        <span className={cn("text-xs font-bold px-2 py-0.5 rounded-md mt-0.5", product.stock.main > 0 ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-400")}>{product.stock.main}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button title="Переместить" onClick={() => setMoveModal({ product, open: true })} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <ArrowRightLeft size={16} />
                      </button>
                      <button title="Редактировать" onClick={() => { setEditingProduct(product); setFormData({...product, stockKhona: String(product.stock.khona), stockMain: String(product.stock.main), stockShop: String(product.stock.shop), buyPrice: String(product.buyPrice), sellPrice: String(product.sellPrice), minStock: String(product.minStock) }); setIsAddOpen(true); }} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button title="Удалить" onClick={() => { if(confirm('Удалить товар?')) deleteProduct(product.id) }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile List View */}
        <div className="md:hidden flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-slate-50/50">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm flex flex-col gap-3">
              <div className="flex gap-3 items-start">
                <input 
                  type="checkbox" 
                  className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500 shrink-0"
                  checked={selectedIds.has(product.id)}
                  onChange={(e) => {
                    const newSelected = new Set(selectedIds);
                    if (e.target.checked) {
                      newSelected.add(product.id);
                    } else {
                      newSelected.delete(product.id);
                    }
                    setSelectedIds(newSelected);
                  }}
                />
                <div className="flex-1">
                  <div className="text-xs text-slate-500 mb-1 font-medium">{product.brand} {product.model}</div>
                  <div className="font-bold text-slate-800 leading-tight">{product.name}</div>
                  {product.barcode && <div className="text-[10px] text-slate-400 font-mono mt-1">{product.barcode}</div>}
                </div>
              </div>
              
              <div className="flex justify-between items-center py-2 border-y border-slate-100">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Закупка</span>
                  <span className="font-medium text-slate-600 text-sm">{formatCurrency(product.buyPrice)}</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Продажа</span>
                  <span className="font-bold text-blue-600 text-sm">{formatCurrency(product.sellPrice)}</span>
                </div>
              </div>

              <div className="flex gap-2 justify-between items-center">
                <div className="flex gap-1">
                  <div className="flex flex-col items-center bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                    <span className="text-[8px] text-slate-400 uppercase font-bold">Маг</span>
                    <span className={cn("text-xs font-bold", product.stock.shop > 0 ? "text-green-600" : "text-slate-400")}>{product.stock.shop}</span>
                  </div>
                  <div className="flex flex-col items-center bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                    <span className="text-[8px] text-slate-400 uppercase font-bold">Хона</span>
                    <span className={cn("text-xs font-bold", product.stock.khona > 0 ? "text-green-600" : "text-slate-400")}>{product.stock.khona}</span>
                  </div>
                  <div className="flex flex-col items-center bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                    <span className="text-[8px] text-slate-400 uppercase font-bold">Осн</span>
                    <span className={cn("text-xs font-bold", product.stock.main > 0 ? "text-green-600" : "text-slate-400")}>{product.stock.main}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                   <button onClick={() => setMoveModal({ product, open: true })} className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <ArrowRightLeft size={16} />
                  </button>
                  <button onClick={() => { setEditingProduct(product); setFormData({...product, stockKhona: String(product.stock.khona), stockMain: String(product.stock.main), stockShop: String(product.stock.shop), buyPrice: String(product.buyPrice), sellPrice: String(product.sellPrice), minStock: String(product.minStock) }); setIsAddOpen(true); }} className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                    <Edit2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Modals for Add/Edit and Move... */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">{editingProduct ? 'Редактировать товар' : 'Новый товар'}</h2>
              <button onClick={() => setIsAddOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg">
                <Settings size={20} /> {/* Should be X icon really, but just standardizing */}
              </button>
            </div>
            
            <form onSubmit={handleSaveProduct} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Название</label>
                  <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Марка</label>
                  <Input required value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Модель</label>
                  <Input required value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Штрихкод</label>
                  <Input value={formData.barcode} onChange={e => setFormData({...formData, barcode: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Цена закупки (сом)</label>
                  <Input type="number" required value={formData.buyPrice} onChange={e => setFormData({...formData, buyPrice: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Цена продажи (сом)</label>
                  <Input type="number" required value={formData.sellPrice} onChange={e => setFormData({...formData, sellPrice: e.target.value})} />
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-sm font-bold text-slate-800 mb-3">Остатки на складах</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Магазин</label>
                    <Input type="number" required value={formData.stockShop} onChange={e => setFormData({...formData, stockShop: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Хона</label>
                    <Input type="number" required value={formData.stockKhona} onChange={e => setFormData({...formData, stockKhona: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Основной</label>
                    <Input type="number" required value={formData.stockMain} onChange={e => setFormData({...formData, stockMain: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsAddOpen(false)}>Отмена</Button>
                <Button type="submit" variant="primary" className="flex-1">Сохранить</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      
      {bulkMoveModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm bg-white p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-1">Массовое перемещение</h2>
            <p className="text-sm text-slate-500 mb-6">Будет перемещено {selectedIds.size} товаров (весь доступный остаток на выбранном складе)</p>
            
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Откуда</label>
                  <select 
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-800 font-medium" 
                    value={bulkMoveData.from} 
                    onChange={e => {
                      const newFrom = e.target.value as Location;
                      let newTo = bulkMoveData.to;
                      if (newFrom === newTo) {
                        newTo = newFrom === 'shop' ? 'main' : 'shop';
                      }
                      setBulkMoveData({...bulkMoveData, from: newFrom, to: newTo});
                    }}
                  >
                    <option value="khona">Хона</option>
                    <option value="main">Основной</option>
                    <option value="shop">Магазин</option>
                  </select>
                </div>
                <ArrowRightLeft className="mt-6 text-slate-400 shrink-0" size={16} />
                <div className="flex-1">
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Куда</label>
                  <select 
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-800 font-medium" 
                    value={bulkMoveData.to} 
                    onChange={e => setBulkMoveData({...bulkMoveData, to: e.target.value as Location})}
                  >
                    {bulkMoveData.from !== 'shop' && <option value="shop">Магазин</option>}
                    {bulkMoveData.from !== 'main' && <option value="main">Основной</option>}
                    {bulkMoveData.from !== 'khona' && <option value="khona">Хона</option>}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <Button variant="outline" className="flex-1" onClick={() => setBulkMoveModalOpen(false)}>Отмена</Button>
                <Button variant="primary" className="flex-1" onClick={handleBulkMove}>
                  Переместить
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {moveModal.open && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm bg-white p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-1">Перемещение товара</h2>
            <p className="text-sm text-slate-500 mb-6 truncate">{moveModal.product?.name}</p>
            
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Откуда</label>
                  <select 
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-800 font-medium" 
                    value={moveData.from} 
                    onChange={e => {
                      const newFrom = e.target.value as Location;
                      let newTo = moveData.to;
                      if (newFrom === newTo) {
                        newTo = newFrom === 'shop' ? 'main' : 'shop';
                      }
                      setMoveData({...moveData, from: newFrom, to: newTo});
                    }}
                  >
                    <option value="khona">Хона ({moveModal.product?.stock.khona || 0})</option>
                    <option value="main">Основной ({moveModal.product?.stock.main || 0})</option>
                    <option value="shop">Магазин ({moveModal.product?.stock.shop || 0})</option>
                  </select>
                </div>
                <ArrowRightLeft className="mt-6 text-slate-400 shrink-0" size={16} />
                <div className="flex-1">
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Куда</label>
                  <select 
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-800 font-medium" 
                    value={moveData.to} 
                    onChange={e => setMoveData({...moveData, to: e.target.value as Location})}
                  >
                    {moveData.from !== 'shop' && <option value="shop">Магазин</option>}
                    {moveData.from !== 'main' && <option value="main">Основной</option>}
                    {moveData.from !== 'khona' && <option value="khona">Хона</option>}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Количество</label>
                <Input 
                  type="number" 
                  min={1} 
                  max={moveModal.product?.stock[moveData.from] || 1} 
                  value={moveData.quantity} 
                  onChange={e => setMoveData({...moveData, quantity: Number(e.target.value)})} 
                  className="h-12 text-lg font-bold" 
                />
              </div>

              <div className="flex gap-3 mt-4">
                <Button variant="outline" className="flex-1" onClick={() => setMoveModal({ product: null as any, open: false })}>Отмена</Button>
                <Button variant="primary" className="flex-1" onClick={handleMoveStock} disabled={!moveModal.product || moveModal.product.stock[moveData.from] === 0}>
                  Переместить
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </AnimatedPage>
  );
}
