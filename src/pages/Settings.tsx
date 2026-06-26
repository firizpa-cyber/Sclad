import React from 'react';
import { useState, useEffect } from 'react';
import { Card, Input, Button, AnimatedPage } from '../components/ui';
import { Save, Camera, AlertCircle } from 'lucide-react';

export function Settings() {
  const [formData, setFormData] = useState({
    shopName: 'AutoPOS',
    currency: 'Com',
  });
  const [permStatus, setPermStatus] = useState<string>('default');

  useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'camera' as PermissionName }).then(res => {
        setPermStatus(res.state);
        res.onchange = () => setPermStatus(res.state);
      }).catch(() => {});
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Настройки сохранены');
  };

  const requestCamera = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      setPermStatus('granted');
    } catch (e) {
      setPermStatus('denied');
    }
  };

  return (
    <AnimatedPage className="flex flex-col gap-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Настройки</h1>
        <p className="text-sm text-slate-500 mt-1">Параметры, права доступа</p>
      </div>

      <Card className="p-6 shadow-sm">
        <h2 className="font-bold text-lg text-slate-800 mb-4">Общие настройки</h2>
        <form onSubmit={handleSave} className="flex flex-col gap-5">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Название магазина</label>
            <Input 
              required 
              value={formData.shopName} 
              onChange={e => setFormData({...formData, shopName: e.target.value})} 
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Валюта</label>
            <select 
              className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 text-sm"
              value={formData.currency} 
              onChange={e => setFormData({...formData, currency: e.target.value})}
            >
              <option value="Com">Сомони (com)</option>
              <option value="USD">Доллар ($)</option>
              <option value="RUB">Рубль (�F)</option>
            </select>
          </div>
          
          <div className="pt-4 border-t border-slate-100">
            <Button variant="primary" type="submit" className="gap-2 w-full md:w-auto">
              <Save size={18} />
              Сохранить
            </Button>
          </div>
        </form>
      </Card>

      <Card className="p-6 shadow-sm">
        <h2 className="font-bold text-lg text-slate-800 mb-4">Права доступа</h2>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white rounded-full shadow-sm">
              <Camera size={24} className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Камера (Сканер штрихкодоо)</h3>
              <p className="text-sm text-slate-500 mt-0.5">
                Status: {permStatus === 'granted' ? 'Разрешено' : permStatus === 'denied' ? 'Запрещено' : 'Не запрошено'}
              </p>
            </div>
          </div>
          <Button 
            variant="secondary" 
            onClick={requestCamera} 
            disabled={permStatus === 'granted'}
            className="w-full md:w-auto"
          >
            {permStatus === 'granted' ? 'Доступ есть' : 'Дать доступ'}
          </Button>
        </div>
        {permStatus === 'denied' && (
          <div className="mt-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
            <AlertCircle size={16} />
            Вы запретили доступ к камере. Для работы сканера штрихкодов аппм необходимо изменить решение в настройках браузера.
          </div>
        )}
      </Card>
    </AnimatedPage>
  );
}
