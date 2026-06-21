'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import StatsCard from '@/components/ui/StatsCard';
import { Users, MessageSquare, AlertTriangle, ListTodo, CheckCircle, Clock, TrendingUp, XCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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
  const [summary, setSummary] = useState<Summary | null>(null);
  const [appealsChart, setAppealsChart] = useState<any[]>([]);
  const [taskStats, setTaskStats] = useState<any[]>([]);
  const [regionStats, setRegionStats] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/summary'),
      api.get('/dashboard/appeals-chart'),
      api.get('/dashboard/task-stats'),
      api.get('/dashboard/region-stats'),
    ]).then(([s, a, t, r]) => {
      setSummary(s.data.data);
      setAppealsChart(a.data.data);
      setTaskStats(t.data.data);
      setRegionStats(r.data.data);
    }).catch(console.error);
  }, []);

  if (!summary) return <div className="text-center py-10 text-gray-500">Yuklanmoqda...</div>;

  const COLORS = ['#6b7280', '#eab308', '#22c55e', '#ef4444'];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Boshqaruv paneli</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Jami yoshlar" value={summary.totalYouth} icon={Users} color="text-blue-600" />
        <StatsCard title="Jami murojaatlar" value={summary.totalAppeals} icon={MessageSquare} color="text-purple-600" />
        <StatsCard title="Yangi murojaatlar" value={summary.newAppeals} icon={Clock} color="text-yellow-600" />
        <StatsCard title="Hal qilingan" value={summary.resolvedAppeals} icon={CheckCircle} color="text-green-600" />
        <StatsCard title="Muammolar" value={summary.totalProblems} icon={AlertTriangle} color="text-orange-600" />
        <StatsCard title="Jami vazifalar" value={summary.totalTasks} icon={ListTodo} color="text-indigo-600" />
        <StatsCard title="Bajarilgan" value={summary.doneTasks} icon={TrendingUp} color="text-green-600" />
        <StatsCard title="Muddati o&apos;tgan" value={summary.overdueTasksCount} icon={XCircle} color="text-red-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Murojaatlar dinamikasi</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={appealsChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#3b82f6" name="Jami" />
              <Bar dataKey="resolved" fill="#22c55e" name="Hal qilingan" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg border p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Vazifalar holati</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={taskStats} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={100} label={(entry) => entry.status}>
                {taskStats.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Hududlar bo&apos;yicha statistika</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hudud</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Foydalanuvchilar</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Murojaatlar</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Muammolar</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {regionStats.map((r: any) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{r.nameUz}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{r.users}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{r.appeals}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{r.problems}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
