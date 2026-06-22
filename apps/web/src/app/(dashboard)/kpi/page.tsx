'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import DataTable from '@/components/ui/DataTable';
import Pagination from '@/components/ui/Pagination';
import ExportButton from '@/components/ui/ExportButton';
import StatsCard from '@/components/ui/StatsCard';
import { formatDate } from '@/lib/utils';
import { TrendingUp, TrendingDown, Award, Users, Target, BarChart3, Search } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import toast from 'react-hot-toast';

export default function KpiPage() {
  const [data, setData] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('');
  const [levelFilter, setLevelFilter] = useState('region');
  const [search, setSearch] = useState('');
  const [topPerformers, setTopPerformers] = useState<any[]>([]);
  const [radarData, setRadarData] = useState<any[]>([]);

  const fetchKpi = async (page = 1) => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20, level: levelFilter };
      if (period) params.period = period;
      if (search) params.search = search;
      const { data: res } = await api.get('/kpi', { params });
      const d = res.data;
      if (Array.isArray(d)) {
        setData(d);
        setMeta({ total: d.length, page: 1, limit: 20, totalPages: 1 });
      } else {
        setData(d.data || []);
        setMeta(d.meta || { total: 0, page: 1, limit: 20, totalPages: 0 });
      }
    } catch { setData([]); }
    setLoading(false);
  };

  useEffect(() => {
    fetchKpi();
    api.get('/kpi/top-performers').then(res => {
      setTopPerformers(Array.isArray(res.data.data) ? res.data.data : []);
    }).catch(() => {});
    api.get('/kpi/radar').then(res => {
      setRadarData(Array.isArray(res.data.data) ? res.data.data : []);
    }).catch(() => {});
  }, [period, levelFilter]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    if (score >= 40) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const avgScore = data.length > 0 ? Math.round(data.reduce((sum, d) => sum + (d.score || 0), 0) / data.length) : 0;
  const topScore = data.length > 0 ? Math.max(...data.map(d => d.score || 0)) : 0;
  const lowCount = data.filter(d => (d.score || 0) < 50).length;

  const columns = [
    { key: 'rank', label: '#', render: (item: any) => (
      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
        (item.rank || 0) <= 3 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'
      }`}>{item.rank || '-'}</span>
    )},
    { key: 'name', label: 'Nomi', render: (item: any) => (
      <div>
        <p className="font-medium text-gray-900">{item.user?.fullName || item.region?.nameUz || item.district?.nameUz || item.name || '-'}</p>
        <p className="text-xs text-gray-500">{item.user?.role ? item.user.role : ''}</p>
      </div>
    )},
    { key: 'region', label: 'Hudud', render: (item: any) => item.user?.region?.nameUz || item.region?.nameUz || '-' },
    { key: 'period', label: 'Davr' },
    { key: 'appealsResolved', label: 'Murojaatlar', render: (item: any) => (
      <div className="text-center">
        <span className="font-medium">{item.appealsResolved || 0}</span>
        <span className="text-xs text-gray-400 ml-1">hal</span>
      </div>
    )},
    { key: 'tasksCompleted', label: 'Vazifalar', render: (item: any) => (
      <div className="text-center">
        <span className="font-medium">{item.tasksCompleted || 0}</span>
        <span className="text-xs text-gray-400 ml-1">baj.</span>
      </div>
    )},
    { key: 'youthEngaged', label: 'Yoshlar', render: (item: any) => (
      <div className="text-center">
        <span className="font-medium">{item.youthEngaged || 0}</span>
        <span className="text-xs text-gray-400 ml-1">jalb</span>
      </div>
    )},
    { key: 'score', label: 'Ball', render: (item: any) => (
      <div className="flex items-center gap-2">
        <div className="w-16 bg-gray-200 rounded-full h-2">
          <div className={`h-2 rounded-full ${(item.score || 0) >= 80 ? 'bg-green-500' : (item.score || 0) >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
            style={{ width: `${Math.min(item.score || 0, 100)}%` }} />
        </div>
        <span className={`font-bold text-sm ${getScoreColor(item.score || 0)}`}>{item.score || 0}</span>
      </div>
    )},
  ];

  const periods = [];
  for (let y = 2024; y <= 2026; y++) {
    for (let q = 1; q <= 4; q++) {
      periods.push({ value: `${y}-Q${q}`, label: `${y} Q${q}` });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">KPI ko'rsatkichlari</h1>
          <p className="text-sm text-gray-500 mt-1">Xodimlar va hududlar samaradorligi</p>
        </div>
        <ExportButton
          onExportExcel={() => toast.success('Excel eksport')}
          onExportPdf={() => toast.success('PDF eksport')}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="O'rtacha ball" value={avgScore} icon={Target} color="text-blue-600" />
        <StatsCard title="Eng yuqori ball" value={topScore} icon={Award} color="text-green-600" />
        <StatsCard title="Past natijalar" value={lowCount} icon={TrendingDown} color="text-red-600" />
        <StatsCard title="Jami baholangan" value={meta.total || data.length} icon={Users} color="text-purple-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {topPerformers.length > 0 && (
          <div className="bg-white rounded-lg border p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" /> Top xodimlar
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topPerformers.slice(0, 10)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="score" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {radarData.length > 0 && (
          <div className="bg-white rounded-lg border p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" /> Ko'rsatkichlar taqsimoti
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar name="Ball" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Qidirish..."
            className="pl-9 pr-4 py-2 border rounded-lg text-sm w-64 outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => e.key === 'Enter' && fetchKpi(1)} />
        </div>
        <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm">
          <option value="region">Viloyatlar bo'yicha</option>
          <option value="district">Tumanlar bo'yicha</option>
          <option value="mahalla">Mahallalar bo'yicha</option>
          <option value="user">Xodimlar bo'yicha</option>
        </select>
        <select value={period} onChange={(e) => setPeriod(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm">
          <option value="">Barcha davrlar</option>
          {periods.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
      </div>

      <DataTable columns={columns} data={data} isLoading={loading} />
      <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={fetchKpi} />
    </div>
  );
}
