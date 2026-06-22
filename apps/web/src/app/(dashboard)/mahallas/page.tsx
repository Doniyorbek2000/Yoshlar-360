'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Home, Plus, Pencil, Trash2, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';

interface Region { id: number; nameUz: string; }
interface District { id: number; nameUz: string; regionId: number; }
interface Mahalla {
  id: number;
  nameUz: string;
  nameRu: string;
  districtId: number;
  district?: { nameUz: string; region?: { nameUz: string } };
  leader?: { fullName: string } | null;
}

export default function MahallasPage() {
  const [mahallas, setMahallas] = useState<Mahalla[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Mahalla | null>(null);
  const [nameUz, setNameUz] = useState('');
  const [nameRu, setNameRu] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<number>(0);
  const [selectedDistrict, setSelectedDistrict] = useState<number>(0);
  const [filterRegion, setFilterRegion] = useState<number>(0);
  const [filterDistrict, setFilterDistrict] = useState<number>(0);

  const fetchData = async () => {
    try {
      const [m, r] = await Promise.all([api.get('/regions/mahallas'), api.get('/regions')]);
      setMahallas(m.data.data || []);
      setRegions(r.data.data || []);
    } catch {
      toast.error('Xatolik');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (selectedRegion) {
      api.get(`/regions/${selectedRegion}/districts`).then(res => setDistricts(res.data.data || []));
    } else {
      setDistricts([]);
    }
  }, [selectedRegion]);

  const filtered = mahallas.filter(m => {
    if (filterRegion && m.district?.region?.nameUz) {
      const regionMatch = regions.find(r => r.id === filterRegion);
      if (regionMatch && m.district?.region?.nameUz !== regionMatch.nameUz) return false;
    }
    if (filterDistrict && m.districtId !== filterDistrict) return false;
    return true;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/regions/mahallas/${editing.id}`, { nameUz, nameRu, districtId: selectedDistrict });
        toast.success('Mahalla yangilandi');
      } else {
        await api.post('/regions/mahallas', { nameUz, nameRu, districtId: selectedDistrict });
        toast.success('Mahalla qo\'shildi');
      }
      setShowForm(false);
      setEditing(null);
      fetchData();
    } catch {
      toast.error('Xatolik');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('O\'chirmoqchimisiz?')) return;
    try {
      await api.delete(`/regions/mahallas/${id}`);
      toast.success('O\'chirildi');
      fetchData();
    } catch {
      toast.error('Xatolik');
    }
  };

  if (loading) return <div className="text-center py-10 text-gray-500">Yuklanmoqda...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Mahallalar</h1>
        <button onClick={() => { setShowForm(true); setEditing(null); setNameUz(''); setNameRu(''); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" /> Qo'shish
        </button>
      </div>

      <div className="flex items-center gap-4">
        <select value={filterRegion} onChange={(e) => { setFilterRegion(Number(e.target.value)); setFilterDistrict(0); }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option value={0}>Barcha viloyatlar</option>
          {regions.map(r => <option key={r.id} value={r.id}>{r.nameUz}</option>)}
        </select>
        <span className="text-sm text-gray-500">{filtered.length} ta mahalla</span>
      </div>

      {showForm && (
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">{editing ? 'Tahrirlash' : 'Yangi mahalla'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Viloyat</label>
              <select value={selectedRegion} onChange={(e) => setSelectedRegion(Number(e.target.value))} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2">
                <option value={0}>Tanlang</option>
                {regions.map(r => <option key={r.id} value={r.id}>{r.nameUz}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tuman</label>
              <select value={selectedDistrict} onChange={(e) => setSelectedDistrict(Number(e.target.value))} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2">
                <option value={0}>Tanlang</option>
                {districts.map(d => <option key={d.id} value={d.id}>{d.nameUz}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nomi (UZ)</label>
              <input type="text" value={nameUz} onChange={(e) => setNameUz(e.target.value)} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nomi (RU)</label>
              <input type="text" value={nameRu} onChange={(e) => setNameRu(e.target.value)} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div className="flex gap-3 md:col-span-2">
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">Saqlash</button>
              <button type="button" onClick={() => setShowForm(false)}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300">Bekor qilish</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nomi</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tuman</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Viloyat</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Yetakchi</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-500">{m.id}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  <div className="flex items-center gap-2"><Home className="w-4 h-4 text-purple-500" />{m.nameUz}</div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{m.district?.nameUz || '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{m.district?.region?.nameUz || '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {m.leader ? (
                    <div className="flex items-center gap-1"><UserCheck className="w-4 h-4 text-green-500" />{m.leader.fullName}</div>
                  ) : <span className="text-gray-400">Biriktirilmagan</span>}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => { setEditing(m); setNameUz(m.nameUz); setNameRu(m.nameRu); setSelectedDistrict(m.districtId); setShowForm(true); }}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(m.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-10 text-gray-400">Mahallalar topilmadi</div>}
      </div>
    </div>
  );
}
