import React from 'react';
import { useState } from 'react';
import { Users, Plus, CheckCircle2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Card, Input, Button, AnimatedPage } from '../components/ui';
import { formatCurrency } from '../lib/utils';
new Date().toISOString()

export function Debts() {
  const { debts, addDebt, payDebt } = useStore();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({ clientName: '', phone: '', amount: '', description: '', dueDate: '' });

  const activeDebts = debts.filter(m => m.status === 'active');
  const totalDebt = activeDebts.reduce((acc, d) => acc + d.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addDebt({
      date: new Date().toISOString(),
      status: 'active',
      clientName: formData.clientName,
      phone: formData.phone,
      amount: Number(formData.amount),
      description: formData.description,
      dueDate: formData.dueDate || undefined,
    });
    setIsAddOpen(false);
    setFormData({ clientName: '', phone: '', amount: '', description: '', dueDate: '' });
  };

  return (
    <AnimatedPage className="flex flex-col gap-6 h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Долги</h1>
          <p className="text-sm text-slate-500 mt-1">Управление долгами клиентов</p>
        </div>
        <Button variant="primary" onClick={() => setIsAddOpen(true)} className="gap-2 w-full md:w-auto">
          <Plus size={18} />
          Новый долг
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 shrink-0">
        <Card className="p-6 bg-white flex flex-col justify-center">
          <div className="flex items-center gap-3 text-slate-500 mb-2">
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
              <Users size={20} />
            </div>
            <span className="font-medium">Общая сумма долгов</span>
          </div>
          <div className="text-3xl font-bold tracking-tight text-orange-600">
            {formatCurrency(totalDebt)}
          </div>
          <div className="text-xs text-slate-400 mt-2">{activeDebts.length} активных должников</div>
        </Card>
      </div>

      <Card className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-white flex items-center gap-2">
          <h2 className="font-bold text-slate-800">Активные долги</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-slate-50/50 custom-scrollbar">
          {activeDebts.length === 0 ? (
            <div className="text-center text-slate-400 py-12">
              Нет активных долгов
            </div>
          ) : activeDebts.map(debt => (
            <div key={debt.id} className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex-1">
                <div className="font-bold text-slate-800 text-lg">{debt.clientName}</div>
                <div className="text-sm text-slate-500 font-medium mt-1">Тел: {debt.phone}</div>
                {debt.description && <div className="text-xs mt-2 p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-slate-600">{debt.description}</div>}
              </div>
              <div className="flex flex-col md:items-end gap-1 w-full md:w-auto">
                <div className="text-2xl font-bold text-orange-600">{formatCurrency(debt.amount)}</div>
                {debt.dueDate && <div className="text-xs text-slate-400 font-medium">До: {new Date(debt.dueDate).toLocaleDateString()}</div>}
                <Button  variant="outline" className="mt-3 gap-2 w-full md:w-auto hover:bg-green-50 hover:text-green-600 hover:border-green-200" onClick={() => payDebt(debt.id)}>
                  <CheckCircle2 size={16} />
                  Погасить
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-white p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Новый долг</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Имя клиента</label>
                <Input required value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Телефон</label>
                <Input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Сумма (com)</label>
                <Input type="number" required value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Срок (необязательно)</label>
                <Input type="date" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Комментарий</label>
                <Input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsAddOpen(false)}>Отмена</Button>
                <Button type="submit" variant="primary" className="flex-1">Сохранить</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </AnimatedPage>
  );
}
