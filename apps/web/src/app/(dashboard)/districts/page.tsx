'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Building2, Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Region { id: number; nameUz: string; }
interface District {
  id: number;
  nameUz: string;
  nameRu: string;
  regionId: number;
  region?: { nameUz: string };
  _count?: { mahallas: number };
}

export default function DistrictsPage() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<District | null>(null);
  const [nameUz, setNameUz] = useState('');
  const [nameRu, setNameRu] = useState('');
  const [regionId, setRegionId] = useState<number>(0);
  const [filterRegion, setFilterRegion] = useState<number>(0);

  const fetchData = async () => {
    try {
      const [d, r] = await Promise.all([api.get('/regions/districts'), api.get('/regions')]);
      setDistricts(d.data.data || []);
      setRegions(r.data.data || []);
    } catch {
      toast.error('Xatolik');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = filterRegion ? districts.filter(d => d.regionId === filterRegion) : districts;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/regions/districts/${editing.id}`, { nameUz, nameRu, regionId });
        toast.success('Tuman yangilandi');
      } else {
        await api.post('/regions/districts', { nameUz, nameRu, regionId });
        toast.success('Tuman qo\'shildi');
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
      await api.delete(`/regions/districts/${id}`);
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
        <h1 className="text-2xl font-bold text-gray-900">Tumanlar</h1>
        <button onClick={() => { setShowForm(true); setEditing(null); setNameUz(''); setNameRu(''); setRegionId(0); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" /> Qo'shish
        </button>
      </div>

      <div className="flex items-center gap-4">
        <select value={filterRegion} onChange={(e) => setFilterRegion(Number(e.target.value))}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option value={0}>Barcha viloyatlar</option>
          {regions.map(r => <option key={r.id} value={r.id}>{r.nameUz}</option>)}
        </select>
        <span className="text-sm text-gray-500">{filtered.length} ta tuman</span>
      </div>

      {showForm && (
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">{editing ? 'Tahrirlash' : 'Yangi tuman'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Viloyat</label>
              <select value={regionId} onChange={(e) => setRegionId(Number(e.target.value))} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2">
                <option value={0}>Tanlang</option>
                {regions.map(r => <option key={r.id} value={r.id}>{r.nameUz}</option>)}
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
            <div className="flex gap-3 md:col-span-3">
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
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Viloyat</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mahallalar</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((d) => (
              <tr key={d.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-500">{d.id}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  <div className="flex items-center gap-2"><Building2 className="w-4 h-4 text-green-500" />{d.nameUz}</div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{d.region?.nameUz || '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{d._count?.mahallas ?? '-'}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => { setEditing(d); setNameUz(d.nameUz); setNameRu(d.nameRu); setRegionId(d.regionId); setShowForm(true); }}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(d.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-10 text-gray-400">Tumanlar topilmadi</div>}
      </div>
    </div>
  );
}
