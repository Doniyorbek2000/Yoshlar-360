'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TrendingUp, TrendingDown, Activity, Target, Users, MessageSquare } from 'lucide-react';

interface AnalyticsData {
  regionComparison: any[];
  appealsTrend: any[];
  youthSegments: any[];
  riskGroups: any[];
  staffEfficiency: any[];
  completionRate: number;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/region-stats').catch(() => ({ data: { data: [] } })),
      api.get('/dashboard/appeals-chart').catch(() => ({ data: { data: [] } })),
      api.get('/dashboard/summary').catch(() => ({ data: { data: {} } })),
    ]).then(([regions, appeals, summary]) => {
      const s = summary.data.data || {};
      const completionRate = s.totalTasks > 0 ? Math.round((s.doneTasks / s.totalTasks) * 100) : 0;

      setData({
        regionComparison: (regions.data.data || []).map((r: any) => ({
          name: r.nameUz?.slice(0, 12) || 'N/A',
          users: r.users || 0,
          appeals: r.appeals || 0,
          problems: r.problems || 0,
        })),
        appealsTrend: appeals.data.data || [],
        youthSegments: [
          { name: 'Ta\'lim', value: 35 },
          { name: 'Ishsiz', value: 25 },
          { name: 'Bandlik', value: 30 },
          { name: 'Boshqa', value: 10 },
        ],
        riskGroups: [
          { subject: 'Ta\'lim', A: 80, fullMark: 100 },
          { subject: 'Bandlik', A: 65, fullMark: 100 },
          { subject: 'Ijtimoiy', A: 72, fullMark: 100 },
          { subject: 'Sog\'liq', A: 88, fullMark: 100 },
          { subject: 'Uy-joy', A: 55, fullMark: 100 },
          { subject: 'Huquqiy', A: 90, fullMark: 100 },
        ],
        staffEfficiency: [],
        completionRate,
      });
    }).finally(() => setLoading(false));
  }, []);

  if (loading || !data) return <div className="text-center py-10 text-gray-500">Yuklanmoqda...</div>;

  const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Kengaytirilgan tahlil</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border rounded-lg p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Vazifalar bajarilishi</span>
            <Target className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{data.completionRate}%</div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${data.completionRate}%` }} />
          </div>
        </div>
        <div className="bg-white border rounded-lg p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Hududlar soni</span>
            <Activity className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{data.regionComparison.length}</div>
          <p className="text-xs text-gray-400 mt-1">Faol hududlar</p>
        </div>
        <div className="bg-white border rounded-lg p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">O&apos;rtacha KPI</span>
            <TrendingUp className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">74%</div>
          <p className="text-xs text-green-500 mt-1">+5% o&apos;tgan oyga nisbatan</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hududiy solishtirish</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.regionComparison}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={11} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="users" fill="#3b82f6" name="Foydalanuvchilar" />
              <Bar dataKey="appeals" fill="#22c55e" name="Murojaatlar" />
              <Bar dataKey="problems" fill="#ef4444" name="Muammolar" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg border p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Yoshlar segmentatsiyasi</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={data.youthSegments} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {data.youthSegments.map((_, i) => (
                  <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg border p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Murojaat trendi</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.appealsTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="total" stroke="#3b82f6" name="Jami" strokeWidth={2} />
              <Line type="monotone" dataKey="resolved" stroke="#22c55e" name="Hal qilingan" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg border p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk guruhi tahlili</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={data.riskGroups}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" fontSize={12} />
              <PolarRadiusAxis />
              <Radar name="Darajasi" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
