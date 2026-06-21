'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function CreateYouthPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [regions, setRegions] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [mahallas, setMahallas] = useState<any[]>([]);
  const [form, setForm] = useState({
    fullName: '', phone: '', email: '', birthDate: '', gender: '',
    passportOrPinfl: '', education: '', employmentStatus: '', socialStatus: '',
    address: '', interests: '', riskLevel: 'LOW', regionId: '', districtId: '', mahallaId: '',
  });

  useEffect(() => { api.get('/regions').then(({ data }) => setRegions(data.data)); }, []);

  useEffect(() => {
    if (form.regionId) api.get(`/regions/${form.regionId}/districts`).then(({ data }) => setDistricts(data.data));
    else setDistricts([]);
  }, [form.regionId]);

  useEffect(() => {
    if (form.districtId) api.get(`/regions/districts/${form.districtId}/mahallas`).then(({ data }) => setMahallas(data.data));
    else setMahallas([]);
  }, [form.districtId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: any = { ...form };
      if (payload.regionId) payload.regionId = parseInt(payload.regionId);
      if (payload.districtId) payload.districtId = parseInt(payload.districtId);
      if (payload.mahallaId) payload.mahallaId = parseInt(payload.mahallaId);
      Object.keys(payload).forEach((k) => { if (payload[k] === '') delete payload[k]; });
      await api.post('/youth', payload);
      toast.success('Yosh profili yaratildi');
      router.push('/youth');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Xatolik');
    }
    setLoading(false);
  };

  const inputClass = "w-full px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500";
  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Yangi yosh yaratish</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg border p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">F.I.O. *</label>
            <input required value={form.fullName} onChange={(e) => update('fullName', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
            <input value={form.phone} onChange={(e) => update('phone', e.target.value)} className={inputClass} placeholder="+998..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tug'ilgan sana</label>
            <input type="date" value={form.birthDate} onChange={(e) => update('birthDate', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jinsi</label>
            <select value={form.gender} onChange={(e) => update('gender', e.target.value)} className={inputClass}>
              <option value="">Tanlang</option>
              <option value="MALE">Erkak</option>
              <option value="FEMALE">Ayol</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pasport / PINFL</label>
            <input value={form.passportOrPinfl} onChange={(e) => update('passportOrPinfl', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ta'lim</label>
            <select value={form.education} onChange={(e) => update('education', e.target.value)} className={inputClass}>
              <option value="">Tanlang</option>
              <option value="NONE">Yo'q</option>
              <option value="SECONDARY">O'rta</option>
              <option value="VOCATIONAL">O'rta maxsus</option>
              <option value="HIGHER">Oliy</option>
              <option value="MASTERS">Magistr</option>
              <option value="PHD">PhD</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bandlik holati</label>
            <select value={form.employmentStatus} onChange={(e) => update('employmentStatus', e.target.value)} className={inputClass}>
              <option value="">Tanlang</option>
              <option value="EMPLOYED">Ishchi</option>
              <option value="UNEMPLOYED">Ishsiz</option>
              <option value="STUDENT">Talaba</option>
              <option value="SELF_EMPLOYED">Tadbirkor</option>
              <option value="OTHER">Boshqa</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ijtimoiy holat</label>
            <select value={form.socialStatus} onChange={(e) => update('socialStatus', e.target.value)} className={inputClass}>
              <option value="">Tanlang</option>
              <option value="NORMAL">Oddiy</option>
              <option value="ORPHAN">Yetim</option>
              <option value="DISABLED">Nogironligi bor</option>
              <option value="LOW_INCOME">Kam ta'minlangan</option>
              <option value="SINGLE_PARENT">Yakka ota-ona</option>
              <option value="OTHER">Boshqa</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Viloyat</label>
            <select value={form.regionId} onChange={(e) => update('regionId', e.target.value)} className={inputClass}>
              <option value="">Tanlang</option>
              {regions.map((r: any) => <option key={r.id} value={r.id}>{r.nameUz}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tuman</label>
            <select value={form.districtId} onChange={(e) => update('districtId', e.target.value)} className={inputClass}>
              <option value="">Tanlang</option>
              {districts.map((d: any) => <option key={d.id} value={d.id}>{d.nameUz}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mahalla</label>
            <select value={form.mahallaId} onChange={(e) => update('mahallaId', e.target.value)} className={inputClass}>
              <option value="">Tanlang</option>
              {mahallas.map((m: any) => <option key={m.id} value={m.id}>{m.nameUz}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Risk darajasi</label>
            <select value={form.riskLevel} onChange={(e) => update('riskLevel', e.target.value)} className={inputClass}>
              <option value="LOW">Past</option>
              <option value="MEDIUM">O'rta</option>
              <option value="HIGH">Yuqori</option>
              <option value="CRITICAL">Juda yuqori</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Manzil</label>
          <input value={form.address} onChange={(e) => update('address', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Qiziqishlari</label>
          <input value={form.interests} onChange={(e) => update('interests', e.target.value)} className={inputClass} />
        </div>
        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={loading} className="px-6 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50">
            {loading ? 'Saqlanmoqda...' : 'Saqlash'}
          </button>
          <button type="button" onClick={() => router.back()} className="px-6 py-2.5 border rounded-lg text-sm font-medium hover:bg-gray-50">
            Bekor qilish
          </button>
        </div>
      </form>
    </div>
  );
}
