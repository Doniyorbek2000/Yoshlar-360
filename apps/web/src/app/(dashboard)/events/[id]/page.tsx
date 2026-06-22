'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, Calendar, MapPin, Users, User, Clock, UserPlus, UserMinus, Edit } from 'lucide-react';
import toast from 'react-hot-toast';

const eventTypes: Record<string, string> = {
  SEMINAR: 'Seminar', WORKSHOP: 'Ustaxona', CONFERENCE: 'Konferensiya',
  SPORT: 'Sport', CULTURAL: 'Madaniy', VOLUNTEERING: 'Volontyorlik', OTHER: 'Boshqa',
};

const eventStatuses: Record<string, string> = {
  DRAFT: 'Qoralama', UPCOMING: 'Rejalashtirilgan', ONGOING: 'Davom etmoqda',
  COMPLETED: 'Yakunlangan', CANCELLED: 'Bekor qilingan',
};

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700', UPCOMING: 'bg-blue-100 text-blue-700',
  ONGOING: 'bg-green-100 text-green-700', COMPLETED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function EventDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = ['SUPER_ADMIN', 'REPUBLIC_ADMIN', 'REGION_ADMIN', 'DISTRICT_ADMIN'].includes(user?.role || '');

  useEffect(() => {
    api.get(`/events/${id}`).then(({ data }) => {
      setEvent(data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const updateStatus = async (status: string) => {
    try {
      await api.patch(`/events/${id}/status`, { status });
      setEvent((prev: any) => ({ ...prev, status }));
      toast.success('Holat yangilandi');
    } catch { toast.error('Xatolik'); }
  };

  const handleDelete = async () => {
    if (!confirm('Tadbirni o\'chirmoqchimisiz?')) return;
    try {
      await api.delete(`/events/${id}`);
      toast.success('Tadbir o\'chirildi');
      router.push('/events');
    } catch { toast.error('Xatolik'); }
  };

  if (loading) return <div className="text-center py-10 text-gray-500">Yuklanmoqda...</div>;
  if (!event) return <div className="text-center py-10 text-gray-500">Tadbir topilmadi</div>;

  const participants = event.participants || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
            <span className={`px-2.5 py-1 rounded text-xs font-medium ${statusColors[event.status] || 'bg-gray-100 text-gray-700'}`}>
              {eventStatuses[event.status] || event.status}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">Tadbir #{event.id}</p>
        </div>
        {isAdmin && (
          <button onClick={handleDelete}
            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100">
            O'chirish
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Tavsif</h2>
            <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{event.description || 'Tavsif kiritilmagan'}</p>
          </div>

          {isAdmin && (
            <div className="flex gap-2 flex-wrap">
              {Object.entries(eventStatuses).map(([key, label]) => (
                <button key={key} onClick={() => updateStatus(key)} disabled={event.status === key}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    event.status === key ? 'bg-blue-50 border-blue-300 text-blue-700' : 'hover:bg-gray-50 disabled:opacity-50'
                  }`}>
                  {label}
                </button>
              ))}
            </div>
          )}

          <div className="bg-white rounded-lg border">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-4 h-4" /> Ishtirokchilar ({participants.length}{event.maxParticipants ? ` / ${event.maxParticipants}` : ''})
              </h3>
            </div>
            <div className="p-6">
              {participants.length > 0 ? (
                <div className="space-y-3">
                  {participants.map((p: any) => (
                    <div key={p.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-blue-700">{(p.user?.fullName || '?')[0]}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{p.user?.fullName || '-'}</p>
                        <p className="text-xs text-gray-500">{p.user?.phone || ''}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        p.status === 'ATTENDED' ? 'bg-green-100 text-green-700' :
                        p.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {p.status === 'ATTENDED' ? 'Qatnashdi' : p.status === 'CANCELLED' ? 'Bekor qildi' : 'Ro\'yxatda'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">Hali ishtirokchilar yo'q</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-lg border p-5 space-y-4">
            <h3 className="font-semibold text-gray-900">Ma'lumotlar</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500">Turi:</span>
                <span className="font-medium">{eventTypes[event.type] || event.type}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500">Boshlanishi:</span>
                <span className="font-medium">{event.startDate ? formatDate(event.startDate) : '-'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500">Tugashi:</span>
                <span className="font-medium">{event.endDate ? formatDate(event.endDate) : '-'}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                <span className="text-gray-700">{event.location || '-'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500">Sig'im:</span>
                <span className="font-medium">{event.maxParticipants || 'Cheklanmagan'}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500">Tashkilotchi:</span>
                <span className="font-medium">{event.organizer?.fullName || '-'}</span>
              </div>
              {event.region && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                  <span className="text-gray-700">
                    {[event.region?.nameUz, event.district?.nameUz].filter(Boolean).join(' > ')}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500">Yaratilgan:</span>
                <span className="font-medium">{formatDate(event.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
