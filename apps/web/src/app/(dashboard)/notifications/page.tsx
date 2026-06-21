'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Bell, Check, CheckCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markAsRead = async (id: number) => {
    await api.put(`/notifications/${id}/read`);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllAsRead = async () => {
    await api.put('/notifications/read-all');
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    toast.success("Barcha bildirishnomalar o'qildi");
  };

  if (loading) return <div className="text-center py-10 text-gray-500">Yuklanmoqda...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Bildirishnomalar</h1>
        <button onClick={markAllAsRead} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">
          <CheckCheck className="w-4 h-4" /> Barchasini o'qildi
        </button>
      </div>
      {notifications.length === 0 ? (
        <div className="bg-white rounded-lg border p-8 text-center text-gray-500">Bildirishnomalar yo'q</div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div key={n.id} className={`bg-white rounded-lg border p-4 flex items-start justify-between ${!n.isRead ? 'border-l-4 border-l-primary-500' : ''}`}>
              <div className="flex items-start gap-3">
                <Bell className={`w-5 h-5 mt-0.5 ${n.isRead ? 'text-gray-400' : 'text-primary-600'}`} />
                <div>
                  <p className={`text-sm ${n.isRead ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>{n.title}</p>
                  <p className="text-sm text-gray-500 mt-1">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-2">{formatDate(n.createdAt)}</p>
                </div>
              </div>
              {!n.isRead && (
                <button onClick={() => markAsRead(n.id)} className="p-1.5 text-gray-400 hover:text-primary-600">
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
