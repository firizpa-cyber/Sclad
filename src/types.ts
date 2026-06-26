export type Location = 'khona' | 'main' | 'shop';

export interface Product {
 id: string;
 name: string;
 brand: string;
 model: string;
 buyPrice: number;
 sellPrice: number;
  barcode?: string;
 stock: {
 khona: number;
 main: number;
 shop: number;
 };
 minStock: number;
}

export interface CartItem {
 product: Product;
 quantity: number;
 location: Location;
}

export interface Transaction {
 id: string;
 type: 'sale' | 'return' | 'move';
 date: string;
 items: { productId: string; name: string; quantity: number; price: number; buyPrice: number }[];
 totalAmount: number;
 totalProfit: number;
 from?: Location;
 to?: Location;
}

export interface Debt {
 id: string;
 clientName: string;
 phone: string;
 amount: number;
 date: string;
 dueDate: string;
 status: 'active' | 'paid';
 description: string;
}

export interface Settings {
 telegramBotToken: string;
 telegramChatId: string;
}

export interface AppNotification {
 id: string;
 title: string;
 message: string;
 date: string;
 read: boolean;
 type: 'alert' | 'info';
}
