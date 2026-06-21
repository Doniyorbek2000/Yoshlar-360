'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import StatusBadge from '@/components/ui/StatusBadge';
import PriorityBadge from '@/components/ui/PriorityBadge';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AppealDetailPage() {
  const { id } = useParams();
  const [appeal, setAppeal] = useState<any>(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/appeals/${id}`).then(({ data }) => {
      setAppeal(data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const addComment = async () => {
    if (!comment.trim()) return;
    try {
      const { data } = await api.post(`/appeals/${id}/comments`, { text: comment });
      setAppeal((prev: any) => ({ ...prev, comments: [...prev.comments, data.data] }));
      setComment('');
      toast.success("Izoh qo'shildi");
    } catch { toast.error('Xatolik'); }
  };

  const updateStatus = async (status: string) => {
    try {
      await api.put(`/appeals/${id}/status`, { status });
      setAppeal((prev: any) => ({ ...prev, status }));
      toast.success("Status o'zgartirildi");
    } catch { toast.error('Xatolik'); }
  };

  if (loading) return <div className="text-center py-10 text-gray-500">Yuklanmoqda...</div>;
  if (!appeal) return <div className="text-center py-10 text-gray-500">Murojaat topilmadi</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Murojaat #{appeal.id}</h1>
          <p className="text-gray-500 mt-1">{formatDate(appeal.createdAt)}</p>
        </div>
        <div className="flex gap-2">
          <StatusBadge status={appeal.status} />
          <PriorityBadge priority={appeal.priority} />
        </div>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900">{appeal.title}</h2>
        <p className="text-gray-600 mt-3 whitespace-pre-wrap">{appeal.description}</p>
        <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t text-sm">
          <div><span className="text-gray-500">Kategoriya:</span> <span className="font-medium ml-2">{appeal.category}</span></div>
          <div><span className="text-gray-500">Murojaat qiluvchi:</span> <span className="font-medium ml-2">{appeal.youth?.fullName}</span></div>
          <div><span className="text-gray-500">Mas'ul:</span> <span className="font-medium ml-2">{appeal.assignedTo?.fullName || 'Biriktirilmagan'}</span></div>
          <div><span className="text-gray-500">Hudud:</span> <span className="font-medium ml-2">{[appeal.region?.nameUz, appeal.district?.nameUz, appeal.mahalla?.nameUz].filter(Boolean).join(' > ') || '-'}</span></div>
        </div>
      </div>

      <div className="flex gap-2">
        {['NEW', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', 'CLOSED'].map((s) => (
          <button key={s} onClick={() => updateStatus(s)} disabled={appeal.status === s}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${appeal.status === s ? 'bg-primary-50 border-primary-300 text-primary-700' : 'hover:bg-gray-50'}`}>
            {s === 'NEW' ? 'Yangi' : s === 'IN_PROGRESS' ? 'Jarayonda' : s === 'RESOLVED' ? 'Hal qilindi' : s === 'REJECTED' ? 'Rad etildi' : 'Yopildi'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Izohlar ({appeal.comments?.length || 0})</h3>
        <div className="space-y-4 mb-6">
          {appeal.comments?.map((c: any) => (
            <div key={c.id} className="border-l-2 border-gray-200 pl-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">{c.user?.fullName}</span>
                <span className="text-xs text-gray-400">{formatDate(c.createdAt)}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{c.text}</p>
            </div>
          ))}
          {(!appeal.comments || appeal.comments.length === 0) && (
            <p className="text-sm text-gray-500">Hali izohlar yo'q</p>
          )}
        </div>
        <div className="flex gap-2">
          <input type="text" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Izoh yozing..."
            className="flex-1 px-4 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
            onKeyDown={(e) => e.key === 'Enter' && addComment()} />
          <button onClick={addComment} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">
            Yuborish
          </button>
        </div>
      </div>
    </div>
  );
}
