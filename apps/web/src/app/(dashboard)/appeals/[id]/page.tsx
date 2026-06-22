'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import StatusBadge from '@/components/ui/StatusBadge';
import PriorityBadge from '@/components/ui/PriorityBadge';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, MessageCircle, Clock, User, MapPin, Send, FileText, Lock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AppealDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [appeal, setAppeal] = useState<any>(null);
  const [comment, setComment] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'comments' | 'timeline' | 'notes'>('comments');
  const [assigneeId, setAssigneeId] = useState('');
  const [users, setUsers] = useState<any[]>([]);

  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'REPUBLIC_ADMIN' || user?.role === 'REGION_ADMIN';

  useEffect(() => {
    api.get(`/appeals/${id}`).then(({ data }) => {
      setAppeal(data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
    if (isAdmin) {
      api.get('/users', { params: { limit: 100 } }).then(res => {
        const d = res.data.data;
        setUsers(Array.isArray(d) ? d : d?.data || []);
      }).catch(() => {});
    }
  }, [id]);

  const addComment = async () => {
    if (!comment.trim()) return;
    try {
      const { data } = await api.post(`/appeals/${id}/comments`, { text: comment });
      setAppeal((prev: any) => ({ ...prev, comments: [...(prev.comments || []), data.data] }));
      setComment('');
      toast.success("Izoh qo'shildi");
    } catch { toast.error('Xatolik'); }
  };

  const addInternalNote = async () => {
    if (!internalNote.trim()) return;
    try {
      await api.post(`/appeals/${id}/notes`, { text: internalNote });
      toast.success("Ichki eslatma qo'shildi");
      setInternalNote('');
      api.get(`/appeals/${id}`).then(({ data }) => setAppeal(data.data));
    } catch { toast.error('Xatolik'); }
  };

  const updateStatus = async (status: string) => {
    try {
      await api.put(`/appeals/${id}/status`, { status });
      setAppeal((prev: any) => ({ ...prev, status }));
      toast.success("Status o'zgartirildi");
    } catch { toast.error('Xatolik'); }
  };

  const assignUser = async () => {
    if (!assigneeId) return;
    try {
      await api.put(`/appeals/${id}`, { assignedToId: parseInt(assigneeId) });
      toast.success("Mas'ul biriktirildi");
      api.get(`/appeals/${id}`).then(({ data }) => setAppeal(data.data));
    } catch { toast.error('Xatolik'); }
  };

  if (loading) return <div className="text-center py-10 text-gray-500">Yuklanmoqda...</div>;
  if (!appeal) return <div className="text-center py-10 text-gray-500">Murojaat topilmadi</div>;

  const categoryLabels: Record<string, string> = {
    EMPLOYMENT: 'Bandlik', EDUCATION: "Ta'lim", HOUSING: 'Uy-joy', HEALTHCARE: "Sog'liq",
    SOCIAL: 'Ijtimoiy', LEGAL: 'Huquqiy', OTHER: 'Boshqa',
  };

  const timeline = [
    { date: appeal.createdAt, action: 'Murojaat yaratildi', user: appeal.applicant?.fullName || appeal.youth?.fullName },
    ...(appeal.statusHistory || []).map((h: any) => ({
      date: h.createdAt, action: `Status: ${h.fromStatus} → ${h.toStatus}`, user: h.changedBy?.fullName,
    })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Murojaat #{appeal.id}</h1>
            <StatusBadge status={appeal.status} />
            <PriorityBadge priority={appeal.priority} />
          </div>
          <p className="text-sm text-gray-500 mt-1">{formatDate(appeal.createdAt)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold text-gray-900">{appeal.title}</h2>
            <p className="text-gray-600 mt-3 whitespace-pre-wrap leading-relaxed">{appeal.description}</p>
            {appeal.attachments?.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Biriktirilgan fayllar</h4>
                <div className="flex flex-wrap gap-2">
                  {appeal.attachments.map((a: any, i: number) => (
                    <a key={i} href={a.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border rounded-lg text-sm text-gray-700 hover:bg-gray-100">
                      <FileText className="w-4 h-4" /> {a.name || `Fayl ${i + 1}`}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 flex-wrap">
            {['NEW', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', 'CLOSED'].map(s => (
              <button key={s} onClick={() => updateStatus(s)} disabled={appeal.status === s}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  appeal.status === s ? 'bg-blue-50 border-blue-300 text-blue-700' : 'hover:bg-gray-50 disabled:opacity-50'
                }`}>
                {s === 'NEW' ? 'Yangi' : s === 'IN_PROGRESS' ? 'Jarayonda' : s === 'RESOLVED' ? 'Hal qilindi' : s === 'REJECTED' ? 'Rad etildi' : 'Yopildi'}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-lg border">
            <div className="flex border-b">
              {[
                { key: 'comments', label: 'Izohlar', icon: MessageCircle, count: appeal.comments?.length || 0 },
                { key: 'timeline', label: 'Tarix', icon: Clock },
                ...(isAdmin ? [{ key: 'notes', label: 'Ichki eslatmalar', icon: Lock }] : []),
              ].map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.key ? 'border-blue-500 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}>
                  <tab.icon className="w-4 h-4" /> {tab.label}
                  {'count' in tab && tab.count > 0 && (
                    <span className="bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded-full">{tab.count}</span>
                  )}
                </button>
              ))}
            </div>

            <div className="p-6">
              {activeTab === 'comments' && (
                <div className="space-y-4">
                  {appeal.comments?.map((c: any) => (
                    <div key={c.id} className="flex gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-blue-700">{c.user?.fullName?.[0] || '?'}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">{c.user?.fullName}</span>
                          <span className="text-xs text-gray-400">{formatDate(c.createdAt)}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{c.text}</p>
                      </div>
                    </div>
                  ))}
                  {(!appeal.comments || appeal.comments.length === 0) && (
                    <p className="text-sm text-gray-500 text-center py-4">Hali izohlar yo'q</p>
                  )}
                  <div className="flex gap-2 pt-4 border-t">
                    <input type="text" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Izoh yozing..."
                      className="flex-1 px-4 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyDown={(e) => e.key === 'Enter' && addComment()} />
                    <button onClick={addComment} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'timeline' && (
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200" />
                  <div className="space-y-6">
                    {timeline.map((t, i) => (
                      <div key={i} className="relative flex gap-4 pl-10">
                        <div className="absolute left-2.5 w-3 h-3 bg-blue-500 rounded-full border-2 border-white" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{t.action}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {t.user && <span className="text-xs text-gray-500">{t.user}</span>}
                            <span className="text-xs text-gray-400">{formatDate(t.date)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'notes' && isAdmin && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 px-3 py-2 rounded-lg text-sm">
                    <Lock className="w-4 h-4" /> Ichki eslatmalar faqat admin xodimlarga ko'rinadi
                  </div>
                  {appeal.internalNotes?.map((n: any) => (
                    <div key={n.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">{n.user?.fullName}</span>
                        <span className="text-xs text-gray-400">{formatDate(n.createdAt)}</span>
                      </div>
                      <p className="text-sm text-gray-700">{n.text}</p>
                    </div>
                  ))}
                  <div className="flex gap-2 pt-4 border-t">
                    <input type="text" value={internalNote} onChange={(e) => setInternalNote(e.target.value)}
                      placeholder="Ichki eslatma..."
                      className="flex-1 px-4 py-2 border border-yellow-300 bg-yellow-50 rounded-lg text-sm outline-none focus:ring-2 focus:ring-yellow-500"
                      onKeyDown={(e) => e.key === 'Enter' && addInternalNote()} />
                    <button onClick={addInternalNote} className="px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm font-medium hover:bg-yellow-600">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-lg border p-5 space-y-4">
            <h3 className="font-semibold text-gray-900">Ma'lumotlar</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-500 w-24">Kategoriya:</span>
                <span className="font-medium">{categoryLabels[appeal.category] || appeal.category}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 w-24">Ariza beruvchi:</span>
                <span className="font-medium">{appeal.applicant?.fullName || appeal.youth?.fullName || '-'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 w-24">Mas'ul:</span>
                <span className="font-medium">{appeal.assignedTo?.fullName || 'Biriktirilmagan'}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <span className="text-gray-700">
                  {[appeal.region?.nameUz, appeal.district?.nameUz, appeal.mahalla?.nameUz].filter(Boolean).join(' > ') || '-'}
                </span>
              </div>
            </div>
          </div>

          {isAdmin && (
            <div className="bg-white rounded-lg border p-5 space-y-3">
              <h3 className="font-semibold text-gray-900">Mas'ul biriktirish</h3>
              <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="">Tanlang</option>
                {users.map((u: any) => <option key={u.id} value={u.id}>{u.fullName} ({u.role})</option>)}
              </select>
              <button onClick={assignUser} disabled={!assigneeId}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                Biriktirish
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
