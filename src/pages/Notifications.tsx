import { useStore } from '../store/useStore';
import { Card, Button, AnimatedPage } from '../components/ui';
import { Bell, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export function Notifications() {
  const { notifications, markNotificationRead, markAllNotificationsRead, clearNotifications } = useStore();

  return (
    <AnimatedPage className="flex flex-col gap-6 h-full bg-slate-50">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Уведомления</h1>
          <p className="text-sm text-slate-500 mt-1">Все системные сообщения</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={markAllNotificationsRead} className="flex-1 md:flex-none gap-2">
            <CheckCircle2 size={16} />
            <span className="hidden sm:inline">Прочитать все</span>
          </Button>
          <Button variant="ghost" onClick={clearNotifications} className="flex-1 md:flex-none text-slate-500 hover:text-red-500 gap-2">
            Очистить
          </Button>
        </div>
      </div>

      <Card className="flex-1 overflow-y-auto custommscrollbar bg-white border-slate-200/60">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full col gap-4 text-slate-400 py-20">
            <Bell size={48} strokeWidth={1} />
            <p className="font-medium">У вас нет уведомлений</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map(notif => (
              <div 
                key={notif.id} 
                className={`p-5 transition-all duration-300 flex gap-4 items-start ${!notif.read ? 'bg-blue-50/30 pl-4 border-l-4 border-l-blue-500' : 'bg-white'}`}
              >
                <div className={`p-2 rounded-full ${notif.type === 'alert' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                  {notif.type === 'alert' ? <AlertTriangle size={20} /> : <Info size={20} />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`font-bold ${!notif.read ? 'text-slate-800' : 'text-slate-600'}`}>{notif.title}</h3>
                    <span className="text-xs text-slate-400">{new Date(notif.date).toLocaleDateString()}</span>
                  </div>
                  <p className={`text-sm ${!notif.read ? 'text-slate-600' : 'text-slate-500'}`}>{notif.message}</p>
                  {(!notif.read) && <button onClick={() => markNotificationRead(notif.id)} className="text-blue-600 text-xs font-bold mt-2 uppercase tracking-wider hover:underline">Прочитать</button>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </AnimatedPage>
  );
}
