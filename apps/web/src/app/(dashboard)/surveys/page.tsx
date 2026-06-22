'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import DataTable from '@/components/ui/DataTable';
import Pagination from '@/components/ui/Pagination';
import StatsCard from '@/components/ui/StatsCard';
import { formatDate } from '@/lib/utils';
import { Plus, Search, ClipboardList, CheckCircle, Clock, Archive } from 'lucide-react';
import toast from 'react-hot-toast';

const surveyStatuses: Record<string, string> = {
  DRAFT: 'Qoralama',
  ACTIVE: 'Faol',
  CLOSED: 'Yopilgan',
};

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  ACTIVE: 'bg-green-100 text-green-700',
  CLOSED: 'bg-red-100 text-red-700',
};

export default function SurveysPage() {
  const [data, setData] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchSurveys = async (page = 1) => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const { data: res } = await api.get('/surveys', { params });
      const d = res.data;
      if (Array.isArray(d)) {
        setData(d);
        setMeta({ total: d.length, page: 1, limit: 20, totalPages: 1 });
      } else {
        setData(d.data || []);
        setMeta(d.meta || { total: 0, page: 1, limit: 20, totalPages: 0 });
      }
    } catch {
      setData([]);
      toast.error('So\'rovnomalarni yuklashda xatolik');
    }
    setLoading(false);
  };

  useEffect(() => { fetchSurveys(); }, [statusFilter]);

  const stats = {
    total: meta.total || data.length,
    active: data.filter(s => s.status === 'ACTIVE').length,
    draft: data.filter(s => s.status === 'DRAFT').length,
    closed: data.filter(s => s.status === 'CLOSED').length,
  };

  const columns = [
    { key: 'title', label: 'Nomi', render: (item: any) => (
      <Link href={`/surveys/${item.id}`} className="text-blue-600 hover:underline font-medium">
        {item.title}
      </Link>
    )},
    { key: 'description', label: 'Tavsif', render: (item: any) => (
      <span className="text-sm text-gray-600 line-clamp-1">{item.description || '-'}</span>
    )},
    { key: 'status', label: 'Holat', render: (item: any) => (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[item.status] || 'bg-gray-100 text-gray-700'}`}>
        {surveyStatuses[item.status] || item.status || '-'}
      </span>
    )},
    { key: 'questions', label: 'Savollar', render: (item: any) => (
      <span className="text-sm">{item._count?.questions || item.questions?.length || 0} ta</span>
    )},
    { key: 'responses', label: 'Javoblar', render: (item: any) => (
      <span className="text-sm font-medium">{item._count?.responses || item.responsesCount || 0}</span>
    )},
    { key: 'createdBy', label: 'Yaratuvchi', render: (item: any) => item.createdBy?.fullName || '-' },
    { key: 'startsAt', label: 'Boshlanishi', render: (item: any) => (item.startsAt || item.startDate) ? formatDate(item.startsAt || item.startDate) : '-' },
    { key: 'endsAt', label: 'Tugashi', render: (item: any) => (item.endsAt || item.endDate) ? formatDate(item.endsAt || item.endDate) : '-' },
    { key: 'createdAt', label: 'Yaratilgan', render: (item: any) => formatDate(item.createdAt) },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">So'rovnomalar</h1>
          <p className="text-sm text-gray-500 mt-1">Yoshlar so'rovnomalari va tadqiqotlar</p>
        </div>
        <Link href="/surveys/create"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus className="w-4 h-4" /> Yangi so'rovnoma
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Jami" value={stats.total} icon={ClipboardList} color="text-blue-600" />
        <StatsCard title="Faol" value={stats.active} icon={CheckCircle} color="text-green-600" />
        <StatsCard title="Qoralama" value={stats.draft} icon={Clock} color="text-gray-600" />
        <StatsCard title="Yopilgan" value={stats.closed} icon={Archive} color="text-red-600" />
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="So'rovnoma qidirish..."
            className="pl-9 pr-4 py-2 border rounded-lg text-sm w-64 outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => e.key === 'Enter' && fetchSurveys(1)} />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm">
          <option value="">Barcha holatlar</option>
          {Object.entries(surveyStatuses).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <button onClick={() => fetchSurveys(1)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Qidirish</button>
      </div>

      <DataTable columns={columns} data={data} isLoading={loading} />
      <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={fetchSurveys} />
    </div>
  );
}
