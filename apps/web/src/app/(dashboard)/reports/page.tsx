'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import DataTable from '@/components/ui/DataTable';
import Pagination from '@/components/ui/Pagination';
import { formatDate } from '@/lib/utils';
import { Download } from 'lucide-react';

export default function ReportsPage() {
  const [data, setData] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');

  const fetchReports = async (page = 1) => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (typeFilter) params.type = typeFilter;
      const { data: res } = await api.get('/reports', { params });
      setData(res.data.data);
      setMeta(res.data.meta);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchReports(); }, [typeFilter]);

  const handleGenerate = async () => {
    try {
      await api.post('/reports/generate', { type: typeFilter || 'GENERAL' });
      fetchReports();
    } catch (e) { console.error(e); }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'title', label: 'Sarlavha' },
    { key: 'type', label: 'Turi' },
    { key: 'status', label: 'Holat', render: (item: any) => (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
        item.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
        item.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-800' :
        item.status === 'FAILED' ? 'bg-red-100 text-red-800' :
        'bg-gray-100 text-gray-800'
      }`}>
        {item.status === 'COMPLETED' ? 'Tayyor' :
         item.status === 'PROCESSING' ? 'Jarayonda' :
         item.status === 'FAILED' ? 'Xatolik' :
         item.status === 'PENDING' ? 'Kutilmoqda' : item.status}
      </span>
    )},
    { key: 'createdBy', label: 'Yaratuvchi', render: (item: any) => item.createdBy?.fullName || '-' },
    { key: 'createdAt', label: 'Sana', render: (item: any) => formatDate(item.createdAt) },
    { key: 'actions', label: 'Amallar', render: (item: any) => item.fileUrl ? (
      <a href={item.fileUrl} target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-primary-600 hover:underline text-sm">
        <Download className="w-4 h-4" /> Yuklab olish
      </a>
    ) : '-' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Hisobotlar</h1>
        <button onClick={handleGenerate}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">
          Hisobot yaratish
        </button>
      </div>
      <div className="flex gap-3">
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500">
          <option value="">Barcha turlar</option>
          <option value="GENERAL">Umumiy</option>
          <option value="APPEALS">Murojaatlar</option>
          <option value="PROBLEMS">Muammolar</option>
          <option value="YOUTH">Yoshlar</option>
          <option value="KPI">KPI</option>
        </select>
      </div>
      <DataTable columns={columns} data={data} isLoading={loading} />
      <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={fetchReports} />
    </div>
  );
}
