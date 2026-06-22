'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { MapPin, Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface Region {
  id: number;
  nameUz: string;
  nameRu: string;
  isActive?: boolean;
  _count?: { districts: number; users: number };
}

export default function RegionsPage() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Region | null>(null);
  const [nameUz, setNameUz] = useState('');
  const [nameRu, setNameRu] = useState('');

  const fetchRegions = async () => {
    try {
      const { data } = await api.get('/regions');
      setRegions(data.data || []);
    } catch {
      toast.error('Viloyatlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRegions(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/regions/${editing.id}`, { nameUz, nameRu });
        toast.success('Viloyat yangilandi');
      } else {
        await api.post('/regions', { nameUz, nameRu });
        toast.success('Viloyat qo\'shildi');
      }
      setShowForm(false);
      setEditing(null);
      setNameUz('');
      setNameRu('');
      fetchRegions();
    } catch {
      toast.error('Xatolik yuz berdi');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('O\'chirmoqchimisiz?')) return;
    try {
      await api.delete(`/regions/${id}`);
      toast.success('O\'chirildi');
      fetchRegions();
    } catch {
      toast.error('O\'chirishda xatolik');
    }
  };

  const startEdit = (r: Region) => {
    setEditing(r);
    setNameUz(r.nameUz);
    setNameRu(r.nameRu);
    setShowForm(true);
  };

  if (loading) return <div className="text-center py-10 text-gray-500">Yuklanmoqda...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Viloyatlar</h1>
        <button onClick={() => { setShowForm(true); setEditing(null); setNameUz(''); setNameRu(''); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" /> Qo'shish
        </button>
      </div>

      {showForm && (
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">{editing ? 'Tahrirlash' : 'Yangi viloyat'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nomi (O&apos;zbek)</label>
              <input type="text" value={nameUz} onChange={(e) => setNameUz(e.target.value)} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nomi (Русский)</label>
              <input type="text" value={nameRu} onChange={(e) => setNameRu(e.target.value)} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div className="flex gap-3 md:col-span-2">
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">Saqlash</button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); }}
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
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nomi (UZ)</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nomi (RU)</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tumanlar</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {regions.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-500">{r.id}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    {r.nameUz}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{r.nameRu}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{r._count?.districts ?? '-'}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => startEdit(r)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(r.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {regions.length === 0 && (
          <div className="text-center py-10 text-gray-400">Viloyatlar topilmadi</div>
        )}
      </div>
    </div>
  );
}
