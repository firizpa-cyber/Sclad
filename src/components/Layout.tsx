import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, Package, DollarSign, CreditCard, ReplaceAll, Settings, Bell,
LogOut, Menu, X, Store } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';

const navItems = [
  { icon: ShoppingCart, label: 'Касса', path: '/' },
  { icon: Package, label: 'Склад', path: '/inventory' },
  { icon: DollarSign, label: 'Финансы', path: '/finance' },
  { icon: CreditCard, label: 'Долги', path: '/debts' },
  { icon: ReplaceAll, label: 'Возвраты', path: '/returns' },
  { icon: Settings, label: 'Настройки', path: '/settings' },
];

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { notifications } = useStore();
  const unreadNotifs = notifications.filter(n => !n.read).length;

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-white border-r border-slate-200/60 shadow-sm z-20">
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <div className="flex items-center gap-3 text-blue-600">
            <Store size={24} strokeWidth={2.5} />
            <span className="text-lg font-bold tracking-tight text-slate-900">AutoPOS</span>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 overflow-y-auto custom-scrollbar">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <button
                    onClick={() => navigate(item.path)}
                    className={cn(
                      "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all font-medium",
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                    <span className="text-sm">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="p-4 border-t border-slate-100">
          <button 
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors font-medium"
          >
            <LogOut size={20} />
            <span className="text-sm">Выйти</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        {/* Mobile Header & Desktop Topbar */}
        <header className="shrink-0 h-16 bg-white border-b border-slate-200/60 md:border-none md:bg-transparent flex items-center justify-between px-4 md:px-6 z-10">
          <div className="flex items-center gap-3 md:hidden text-blue-600">
            <Store size={24} strokeWidth={2.5} />
            <span className="text-lg font-bold tracking-tight text-slate-900">AutoPOS</span>
          </div>
          <div className="hidden md:block">
            {/* Empty left side for desktop */}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/notifications')}
              className="relative p-2.5 bg-white md:bg-slate-200/40 rounded-full text-slate-600 hover:bg-slate-200/80 transition-colors"
            >
              <Bell size={20} />
              {unreadNotifs > 0 && (
                <span className="absolute top-0 right-0 w-4v h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full ring-2 ring-white">
                  {unreadNotifs}
                </span>
              )}
            </button>
            <div className="hidden md:flex items-center gap-2 p-1 pr-3 bg-white rounded-full border border-slate-200/80 shadow-sm">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                Ad
              </div>
              <span className="text-sm font-medium text-slate-700">Admin</span>
            </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col min-h-0 bg-slate-50 relative pb-20 md:pb-0">
          <div className="flex-1 flex flex-col min-h-0 w-full max-w-7xl mx-auto p-4 md:p-6">
            <Outlet />
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-100 px-2 py-2 flex justify-around items-center z-50 pb-[env(safe-area-inset-bottom)]">
          {
            navItems.slice(0, 4).map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-colors gap-1",
                    isActive ? "text-blue-600" : "text-slate-500"
                  )}
                >
                  <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </button>
              )
            })
          }
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-colors gap-1 text-slate-500"
          >
            <Menu size={22} />
            <span className="text-[10px] font-medium">Еще</span>
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {
          mobileMenuOpen && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-60 md:hidden flex flex-col justify-end">
              <div className="bg-white rounded-t-32xl px-6 pt-6 pb-10 animate-flexInUp max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg">Меню</h3>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-2 bg-slate-100 rounded-full text-slate-600">
                    <X size={20} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {navItems.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setMobileMenuOpen(false);
                      }}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-xl transition-all",
                        location.pathname === item.path ? "bg-blue-50 text-blue-600" : "bg-slate-50_30 border border-slate-100 text-slate-700"
                      )}
                    >
                      <item.icon size={20} />
                      <span className="font-medium text-sm">{item.label}</span>
                    </button>
                  ))}
                  <button className="flex items-center gap-3 p-4 rounded-xl border border-red-100 bg-red-50/30 text-red-600">
                    <LogOut size={20} />
                    <span className="font-medium text-sm">Выйти</span>
                  </button>
                </div>
              </div>
            </div>
          )
        }
      </div>
    </div>
  );
}
