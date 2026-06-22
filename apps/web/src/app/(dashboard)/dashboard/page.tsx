'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import StatsCard from '@/components/ui/StatsCard';
import { DashboardSkeleton } from '@/components/ui/LoadingSkeleton';
import { Users, MessageSquare, AlertTriangle, ListTodo, CheckCircle, Clock, TrendingUp, XCircle, ArrowRight, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';

interface Summary {
  totalYouth: number;
  totalAppeals: number;
  newAppeals: number;
  resolvedAppeals: number;
  totalProblems: number;
  totalTasks: number;
  doneTasks: number;
  overdueTasksCount: number;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [appealsChart, setAppealsChart] = useState<any[]>([]);
  const [taskStats, setTaskStats] = useState<any[]>([]);
  const [regionStats, setRegionStats] = useState<any[]>([]);
  const [recentAppeals, setRecentAppeals] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/summary'),
      api.get('/dashboard/appeals-chart'),
      api.get('/dashboard/task-stats'),
      api.get('/dashboard/region-stats'),
    ]).then(([s, a, t, r]) => {
      setSummary(s.data.data);
      setAppealsChart(Array.isArray(a.data.data) ? a.data.data : []);
      setTaskStats(Array.isArray(t.data.data) ? t.data.data : []);
      setRegionStats(Array.isArray(r.data.data) ? r.data.data : []);
    }).catch(() => {});

    api.get('/appeals', { params: { limit: 5, sort: 'createdAt:desc' } }).then(res => {
      const d = res.data.data;
      setRecentAppeals(Array.isArray(d) ? d : d?.data || []);
    }).catch(() => {});
  }, []);

  if (!summary) return <DashboardSkeleton />;

  const COLORS = ['#6b7280', '#eab308', '#22c55e', '#ef4444'];
  const statusLabels: Record<string, string> = { TODO: 'Rejada', IN_PROGRESS: 'Jarayonda', DONE: 'Bajarilgan', CANCELLED: 'Bekor' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Boshqaruv paneli</h1>
          <p className="text-sm text-gray-500 mt-1">Xush kelibsiz, {user?.fullName}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Activity className="w-4 h-4" />
          <span>{new Date().toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Jami yoshlar" value={summary.totalYouth} icon={Users} color="text-blue-600" />
        <StatsCard title="Jami murojaatlar" value={summary.totalAppeals} icon={MessageSquare} color="text-purple-600" />
        <StatsCard title="Yangi murojaatlar" value={summary.newAppeals} icon={Clock} color="text-yellow-600" />
        <StatsCard title="Hal qilingan" value={summary.resolvedAppeals} icon={CheckCircle} color="text-green-600" />
        <StatsCard title="Muammolar" value={summary.totalProblems} icon={AlertTriangle} color="text-orange-600" />
        <StatsCard title="Jami vazifalar" value={summary.totalTasks} icon={ListTodo} color="text-indigo-600" />
        <StatsCard title="Bajarilgan" value={summary.doneTasks} icon={TrendingUp} color="text-green-600" />
        <StatsCard title="Muddati o'tgan" value={summary.overdueTasksCount} icon={XCircle} color="text-red-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Murojaatlar dinamikasi</h3>
            <Link href="/appeals" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              Barchasi <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={appealsChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#3b82f6" name="Jami" radius={[4, 4, 0, 0]} />
              <Bar dataKey="resolved" fill="#22c55e" name="Hal qilingan" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Vazifalar holati</h3>
            <Link href="/tasks" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              Barchasi <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={taskStats} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={100}
                label={(entry) => statusLabels[entry.status] || entry.status}>
                {taskStats.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any, name: any) => [value, statusLabels[name] || name]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Hududlar bo'yicha</h3>
            <Link href="/analytics" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              Batafsil <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hudud</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Yoshlar</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Murojaatlar</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Muammolar</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {regionStats.slice(0, 8).map((r: any) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{r.nameUz}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{r.users || r.youth || 0}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{r.appeals || 0}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{r.problems || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Oxirgi murojaatlar</h3>
            <Link href="/appeals" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              Barchasi <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentAppeals.slice(0, 5).map((a: any) => (
              <Link key={a.id} href={`/appeals/${a.id}`}
                className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <p className="text-sm font-medium text-gray-900 truncate">{a.title}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                    a.status === 'NEW' ? 'bg-blue-100 text-blue-700' :
                    a.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-700' :
                    a.status === 'RESOLVED' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>{a.status === 'NEW' ? 'Yangi' : a.status === 'IN_PROGRESS' ? 'Jarayonda' : a.status === 'RESOLVED' ? 'Hal qilingan' : a.status}</span>
                  <span className="text-xs text-gray-400">{a.createdAt ? new Date(a.createdAt).toLocaleDateString('uz-UZ') : ''}</span>
                </div>
              </Link>
            ))}
            {recentAppeals.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">Murojaatlar yo'q</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
