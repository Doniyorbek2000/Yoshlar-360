'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { formatDate } from '@/lib/utils';
import { Bell, Check, CheckCheck, Send, Users, Globe, MapPin, Filter, Plus, Megaphone } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'inbox' | 'broadcast'>('inbox');
  const [typeFilter, setTypeFilter] = useState('');

  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    message: '',
    targetType: 'ALL',
    targetRole: '',
    targetRegionId: '',
    sendTelegram: false,
    sendEmail: false,
  });
  const [sending, setSending] = useState(false);
  const [regions, setRegions] = useState<any[]>([]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (typeFilter) params.type = typeFilter;
      const { data } = await api.get('/notifications', { params });
      const d = data.data;
      setNotifications(Array.isArray(d) ? d : d?.data || []);
    } catch { setNotifications([]); }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
    api.get('/regions').then(res => {
      const r = res.data.data;
      setRegions(Array.isArray(r) ? r : r?.data || []);
    }).catch(() => {});
  }, [typeFilter]);

  const markAsRead = async (id: number) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)));
    } catch {}
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success("Barcha bildirishnomalar o'qildi");
    } catch {}
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post('/notifications/broadcast', broadcastForm);
      toast.success('Bildirishnoma yuborildi');
      setBroadcastForm({ title: '', message: '', targetType: 'ALL', targetRole: '', targetRegionId: '', sendTelegram: false, sendEmail: false });
    } catch {
      toast.error('Yuborishda xatolik');
    }
    setSending(false);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'REPUBLIC_ADMIN' || user?.role === 'REGION_ADMIN';

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'APPEAL': return <Bell className="w-5 h-5 text-blue-500" />;
      case 'TASK': return <Bell className="w-5 h-5 text-purple-500" />;
      case 'SYSTEM': return <Bell className="w-5 h-5 text-orange-500" />;
      case 'BROADCAST': return <Megaphone className="w-5 h-5 text-green-500" />;
      default: return <Bell className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bildirishnomalar</h1>
          <p className="text-sm text-gray-500 mt-1">
            {unreadCount > 0 ? `${unreadCount} ta o'qilmagan` : "Barcha o'qilgan"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button onClick={markAllAsRead}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
              <CheckCheck className="w-4 h-4" /> Barchasini o'qish
            </button>
          )}
        </div>
      </div>

      {isAdmin && (
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
          <button onClick={() => setActiveTab('inbox')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'inbox' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4" /> Kiruvchi
              {unreadCount > 0 && <span className="bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">{unreadCount > 9 ? '9+' : unreadCount}</span>}
            </div>
          </button>
          <button onClick={() => setActiveTab('broadcast')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'broadcast' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4" /> Yuborish
            </div>
          </button>
        </div>
      )}

      {activeTab === 'inbox' && (
        <>
          <div className="flex gap-3">
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm">
              <option value="">Barcha turlar</option>
              <option value="APPEAL">Murojaat</option>
              <option value="TASK">Vazifa</option>
              <option value="SYSTEM">Tizim</option>
              <option value="BROADCAST">Ommaviy</option>
            </select>
          </div>

          {loading ? (
            <div className="text-center py-10 text-gray-500">Yuklanmoqda...</div>
          ) : notifications.length === 0 ? (
            <div className="bg-white rounded-lg border p-8 text-center">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Bildirishnomalar yo'q</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map(n => (
                <div key={n.id}
                  className={`bg-white rounded-lg border p-4 flex items-start justify-between transition-colors hover:bg-gray-50 ${!n.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''}`}>
                  <div className="flex items-start gap-3">
                    {getNotificationIcon(n.type)}
                    <div>
                      <p className={`text-sm ${n.isRead ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>{n.title}</p>
                      <p className="text-sm text-gray-500 mt-1">{n.message}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <p className="text-xs text-gray-400">{formatDate(n.createdAt)}</p>
                        {n.type && <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">{n.type}</span>}
                      </div>
                    </div>
                  </div>
                  {!n.isRead && (
                    <button onClick={() => markAsRead(n.id)} className="p-1.5 text-gray-400 hover:text-blue-600 shrink-0" title="O'qildi">
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'broadcast' && (
        <div className="bg-white rounded-lg border p-6 max-w-2xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-blue-500" /> Ommaviy bildirishnoma yuborish
          </h3>
          <form onSubmit={handleBroadcast} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sarlavha</label>
              <input type="text" value={broadcastForm.title} onChange={(e) => setBroadcastForm(p => ({ ...p, title: e.target.value }))}
                required className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Bildirishnoma sarlavhasi" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Xabar</label>
              <textarea value={broadcastForm.message} onChange={(e) => setBroadcastForm(p => ({ ...p, message: e.target.value }))}
                required rows={4} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Xabar matni..." />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Maqsad</label>
                <select value={broadcastForm.targetType} onChange={(e) => setBroadcastForm(p => ({ ...p, targetType: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm">
                  <option value="ALL">Barcha foydalanuvchilar</option>
                  <option value="ROLE">Rol bo'yicha</option>
                  <option value="REGION">Hudud bo'yicha</option>
                </select>
              </div>
              {broadcastForm.targetType === 'ROLE' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                  <select value={broadcastForm.targetRole} onChange={(e) => setBroadcastForm(p => ({ ...p, targetRole: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm">
                    <option value="">Tanlang</option>
                    <option value="REGION_ADMIN">Viloyat Admin</option>
                    <option value="DISTRICT_ADMIN">Tuman Admin</option>
                    <option value="MAHALLA_LEADER">Mahalla yetakchisi</option>
                    <option value="YOUTH">Yoshlar</option>
                    <option value="MODERATOR">Moderator</option>
                  </select>
                </div>
              )}
              {broadcastForm.targetType === 'REGION' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Viloyat</label>
                  <select value={broadcastForm.targetRegionId} onChange={(e) => setBroadcastForm(p => ({ ...p, targetRegionId: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm">
                    <option value="">Tanlang</option>
                    {regions.map((r: any) => <option key={r.id} value={r.id}>{r.nameUz}</option>)}
                  </select>
                </div>
              )}
            </div>
            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={broadcastForm.sendTelegram}
                  onChange={(e) => setBroadcastForm(p => ({ ...p, sendTelegram: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 rounded" />
                <span className="text-sm text-gray-700">Telegramga ham yuborish</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={broadcastForm.sendEmail}
                  onChange={(e) => setBroadcastForm(p => ({ ...p, sendEmail: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 rounded" />
                <span className="text-sm text-gray-700">Emailga ham yuborish</span>
              </label>
            </div>
            <button type="submit" disabled={sending}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              <Send className="w-4 h-4" /> {sending ? 'Yuborilmoqda...' : 'Yuborish'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
