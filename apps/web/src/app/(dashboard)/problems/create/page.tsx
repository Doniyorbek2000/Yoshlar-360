'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

const categories = [
  { value: 'INFRASTRUCTURE', label: 'Infratuzilma' },
  { value: 'SOCIAL', label: 'Ijtimoiy' },
  { value: 'EDUCATION', label: "Ta'lim" },
  { value: 'HEALTHCARE', label: "Sog'liq" },
  { value: 'EMPLOYMENT', label: 'Bandlik' },
  { value: 'ENVIRONMENT', label: 'Atrof-muhit' },
  { value: 'SECURITY', label: 'Xavfsizlik' },
  { value: 'OTHER', label: 'Boshqa' },
];

export default function CreateProblemPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [regions, setRegions] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [form, setForm] = useState({
    title: '', description: '', category: 'OTHER', priority: 'MEDIUM',
    regionId: '', districtId: '', location: '',
  });

  useEffect(() => {
    api.get('/regions').then(res => {
      const r = res.data.data;
      setRegions(Array.isArray(r) ? r : r?.data || []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (form.regionId) {
      api.get(`/regions/${form.regionId}/districts`).then(res => {
        const d = res.data.data;
        setDistricts(Array.isArray(d) ? d : d?.data || []);
      }).catch(() => setDistricts([]));
    } else {
      setDistricts([]);
    }
  }, [form.regionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Sarlavha kiriting'); return; }
    setLoading(true);
    try {
      const payload: any = { ...form };
      if (payload.regionId) payload.regionId = parseInt(payload.regionId);
      else delete payload.regionId;
      if (payload.districtId) payload.districtId = parseInt(payload.districtId);
      else delete payload.districtId;
      if (!payload.location) delete payload.location;
      await api.post('/problems', payload);
      toast.success('Muammo yaratildi');
      router.push('/problems');
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
        <h1 className="text-2xl font-bold text-gray-900">Yangi muammo</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sarlavha *</label>
          <input required value={form.title} onChange={(e) => update('title', e.target.value)}
            placeholder="Muammo sarlavhasi"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tavsif</label>
          <textarea value={form.description} onChange={(e) => update('description', e.target.value)} rows={4}
            placeholder="Muammo tavsifi..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kategoriya</label>
            <select value={form.category} onChange={(e) => update('category', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
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
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Viloyat</label>
            <select value={form.regionId} onChange={(e) => update('regionId', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="">Tanlang</option>
              {regions.map((r: any) => <option key={r.id} value={r.id}>{r.nameUz}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tuman</label>
            <select value={form.districtId} onChange={(e) => update('districtId', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="">Tanlang</option>
              {districts.map((d: any) => <option key={d.id} value={d.id}>{d.nameUz}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Aniq joylashuv</label>
            <input value={form.location} onChange={(e) => update('location', e.target.value)}
              placeholder="Ko'cha, bino..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
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
