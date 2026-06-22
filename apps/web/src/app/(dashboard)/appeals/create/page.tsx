'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import toast from 'react-hot-toast';

interface Region { id: number; nameUz: string; }
interface District { id: number; nameUz: string; }
interface Mahalla { id: number; nameUz: string; }

const categories = [
  { value: 'EMPLOYMENT', label: 'Bandlik' },
  { value: 'EDUCATION', label: 'Ta\'lim' },
  { value: 'HOUSING', label: 'Uy-joy' },
  { value: 'HEALTHCARE', label: 'Sog\'liqni saqlash' },
  { value: 'SOCIAL', label: 'Ijtimoiy' },
  { value: 'LEGAL', label: 'Huquqiy' },
  { value: 'OTHER', label: 'Boshqa' },
];

const priorities = [
  { value: 'LOW', label: 'Past', color: 'bg-green-100 text-green-700' },
  { value: 'MEDIUM', label: 'O\'rta', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'HIGH', label: 'Yuqori', color: 'bg-orange-100 text-orange-700' },
  { value: 'URGENT', label: 'Shoshilinch', color: 'bg-red-100 text-red-700' },
];

export default function CreateAppealPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('OTHER');
  const [priority, setPriority] = useState('MEDIUM');
  const [regionId, setRegionId] = useState<number>(user?.regionId || 0);
  const [districtId, setDistrictId] = useState<number>(user?.districtId || 0);
  const [mahallaId, setMahallaId] = useState<number>(user?.mahallaId || 0);
  const [regions, setRegions] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [mahallas, setMahallas] = useState<Mahalla[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/regions').then(res => setRegions(res.data.data || []));
  }, []);

  useEffect(() => {
    if (regionId) {
      api.get(`/regions/${regionId}/districts`).then(res => setDistricts(res.data.data || []));
    } else {
      setDistricts([]);
      setDistrictId(0);
    }
  }, [regionId]);

  useEffect(() => {
    if (districtId) {
      api.get(`/regions/districts/${districtId}/mahallas`).then(res => setMahallas(res.data.data || []));
    } else {
      setMahallas([]);
      setMahallaId(0);
    }
  }, [districtId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error('Sarlavha va tavsifni kiriting');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/appeals', {
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        ...(regionId && { regionId }),
        ...(districtId && { districtId }),
        ...(mahallaId && { mahallaId }),
      });
      toast.success('Murojaat yuborildi');
      router.push('/appeals');
    } catch {
      toast.error('Xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Yangi murojaat</h1>

      <form onSubmit={handleSubmit} className="bg-white border rounded-lg p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sarlavha *</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required
            placeholder="Murojaat sarlavhasi"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tavsif *</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} required
            placeholder="Murojaat tavsifini batafsil yozing..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kategoriya</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2">
              {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Muhimlik</label>
            <div className="flex gap-2">
              {priorities.map(p => (
                <button key={p.value} type="button"
                  onClick={() => setPriority(p.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    priority === p.value ? p.color + ' ring-2 ring-offset-1' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Viloyat</label>
            <select value={regionId} onChange={(e) => setRegionId(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2">
              <option value={0}>Tanlang</option>
              {regions.map(r => <option key={r.id} value={r.id}>{r.nameUz}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tuman</label>
            <select value={districtId} onChange={(e) => setDistrictId(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2">
              <option value={0}>Tanlang</option>
              {districts.map(d => <option key={d.id} value={d.id}>{d.nameUz}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mahalla</label>
            <select value={mahallaId} onChange={(e) => setMahallaId(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2">
              <option value={0}>Tanlang</option>
              {mahallas.map(m => <option key={m.id} value={m.id}>{m.nameUz}</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <button type="submit" disabled={submitting}
            className="bg-blue-600 text-white px-8 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium">
            {submitting ? 'Yuborilmoqda...' : 'Yuborish'}
          </button>
          <button type="button" onClick={() => router.back()}
            className="bg-gray-200 text-gray-700 px-8 py-2.5 rounded-lg hover:bg-gray-300 font-medium">
            Bekor qilish
          </button>
        </div>
      </form>
    </div>
  );
}
