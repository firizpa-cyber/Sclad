import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
 return twMerge(clsx(inputs));
}

export function exportToCSV(data: any[], filename: string) {
 if (data.length === 0) return;
 const keys = Object.keys(data[0]);
 const csvContent = [
 keys.join(','),
 ...data.map(row => keys.map(k => `"${String(row[k] || '').replace(/"/g, '""')}"`).join(','))
 ].join('\n');
 const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
 const link = document.createElement('a');
 link.href = URL.createObjectURL(blob);
 link.download = filename;
 link.click();
}

export const formatCurrency = (amount: number) => {
 return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 }).format(amount);
};
