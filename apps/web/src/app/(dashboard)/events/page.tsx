'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Calendar, Plus, Pencil, Trash2, MapPin, Users, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  organizer?: { fullName: string };
  participantsCount?: number;
  regionId?: number;
  region?: { nameUz: string };
  status: string;
  createdAt: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');

  const fetchEvents = async () => {
    try {
      const { data } = await api.get('/events');
      setEvents(data.data || []);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/events', { title, description, date, location });
      toast.success('Tadbir qo\'shildi');
      setShowForm(false);
      setTitle('');
      setDescription('');
      setDate('');
      setLocation('');
      fetchEvents();
    } catch {
      toast.error('Xatolik');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('O\'chirmoqchimisiz?')) return;
    try {
      await api.delete(`/events/${id}`);
      toast.success('O\'chirildi');
      fetchEvents();
    } catch {
      toast.error('Xatolik');
    }
  };

  if (loading) return <div className="text-center py-10 text-gray-500">Yuklanmoqda...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Tadbirlar</h1>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" /> Yangi tadbir
        </button>
      </div>

      {showForm && (
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Yangi tadbir</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nomi</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sana</label>
              <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Joylashuv</label>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tavsif</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.map((event) => (
          <div key={event.id} className="bg-white border rounded-lg p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">{event.title}</h3>
                {event.description && <p className="text-sm text-gray-600 mb-3 line-clamp-2">{event.description}</p>}
              </div>
              <button onClick={() => handleDelete(event.id)}
                className="p-1 text-gray-400 hover:text-red-600 rounded ml-2"><Trash2 className="w-4 h-4" /></button>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {event.date ? format(new Date(event.date), 'dd.MM.yyyy HH:mm') : '-'}
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {event.location}
              </div>
              {event.participantsCount !== undefined && (
                <div className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {event.participantsCount} ishtirokchi
                </div>
              )}
              {event.region && (
                <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded">{event.region.nameUz}</span>
              )}
            </div>
          </div>
        ))}
      </div>
      {events.length === 0 && <div className="text-center py-10 text-gray-400">Tadbirlar topilmadi</div>}
    </div>
  );
}
