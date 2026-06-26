import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, Transaction, Debt, Settings, Location, AppNotification } from '../types';

interface StoreState {
 products: Product[];
 transactions: Transaction[];
 debts: Debt[];
 settings: Settings;
 notifications: AppNotification[];
 
 // Actions
 addProduct: (product: Omit<Product, 'id'>) => void;
 updateProduct: (id: string, product: Partial<Product>) => void;
 deleteProduct: (id: string) => void;
 
 // Inventory movement
 moveInventory: (productId: string, quantity: number, from: Location, to: Location) => void;
  bulkMoveInventory: (productIds: string[], from: Location, to: Location) => void;
 
 // Transactions
 addSale: (items: { product: Product; quantity: number; location: Location }[]) => void;
 addReturn: (productId: string, quantity: number, price: number, location: Location) => void;
 
 // Debts
 addDebt: (debt: Omit<Debt, 'id'>) => void;
 payDebt: (id: string) => void;
 
 // Settings
 updateSettings: (settings: Partial<Settings>) => void;

 // Notifications
 addNotification: (notification: Omit<AppNotification, 'id' | 'date' | 'read'>) => void;
 markNotificationRead: (id: string) => void;
 markAllNotificationsRead: () => void;
  clearNotifications: () => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

import { MOCK_PRODUCTS } from '../data/mockProducts';

export const useStore = create<StoreState>()(
 persist(
 (set, get) => ({
 products: MOCK_PRODUCTS,
 transactions: [],
 debts: [],
 notifications: [],
 settings: {
 telegramBotToken: '8868549277:AAH_1cs-imrlCjGo6HhZEPbr2att3d5x508',
 telegramChatId: '1323482480',
 },

 addNotification: (notification) => {
 const newNotif = { ...notification, id: generateId(), date: new Date().toISOString(), read: false };
 set((state) => ({ notifications: [newNotif, ...state.notifications] }));
 
 if ('Notification' in window && Notification.permission === 'granted') {
 try {
 if (navigator.serviceWorker && navigator.serviceWorker.controller) {
 navigator.serviceWorker.ready.then(registration => {
 registration.showNotification(notification.title, { body: notification.message });
 });
 } else {
 new Notification(notification.title, { body: notification.message });
 }
 } catch (e) {
 console.error('Push error:', e);
 }
 }
 },

 markNotificationRead: (id) => set((state) => ({
 notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
 })),

 markAllNotificationsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, read: true }))
  })),
  clearNotifications: () => set({ notifications: [] }),

 addProduct: (product) => set((state) => ({
 products: [...state.products, { ...product, id: generateId() }]
 })),

 updateProduct: (id, productUpdate) => set((state) => ({
 products: state.products.map(p => p.id === id ? { ...p, ...productUpdate } : p)
 })),

 deleteProduct: (id) => set((state) => ({
 products: state.products.filter(p => p.id !== id)
 })),

 
  bulkMoveInventory: (productIds, from, to) => set((state) => {
    let newTransactions = [];
    let updatedProducts = state.products.map(p => {
      if (productIds.includes(p.id)) {
        const qty = p.stock[from];
        if (qty > 0 && from !== to) {
          const newStock = { ...p.stock };
          newStock[from] -= qty;
          newStock[to] += qty;
          
          newTransactions.push({
            id: generateId() + Math.random().toString(36).substr(2, 5),
            type: 'move',
            date: new Date().toISOString(),
            items: [{ productId: p.id, name: p.name, quantity: qty, price: p.buyPrice, buyPrice: p.buyPrice }],
            totalAmount: 0,
            totalProfit: 0,
            from: from,
            to: to
          });
          
          return { ...p, stock: newStock };
        }
      }
      return p;
    });
    
    return { 
      products: updatedProducts, 
      transactions: [...newTransactions, ...state.transactions] 
    };
  }),

  moveInventory: (productId, quantity, from, to) => set((state) => {
 const products = state.products.map(p => {
 if (p.id === productId) {
 const newStock = { ...p.stock };
 if (from !== to) {
 newStock[from] -= quantity;
 newStock[to] += quantity;
 }
 return { ...p, stock: newStock };
 }
 return p;
 });

 const transaction: Transaction = {
 id: generateId(),
 type: 'move',
 date: new Date().toISOString(),
 items: [{ productId, name: products.find(p => p.id === productId)?.name || '', quantity, price: 0, buyPrice: 0 }],
 totalAmount: 0,
 totalProfit: 0,
 from,
 to
 };

 return { products, transactions: [transaction, ...state.transactions] };
 }),

 addSale: (items) => set((state) => {
 let totalAmount = 0;
 let totalProfit = 0;
 const transactionItems = items.map(item => {
 const profit = (item.product.sellPrice - item.product.buyPrice) * item.quantity;
 totalAmount += item.product.sellPrice * item.quantity;
 totalProfit += profit;
 return {
 productId: item.product.id,
 name: item.product.name,
 quantity: item.quantity,
 price: item.product.sellPrice,
 buyPrice: item.product.buyPrice
 };
 });

 const products = state.products.map(p => {
 const item = items.find(i => i.product.id === p.id);
 if (item) {
 return {
 ...p,
 stock: {
 ...p.stock,
 [item.location]: p.stock[item.location] - item.quantity
 }
 };
 }
 return p;
 });

 const transaction: Transaction = {
 id: generateId(),
 type: 'sale',
 date: new Date().toISOString(),
 items: transactionItems,
 totalAmount,
 totalProfit
 };

 // Notify Telegram if setting enabled (mocked client side)
 const s = state.settings;
 let newNotifications = [...state.notifications];

 items.forEach(item => {
 const newStock = products.find(p => p.id === item.product.id)?.stock[item.location] || 0;
 if (newStock <= item.product.minStock) {
 const text = `⚠️ Низкий остаток: ${item.product.name} (Осталось: ${newStock} на ${item.location})`;
 
 // Add to in-app notifications
 const newNotif: AppNotification = {
 id: generateId(),
 title: 'Критический остаток',
 message: text,
 date: new Date().toISOString(),
 read: false,
 type: 'alert'
 };
 newNotifications = [newNotif, ...newNotifications];

 // Show local push notification
 if ('Notification' in window && Notification.permission === 'granted') {
 try {
 if (navigator.serviceWorker && navigator.serviceWorker.controller) {
 navigator.serviceWorker.ready.then(registration => {
 registration.showNotification(newNotif.title, { body: newNotif.message });
 });
 } else {
 new Notification(newNotif.title, { body: newNotif.message });
 }
 } catch (e) {
 console.error('Push error:', e);
 }
 }

 // Send to Telegram
 if (s.telegramBotToken && s.telegramChatId) {
 fetch(`https://api.telegram.org/bot${s.telegramBotToken}/sendMessage?chat_id=${s.telegramChatId}&text=${encodeURIComponent(text)}`).catch(console.error);
 }
 }
 });

 return { products, transactions: [transaction, ...state.transactions], notifications: newNotifications };
 }),

 addReturn: (productId, quantity, price, location) => set((state) => {
 const product = state.products.find(p => p.id === productId);
 if (!product) return state;

 const products = state.products.map(p => {
 if (p.id === productId) {
 return {
 ...p,
 stock: {
 ...p.stock,
 [location]: p.stock[location] + quantity
 }
 };
 }
 return p;
 });

 const transaction: Transaction = {
 id: generateId(),
 type: 'return',
 date: new Date().toISOString(),
 items: [{ productId, name: product.name, quantity, price, buyPrice: product.buyPrice }],
 totalAmount: -(price * quantity),
 totalProfit: -((price - product.buyPrice) * quantity),
 to: location
 };

 return { products, transactions: [transaction, ...state.transactions] };
 }),

 addDebt: (debt) => set((state) => ({
 debts: [...state.debts, { ...debt, id: generateId() }]
 })),

 payDebt: (id) => set((state) => ({
 debts: state.debts.map(d => d.id === id ? { ...d, status: 'paid' as const } : d)
 })),

 updateSettings: (settings) => set((state) => ({
 settings: { ...state.settings, ...settings }
 })),
 }),
 {
 name: 'auto-pos-storage',
 }
 )
);
