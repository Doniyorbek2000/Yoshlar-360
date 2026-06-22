'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, User, MapPin, Briefcase, GraduationCap, Heart, AlertTriangle, FileText, MessageCircle, Edit } from 'lucide-react';
import toast from 'react-hot-toast';

export default function YouthDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [youth, setYouth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'appeals' | 'tasks'>('info');
  const [appeals, setAppeals] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    api.get(`/youth/${id}`).then(({ data }) => {
      setYouth(data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
    api.get(`/youth/${id}/appeals`).then(res => {
      setAppeals(Array.isArray(res.data.data) ? res.data.data : []);
    }).catch(() => {});
    api.get(`/youth/${id}/tasks`).then(res => {
      setTasks(Array.isArray(res.data.data) ? res.data.data : []);
    }).catch(() => {});
  }, [id]);

  if (loading) return <div className="text-center py-10 text-gray-500">Yuklanmoqda...</div>;
  if (!youth) return <div className="text-center py-10 text-gray-500">Yosh topilmadi</div>;

  const educationLabels: Record<string, string> = {
    NONE: "Yo'q", SECONDARY: "O'rta", VOCATIONAL: 'Kasb-hunar', HIGHER: 'Oliy',
    INCOMPLETE_HIGHER: "Tugallanmagan oliy", MASTERS: 'Magistratura', PHD: 'PhD',
  };
  const employmentLabels: Record<string, string> = {
    EMPLOYED: 'Band', UNEMPLOYED: 'Ishsiz', STUDENT: 'Talaba', SELF_EMPLOYED: 'Yakka tartibdagi', OTHER: 'Boshqa',
  };
  const socialLabels: Record<string, string> = {
    NORMAL: 'Oddiy', ORPHAN: 'Yetim', DISABLED: 'Nogironligi bor', LOW_INCOME: "Kam ta'minlangan",
    SINGLE_PARENT: 'Yakka ota-ona', OTHER: 'Boshqa',
  };
  const riskLabels: Record<string, string> = { LOW: 'Past', MEDIUM: "O'rta", HIGH: 'Yuqori', CRITICAL: 'Juda yuqori' };
  const riskColors: Record<string, string> = {
    LOW: 'bg-green-100 text-green-800', MEDIUM: 'bg-yellow-100 text-yellow-800',
    HIGH: 'bg-orange-100 text-orange-800', CRITICAL: 'bg-red-100 text-red-800',
  };

  const age = youth.birthDate ? Math.floor((Date.now() - new Date(youth.birthDate).getTime()) / 31557600000) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
        <div className="flex-1 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{youth.user?.fullName || youth.fullName || 'Yosh profili'}</h1>
            <p className="text-sm text-gray-500 mt-1">ID: {youth.id}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${riskColors[youth.riskLevel] || 'bg-gray-100 text-gray-800'}`}>
              Risk: {riskLabels[youth.riskLevel] || youth.riskLevel}
            </span>
            <Link href={`/youth/${id}/edit`}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              <Edit className="w-4 h-4" /> Tahrirlash
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="bg-white rounded-lg border p-5">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">{youth.user?.fullName || youth.fullName}</h2>
                <p className="text-sm text-gray-500">{youth.gender === 'MALE' ? 'Erkak' : youth.gender === 'FEMALE' ? 'Ayol' : '-'}{age ? `, ${age} yosh` : ''}</p>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <span className="text-gray-400 w-5">📧</span> {youth.user?.email || '-'}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <span className="text-gray-400 w-5">📱</span> {youth.user?.phone || youth.phone || '-'}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <span className="text-gray-400 w-5">🎂</span> {youth.birthDate ? formatDate(youth.birthDate) : '-'}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <span className="text-gray-400 w-5">🆔</span> {youth.passportOrPinfl || '-'}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-5">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><MapPin className="w-4 h-4" /> Joylashuv</h3>
            <div className="space-y-2 text-sm">
              <div><span className="text-gray-500">Viloyat:</span> <span className="ml-2 font-medium">{youth.user?.region?.nameUz || '-'}</span></div>
              <div><span className="text-gray-500">Tuman:</span> <span className="ml-2 font-medium">{youth.user?.district?.nameUz || '-'}</span></div>
              <div><span className="text-gray-500">Mahalla:</span> <span className="ml-2 font-medium">{youth.user?.mahalla?.nameUz || '-'}</span></div>
              <div><span className="text-gray-500">Manzil:</span> <span className="ml-2 font-medium">{youth.address || '-'}</span></div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border">
            <div className="flex border-b">
              {[
                { key: 'info', label: "To'liq ma'lumot", icon: User },
                { key: 'appeals', label: 'Murojaatlar', icon: MessageCircle, count: appeals.length },
                { key: 'tasks', label: 'Vazifalar', icon: FileText, count: tasks.length },
              ].map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.key ? 'border-blue-500 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}>
                  <tab.icon className="w-4 h-4" /> {tab.label}
                  {'count' in tab && tab.count! > 0 && (
                    <span className="bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded-full">{tab.count}</span>
                  )}
                </button>
              ))}
            </div>

            <div className="p-6">
              {activeTab === 'info' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2"><GraduationCap className="w-4 h-4" /> Ta'lim va bandlik</h4>
                    <div className="space-y-3">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500">Ta'lim darajasi</p>
                        <p className="font-medium mt-0.5">{educationLabels[youth.education] || youth.education || '-'}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500">Bandlik holati</p>
                        <p className="font-medium mt-0.5">{employmentLabels[youth.employmentStatus] || youth.employmentStatus || '-'}</p>
                      </div>
                      {youth.workplace && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500">Ish joyi</p>
                          <p className="font-medium mt-0.5">{youth.workplace}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2"><Heart className="w-4 h-4" /> Ijtimoiy holat</h4>
                    <div className="space-y-3">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500">Ijtimoiy holat</p>
                        <p className="font-medium mt-0.5">{socialLabels[youth.socialStatus] || youth.socialStatus || '-'}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500">Risk darajasi</p>
                        <p className="font-medium mt-0.5">
                          <span className={`px-2 py-0.5 rounded text-xs ${riskColors[youth.riskLevel] || ''}`}>
                            {riskLabels[youth.riskLevel] || youth.riskLevel || '-'}
                          </span>
                        </p>
                      </div>
                      {youth.interests && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500">Qiziqishlari</p>
                          <p className="font-medium mt-0.5">{youth.interests}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'appeals' && (
                <div className="space-y-3">
                  {appeals.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">Murojaatlar yo'q</p>
                  ) : appeals.map((a: any) => (
                    <Link key={a.id} href={`/appeals/${a.id}`}
                      className="block bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{a.title}</p>
                          <p className="text-xs text-gray-500 mt-1">{formatDate(a.createdAt)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={a.status} />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {activeTab === 'tasks' && (
                <div className="space-y-3">
                  {tasks.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">Vazifalar yo'q</p>
                  ) : tasks.map((t: any) => (
                    <Link key={t.id} href={`/tasks/${t.id}`}
                      className="block bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{t.title}</p>
                          <p className="text-xs text-gray-500 mt-1">{t.dueDate ? `Muddat: ${formatDate(t.dueDate)}` : formatDate(t.createdAt)}</p>
                        </div>
                        <StatusBadge status={t.status} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
