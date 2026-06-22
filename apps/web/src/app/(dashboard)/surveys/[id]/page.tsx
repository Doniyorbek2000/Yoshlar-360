'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, ClipboardList, Users, BarChart3, CheckCircle, Clock, Hash } from 'lucide-react';
import toast from 'react-hot-toast';

const surveyStatuses: Record<string, string> = {
  DRAFT: 'Qoralama', ACTIVE: 'Faol', CLOSED: 'Yopilgan',
};

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700', ACTIVE: 'bg-green-100 text-green-700', CLOSED: 'bg-red-100 text-red-700',
};

const questionTypeLabels: Record<string, string> = {
  TEXT: 'Matn', SINGLE_CHOICE: 'Bitta tanlov', MULTIPLE_CHOICE: 'Ko\'p tanlov', RATING: 'Baho', NUMBER: 'Raqam',
};

export default function SurveyDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [survey, setSurvey] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'questions' | 'responses' | 'analytics'>('questions');

  const isAdmin = ['SUPER_ADMIN', 'REPUBLIC_ADMIN', 'REGION_ADMIN'].includes(user?.role || '');

  useEffect(() => {
    api.get(`/surveys/${id}`).then(({ data }) => {
      setSurvey(data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const updateStatus = async (status: string) => {
    try {
      await api.patch(`/surveys/${id}/status`, { status });
      setSurvey((prev: any) => ({ ...prev, status }));
      toast.success('Holat yangilandi');
    } catch { toast.error('Xatolik'); }
  };

  const handleDelete = async () => {
    if (!confirm('So\'rovnomani o\'chirmoqchimisiz?')) return;
    try {
      await api.delete(`/surveys/${id}`);
      toast.success('So\'rovnoma o\'chirildi');
      router.push('/surveys');
    } catch { toast.error('Xatolik'); }
  };

  if (loading) return <div className="text-center py-10 text-gray-500">Yuklanmoqda...</div>;
  if (!survey) return <div className="text-center py-10 text-gray-500">So'rovnoma topilmadi</div>;

  const questions = survey.questions || [];
  const responses = survey.responses || [];
  const totalResponses = survey._count?.responses || responses.length;

  const getQuestionStats = (question: any) => {
    if (!['SINGLE_CHOICE', 'MULTIPLE_CHOICE'].includes(question.type)) return null;
    const answers = responses.flatMap((r: any) => r.answers?.filter((a: any) => a.questionId === question.id) || []);
    const optionCounts: Record<string, number> = {};
    (question.options || []).forEach((opt: string) => { optionCounts[opt] = 0; });
    answers.forEach((a: any) => {
      const val = a.value || a.text;
      if (val && optionCounts[val] !== undefined) optionCounts[val]++;
    });
    return optionCounts;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{survey.title}</h1>
            <span className={`px-2.5 py-1 rounded text-xs font-medium ${statusColors[survey.status] || 'bg-gray-100 text-gray-700'}`}>
              {surveyStatuses[survey.status] || survey.status}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">{survey.description || 'Tavsif kiritilmagan'}</p>
        </div>
        {isAdmin && (
          <button onClick={handleDelete}
            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100">
            O'chirish
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border rounded-lg p-4 flex items-center gap-3">
          <ClipboardList className="w-8 h-8 text-blue-500" />
          <div>
            <p className="text-xs text-gray-500">Savollar</p>
            <p className="text-xl font-bold text-gray-900">{questions.length}</p>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4 flex items-center gap-3">
          <Users className="w-8 h-8 text-green-500" />
          <div>
            <p className="text-xs text-gray-500">Javoblar</p>
            <p className="text-xl font-bold text-gray-900">{totalResponses}</p>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4 flex items-center gap-3">
          <Clock className="w-8 h-8 text-indigo-500" />
          <div>
            <p className="text-xs text-gray-500">Boshlanishi</p>
            <p className="text-sm font-medium text-gray-900">{(survey.startsAt || survey.startDate) ? formatDate(survey.startsAt || survey.startDate) : '-'}</p>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4 flex items-center gap-3">
          <Clock className="w-8 h-8 text-red-500" />
          <div>
            <p className="text-xs text-gray-500">Tugashi</p>
            <p className="text-sm font-medium text-gray-900">{(survey.endsAt || survey.endDate) ? formatDate(survey.endsAt || survey.endDate) : '-'}</p>
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="flex gap-2 flex-wrap">
          {Object.entries(surveyStatuses).map(([key, label]) => (
            <button key={key} onClick={() => updateStatus(key)} disabled={survey.status === key}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                survey.status === key ? 'bg-blue-50 border-blue-300 text-blue-700' : 'hover:bg-gray-50 disabled:opacity-50'
              }`}>
              {label}
            </button>
          ))}
        </div>
      )}

      <div className="bg-white rounded-lg border">
        <div className="flex border-b">
          {[
            { key: 'questions', label: 'Savollar', icon: ClipboardList },
            { key: 'responses', label: `Javoblar (${totalResponses})`, icon: Users },
            { key: 'analytics', label: 'Tahlil', icon: BarChart3 },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key ? 'border-blue-500 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'questions' && (
            <div className="space-y-4">
              {questions.sort((a: any, b: any) => (a.orderIndex || a.order || 0) - (b.orderIndex || b.order || 0)).map((q: any, i: number) => (
                <div key={q.id || i} className="flex gap-3 py-3 border-b last:border-0">
                  <span className="w-7 h-7 bg-blue-100 text-blue-700 rounded flex items-center justify-center text-sm font-bold shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{q.text}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {questionTypeLabels[q.type] || q.type}
                      </span>
                      {q.required && <span className="text-xs text-red-500">Majburiy</span>}
                    </div>
                    {q.options?.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {q.options.map((opt: string, oi: number) => (
                          <div key={oi} className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="w-4 h-4 border rounded-full flex-shrink-0" />
                            {opt}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {questions.length === 0 && <p className="text-sm text-gray-500 text-center py-4">Savollar yo'q</p>}
            </div>
          )}

          {activeTab === 'responses' && (
            <div className="space-y-4">
              {responses.map((r: any, i: number) => (
                <div key={r.id || i} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-900">
                      {r.respondent?.fullName || `Respondent #${i + 1}`}
                    </span>
                    <span className="text-xs text-gray-500">{formatDate(r.createdAt)}</span>
                  </div>
                  <div className="space-y-2">
                    {(r.answers || []).map((a: any, ai: number) => {
                      const question = questions.find((q: any) => q.id === a.questionId);
                      return (
                        <div key={ai} className="flex gap-2 text-sm">
                          <span className="text-gray-500 shrink-0">{question?.text || `Savol ${ai + 1}`}:</span>
                          <span className="text-gray-900 font-medium">{a.value || a.text || '-'}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              {responses.length === 0 && <p className="text-sm text-gray-500 text-center py-4">Hali javoblar yo'q</p>}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {questions.map((q: any, i: number) => {
                const stats = getQuestionStats(q);
                if (!stats) {
                  return (
                    <div key={q.id || i} className="border rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-900 mb-1">{i + 1}. {q.text}</p>
                      <p className="text-xs text-gray-500">{questionTypeLabels[q.type]} - Individual javoblar</p>
                    </div>
                  );
                }
                const total = Object.values(stats).reduce((a, b) => a + b, 0);
                return (
                  <div key={q.id || i} className="border rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-900 mb-3">{i + 1}. {q.text}</p>
                    <div className="space-y-2">
                      {Object.entries(stats).map(([opt, count]) => {
                        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                        return (
                          <div key={opt} className="flex items-center gap-3">
                            <span className="text-sm text-gray-700 w-40 shrink-0 truncate">{opt}</span>
                            <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                              <div className="bg-blue-500 h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-sm text-gray-600 w-16 text-right">{count} ({pct}%)</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              {questions.length === 0 && <p className="text-sm text-gray-500 text-center py-4">Tahlil uchun ma'lumot yo'q</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
