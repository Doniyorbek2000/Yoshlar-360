'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import StatusBadge from '@/components/ui/StatusBadge';
import PriorityBadge from '@/components/ui/PriorityBadge';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, Clock, User, Send, FileText, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TaskDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');

  useEffect(() => {
    api.get(`/tasks/${id}`).then(({ data }) => {
      setTask(data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const updateStatus = async (status: string) => {
    try {
      await api.put(`/tasks/${id}`, { status });
      setTask((prev: any) => ({ ...prev, status }));
      toast.success("Status yangilandi");
    } catch { toast.error('Xatolik'); }
  };

  const addComment = async () => {
    if (!comment.trim()) return;
    try {
      const { data } = await api.post(`/tasks/${id}/comments`, { text: comment });
      setTask((prev: any) => ({ ...prev, comments: [...(prev.comments || []), data.data] }));
      setComment('');
      toast.success("Izoh qo'shildi");
    } catch { toast.error('Xatolik'); }
  };

  if (loading) return <div className="text-center py-10 text-gray-500">Yuklanmoqda...</div>;
  if (!task) return <div className="text-center py-10 text-gray-500">Vazifa topilmadi</div>;

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE' && task.status !== 'CANCELLED';

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Vazifa #{task.id}</h1>
            <StatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
            {isOverdue && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded font-medium">MUDDATI O'TGAN</span>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold text-gray-900">{task.title}</h2>
            <p className="text-gray-600 mt-3 whitespace-pre-wrap">{task.description || 'Tavsif yo\'q'}</p>
          </div>

          <div className="flex gap-2 flex-wrap">
            {['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED'].map(s => (
              <button key={s} onClick={() => updateStatus(s)} disabled={task.status === s}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  task.status === s ? 'bg-blue-50 border-blue-300 text-blue-700' : 'hover:bg-gray-50'
                }`}>
                {s === 'TODO' ? 'Rejada' : s === 'IN_PROGRESS' ? 'Jarayonda' : s === 'DONE' ? 'Bajarildi' : 'Bekor'}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-lg border p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Izohlar ({task.comments?.length || 0})</h3>
            <div className="space-y-4 mb-4">
              {task.comments?.map((c: any) => (
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
              {(!task.comments || task.comments.length === 0) && (
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
              <div><span className="text-gray-500">Mas'ul:</span> <span className="ml-2 font-medium">{task.assignedTo?.fullName || '-'}</span></div>
              <div><span className="text-gray-500">Yaratuvchi:</span> <span className="ml-2 font-medium">{task.createdBy?.fullName || '-'}</span></div>
              <div>
                <span className="text-gray-500">Muddat:</span>
                <span className={`ml-2 font-medium ${isOverdue ? 'text-red-600' : ''}`}>{task.dueDate ? formatDate(task.dueDate) : '-'}</span>
              </div>
              <div><span className="text-gray-500">Yaratilgan:</span> <span className="ml-2">{formatDate(task.createdAt)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
