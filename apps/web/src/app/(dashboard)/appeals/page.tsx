'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import DataTable from '@/components/ui/DataTable';
import Pagination from '@/components/ui/Pagination';
import StatusBadge from '@/components/ui/StatusBadge';
import PriorityBadge from '@/components/ui/PriorityBadge';
import ExportButton from '@/components/ui/ExportButton';
import { formatDate } from '@/lib/utils';
import { Plus, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const categories = [
  { value: '', label: 'Barcha kategoriyalar' },
  { value: 'EMPLOYMENT', label: 'Bandlik' },
  { value: 'EDUCATION', label: 'Ta\'lim' },
  { value: 'HOUSING', label: 'Uy-joy' },
  { value: 'HEALTHCARE', label: 'Sog\'liq' },
  { value: 'SOCIAL', label: 'Ijtimoiy' },
  { value: 'LEGAL', label: 'Huquqiy' },
  { value: 'OTHER', label: 'Boshqa' },
];

export default function AppealsPage() {
  const [data, setData] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchAppeals = async (page = 1) => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (search) params.search = search;
      const { data: res } = await api.get('/appeals', { params });
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

  useEffect(() => { fetchAppeals(); }, [statusFilter, categoryFilter, priorityFilter]);

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'title', label: 'Sarlavha', render: (item: any) => (
      <Link href={`/appeals/${item.id}`} className="text-blue-600 hover:underline font-medium">{item.title}</Link>
    )},
    { key: 'category', label: 'Kategoriya', render: (item: any) => {
      const cat = categories.find(c => c.value === item.category);
      return cat?.label || item.category;
    }},
    { key: 'status', label: 'Status', render: (item: any) => <StatusBadge status={item.status} /> },
    { key: 'priority', label: 'Muhimlik', render: (item: any) => <PriorityBadge priority={item.priority} /> },
    { key: 'applicant', label: 'Murojaat qiluvchi', render: (item: any) => item.applicant?.fullName || item.youth?.fullName || '-' },
    { key: 'assignee', label: "Mas'ul", render: (item: any) => item.assignee?.fullName || item.assignedTo?.fullName || '-' },
    { key: 'region', label: 'Hudud', render: (item: any) => item.region?.nameUz || '-' },
    { key: 'createdAt', label: 'Sana', render: (item: any) => formatDate(item.createdAt) },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Murojaatlar</h1>
        <div className="flex items-center gap-3">
          <ExportButton
            onExportExcel={() => toast.success('Excel eksport')}
            onExportPdf={() => toast.success('PDF eksport')}
          />
          <Link href="/appeals/create"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            <Plus className="w-4 h-4" /> Yangi murojaat
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Qidirish..."
            className="pl-9 pr-4 py-2 border rounded-lg text-sm w-64 outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => e.key === 'Enter' && fetchAppeals(1)} />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm">
          <option value="">Barcha statuslar</option>
          <option value="NEW">Yangi</option>
          <option value="IN_PROGRESS">Jarayonda</option>
          <option value="RESOLVED">Hal qilingan</option>
          <option value="REJECTED">Rad etilgan</option>
          <option value="CLOSED">Yopilgan</option>
        </select>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm">
          {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm">
          <option value="">Barcha muhimlik</option>
          <option value="LOW">Past</option>
          <option value="MEDIUM">O&apos;rta</option>
          <option value="HIGH">Yuqori</option>
          <option value="URGENT">Shoshilinch</option>
        </select>
      </div>

      <DataTable columns={columns} data={data} isLoading={loading} />
      <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={fetchAppeals} />
    </div>
  );
}
