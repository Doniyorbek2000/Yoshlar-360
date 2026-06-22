'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Region { id: number; nameUz: string; }
interface District { id: number; nameUz: string; }

const eventTypes = [
  { value: 'SEMINAR', label: 'Seminar' },
  { value: 'WORKSHOP', label: 'Ustaxona' },
  { value: 'CONFERENCE', label: 'Konferensiya' },
  { value: 'SPORT', label: 'Sport' },
  { value: 'CULTURAL', label: 'Madaniy' },
  { value: 'VOLUNTEERING', label: 'Volontyorlik' },
  { value: 'OTHER', label: 'Boshqa' },
];

export default function CreateEventPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('OTHER');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [location, setLocation] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [regionId, setRegionId] = useState<number>(0);
  const [districtId, setDistrictId] = useState<number>(0);
  const [regions, setRegions] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/regions').then(res => setRegions(res.data.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (regionId) {
      api.get(`/regions/${regionId}/districts`).then(res => setDistricts(res.data.data || [])).catch(() => {});
    } else {
      setDistricts([]);
      setDistrictId(0);
    }
  }, [regionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startDate || !endDate || !location.trim()) {
      toast.error('Barcha majburiy maydonlarni to\'ldiring');
      return;
    }
    if (new Date(endDate) <= new Date(startDate)) {
      toast.error('Tugash sanasi boshlanish sanasidan keyin bo\'lishi kerak');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/events', {
        title: title.trim(),
        description: description.trim(),
        type,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        location: location.trim(),
        ...(maxParticipants && { maxParticipants: parseInt(maxParticipants) }),
        ...(regionId && { regionId }),
        ...(districtId && { districtId }),
      });
      toast.success('Tadbir yaratildi');
      router.push('/events');
    } catch {
      toast.error('Tadbir yaratishda xatolik');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Yangi tadbir</h1>

      <form onSubmit={handleSubmit} className="bg-white border rounded-lg p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nomi *</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required
            placeholder="Tadbir nomi"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tavsif</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4}
            placeholder="Tadbir haqida batafsil ma'lumot..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Turi</label>
            <select value={type} onChange={(e) => setType(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2">
              {eventTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max ishtirokchilar</label>
            <input type="number" value={maxParticipants} onChange={(e) => setMaxParticipants(e.target.value)}
              placeholder="Cheklanmagan" min={1}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Boshlanish sanasi *</label>
            <input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tugash sanasi *</label>
            <input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Joylashuv *</label>
          <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} required
            placeholder="Manzil yoki joy nomi"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <button type="submit" disabled={submitting}
            className="bg-blue-600 text-white px-8 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium">
            {submitting ? 'Yaratilmoqda...' : 'Yaratish'}
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
