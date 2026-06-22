'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import StatusBadge from '@/components/ui/StatusBadge';
import PriorityBadge from '@/components/ui/PriorityBadge';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, MapPin, Send, Image } from 'lucide-react';
import toast from 'react-hot-toast';

const categoryLabels: Record<string, string> = {
  INFRASTRUCTURE: 'Infratuzilma', SOCIAL: 'Ijtimoiy', EDUCATION: "Ta'lim", HEALTHCARE: "Sog'liq",
  EMPLOYMENT: 'Bandlik', ENVIRONMENT: 'Atrof-muhit', SECURITY: 'Xavfsizlik', OTHER: 'Boshqa',
};

export default function ProblemDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [problem, setProblem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');

  useEffect(() => {
    api.get(`/problems/${id}`).then(({ data }) => {
      setProblem(data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const updateStatus = async (status: string) => {
    try {
      await api.put(`/problems/${id}`, { status });
      setProblem((prev: any) => ({ ...prev, status }));
      toast.success("Status yangilandi");
    } catch { toast.error('Xatolik'); }
  };

  const addComment = async () => {
    if (!comment.trim()) return;
    try {
      const { data } = await api.post(`/problems/${id}/comments`, { text: comment });
      setProblem((prev: any) => ({ ...prev, comments: [...(prev.comments || []), data.data] }));
      setComment('');
      toast.success("Izoh qo'shildi");
    } catch { toast.error('Xatolik'); }
  };

  if (loading) return <div className="text-center py-10 text-gray-500">Yuklanmoqda...</div>;
  if (!problem) return <div className="text-center py-10 text-gray-500">Muammo topilmadi</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Muammo #{problem.id}</h1>
            <StatusBadge status={problem.status} />
            <PriorityBadge priority={problem.priority} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold text-gray-900">{problem.title}</h2>
            <p className="text-gray-600 mt-3 whitespace-pre-wrap">{problem.description}</p>
          </div>

          {problem.images?.length > 0 && (
            <div className="bg-white rounded-lg border p-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Image className="w-4 h-4" /> Rasmlar ({problem.images.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {problem.images.map((img: any, i: number) => (
                  <a key={i} href={img.url || img} target="_blank" rel="noopener noreferrer"
                    className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <img src={img.url || img} alt={`Rasm ${i + 1}`} className="w-full h-full object-cover" />
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(s => (
              <button key={s} onClick={() => updateStatus(s)} disabled={problem.status === s}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  problem.status === s ? 'bg-blue-50 border-blue-300 text-blue-700' : 'hover:bg-gray-50'
                }`}>
                {s === 'OPEN' ? 'Ochiq' : s === 'IN_PROGRESS' ? 'Jarayonda' : s === 'RESOLVED' ? 'Hal qilindi' : 'Yopildi'}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-lg border p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Izohlar ({problem.comments?.length || 0})</h3>
            <div className="space-y-4 mb-4">
              {problem.comments?.map((c: any) => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-blue-700">{c.user?.fullName?.[0] || '?'}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{c.user?.fullName}</span>
                      <span className="text-xs text-gray-400">{formatDate(c.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{c.text}</p>
                  </div>
                </div>
              ))}
              {(!problem.comments || problem.comments.length === 0) && (
                <p className="text-sm text-gray-500 text-center">Izohlar yo'q</p>
              )}
            </div>
            <div className="flex gap-2 pt-4 border-t">
              <input type="text" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Izoh yozing..."
                className="flex-1 px-4 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => e.key === 'Enter' && addComment()} />
              <button onClick={addComment} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-lg border p-5 space-y-3">
            <h3 className="font-semibold text-gray-900">Ma'lumotlar</h3>
            <div className="space-y-3 text-sm">
              <div><span className="text-gray-500">Kategoriya:</span> <span className="ml-2 font-medium">{categoryLabels[problem.category] || problem.category}</span></div>
              <div><span className="text-gray-500">Xabar beruvchi:</span> <span className="ml-2 font-medium">{problem.reportedBy?.fullName || '-'}</span></div>
              <div><span className="text-gray-500">Mas'ul:</span> <span className="ml-2 font-medium">{problem.assignedTo?.fullName || '-'}</span></div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <span className="text-gray-700">
                  {[problem.region?.nameUz, problem.district?.nameUz].filter(Boolean).join(', ') || '-'}
                  {problem.location && <span className="block text-gray-500 text-xs mt-0.5">{problem.location}</span>}
                </span>
              </div>
              <div><span className="text-gray-500">Yaratilgan:</span> <span className="ml-2">{formatDate(problem.createdAt)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
