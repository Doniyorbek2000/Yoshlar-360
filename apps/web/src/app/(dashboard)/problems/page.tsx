'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import DataTable from '@/components/ui/DataTable';
import Pagination from '@/components/ui/Pagination';
import StatusBadge from '@/components/ui/StatusBadge';
import PriorityBadge from '@/components/ui/PriorityBadge';
import ExportButton from '@/components/ui/ExportButton';
import StatsCard from '@/components/ui/StatsCard';
import { formatDate } from '@/lib/utils';
import { Plus, Search, Filter, AlertTriangle, CheckCircle, Clock, MapPin, Image } from 'lucide-react';
import toast from 'react-hot-toast';

const problemCategories = [
  { value: '', label: 'Barcha kategoriyalar' },
  { value: 'INFRASTRUCTURE', label: 'Infratuzilma' },
  { value: 'SOCIAL', label: 'Ijtimoiy' },
  { value: 'EDUCATION', label: "Ta'lim" },
  { value: 'HEALTHCARE', label: "Sog'liq" },
  { value: 'EMPLOYMENT', label: 'Bandlik' },
  { value: 'ENVIRONMENT', label: 'Atrof-muhit' },
  { value: 'SECURITY', label: 'Xavfsizlik' },
  { value: 'OTHER', label: 'Boshqa' },
];

export default function ProblemsPage() {
  const [data, setData] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [regions, setRegions] = useState<any[]>([]);

  const fetchProblems = async (page = 1) => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (search) params.search = search;
      if (regionFilter) params.regionId = regionFilter;
      const { data: res } = await api.get('/problems', { params });
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
    fetchProblems();
    api.get('/regions').then(res => {
      const r = res.data.data;
      setRegions(Array.isArray(r) ? r : r?.data || []);
    }).catch(() => {});
  }, [statusFilter, categoryFilter, priorityFilter, regionFilter]);

  const openCount = data.filter(d => d.status === 'OPEN').length;
  const inProgressCount = data.filter(d => d.status === 'IN_PROGRESS').length;
  const resolvedCount = data.filter(d => d.status === 'RESOLVED').length;

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'title', label: 'Sarlavha', render: (item: any) => (
      <div>
        <Link href={`/problems/${item.id}`} className="text-blue-600 hover:underline font-medium">{item.title}</Link>
        {item.images?.length > 0 && (
          <span className="ml-2 inline-flex items-center gap-0.5 text-gray-400">
            <Image className="w-3 h-3" /> {item.images.length}
          </span>
        )}
      </div>
    )},
    { key: 'category', label: 'Kategoriya', render: (item: any) => {
      const cat = problemCategories.find(c => c.value === item.category);
      return <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium">{cat?.label || item.category}</span>;
    }},
    { key: 'status', label: 'Status', render: (item: any) => <StatusBadge status={item.status} /> },
    { key: 'priority', label: 'Muhimlik', render: (item: any) => <PriorityBadge priority={item.priority} /> },
    { key: 'location', label: 'Joylashuv', render: (item: any) => (
      <div className="flex items-center gap-1 text-sm text-gray-600">
        <MapPin className="w-3 h-3" />
        <span>{item.region?.nameUz || '-'}{item.district?.nameUz ? `, ${item.district.nameUz}` : ''}</span>
      </div>
    )},
    { key: 'reportedBy', label: 'Xabar beruvchi', render: (item: any) => item.reportedBy?.fullName || '-' },
    { key: 'assignedTo', label: "Mas'ul", render: (item: any) => item.assignedTo?.fullName || '-' },
    { key: 'createdAt', label: 'Sana', render: (item: any) => formatDate(item.createdAt) },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Muammolar</h1>
          <p className="text-sm text-gray-500 mt-1">Hudud va yoshlarga oid muammolar</p>
        </div>
        <div className="flex items-center gap-3">
          <ExportButton
            onExportExcel={() => toast.success('Excel eksport')}
            onExportPdf={() => toast.success('PDF eksport')}
          />
          <Link href="/problems/create"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            <Plus className="w-4 h-4" /> Yangi muammo
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard title="Ochiq muammolar" value={openCount} icon={AlertTriangle} color="text-red-600" />
        <StatsCard title="Jarayonda" value={inProgressCount} icon={Clock} color="text-yellow-600" />
        <StatsCard title="Hal qilingan" value={resolvedCount} icon={CheckCircle} color="text-green-600" />
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Qidirish..."
            className="pl-9 pr-4 py-2 border rounded-lg text-sm w-64 outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => e.key === 'Enter' && fetchProblems(1)} />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm">
          <option value="">Barcha statuslar</option>
          <option value="OPEN">Ochiq</option>
          <option value="IN_PROGRESS">Jarayonda</option>
          <option value="RESOLVED">Hal qilingan</option>
          <option value="CLOSED">Yopilgan</option>
        </select>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm">
          {problemCategories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm">
          <option value="">Barcha muhimlik</option>
          <option value="LOW">Past</option>
          <option value="MEDIUM">O'rta</option>
          <option value="HIGH">Yuqori</option>
          <option value="URGENT">Shoshilinch</option>
        </select>
        <select value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm">
          <option value="">Barcha hududlar</option>
          {regions.map((r: any) => <option key={r.id} value={r.id}>{r.nameUz}</option>)}
        </select>
      </div>

      <DataTable columns={columns} data={data} isLoading={loading} />
      <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={fetchProblems} />
    </div>
  );
}
