'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

export default function CreateTaskPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [form, setForm] = useState({
    title: '', description: '', priority: 'MEDIUM', assignedToId: '', dueDate: '',
  });

  useEffect(() => {
    api.get('/users', { params: { limit: 100 } }).then(res => {
      const d = res.data.data;
      setUsers(Array.isArray(d) ? d : d?.data || []);
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Sarlavha kiriting'); return; }
    setLoading(true);
    try {
      const payload: any = { ...form };
      if (payload.assignedToId) payload.assignedToId = parseInt(payload.assignedToId);
      else delete payload.assignedToId;
      if (!payload.dueDate) delete payload.dueDate;
      await api.post('/tasks', payload);
      toast.success('Vazifa yaratildi');
      router.push('/tasks');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Xatolik');
    }
    setLoading(false);
  };

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const priorities = [
    { value: 'LOW', label: 'Past', color: 'bg-gray-100 text-gray-700' },
    { value: 'MEDIUM', label: "O'rta", color: 'bg-blue-100 text-blue-700' },
    { value: 'HIGH', label: 'Yuqori', color: 'bg-orange-100 text-orange-700' },
    { value: 'URGENT', label: 'Shoshilinch', color: 'bg-red-100 text-red-700' },
  ];

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Yangi vazifa</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sarlavha *</label>
          <input required value={form.title} onChange={(e) => update('title', e.target.value)}
            placeholder="Vazifa sarlavhasi"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tavsif</label>
          <textarea value={form.description} onChange={(e) => update('description', e.target.value)} rows={4}
            placeholder="Vazifa tavsifi..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Muhimlik</label>
            <div className="flex gap-2">
              {priorities.map(p => (
                <button key={p.value} type="button" onClick={() => update('priority', p.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    form.priority === p.value ? p.color + ' ring-2 ring-offset-1' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}>{p.label}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Muddat</label>
            <input type="date" value={form.dueDate} onChange={(e) => update('dueDate', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mas'ul xodim</label>
          <select value={form.assignedToId} onChange={(e) => update('assignedToId', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="">Tanlang</option>
            {users.map((u: any) => <option key={u.id} value={u.id}>{u.fullName}</option>)}
          </select>
        </div>
        <div className="flex gap-3 pt-4 border-t">
          <button type="submit" disabled={loading}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Yaratilmoqda...' : 'Yaratish'}
          </button>
          <button type="button" onClick={() => router.back()}
            className="px-6 py-2.5 border rounded-lg text-sm font-medium hover:bg-gray-50">Bekor qilish</button>
        </div>
      </form>
    </div>
  );
}
