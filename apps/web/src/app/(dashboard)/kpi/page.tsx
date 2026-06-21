'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import DataTable from '@/components/ui/DataTable';
import Pagination from '@/components/ui/Pagination';

export default function KpiPage() {
  const [data, setData] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('');

  const fetchKpi = async (page = 1) => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (period) params.period = period;
      const { data: res } = await api.get('/kpi', { params });
      setData(res.data.data);
      setMeta(res.data.meta);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchKpi(); }, [period]);

  const columns = [
    { key: 'user', label: 'Xodim', render: (item: any) => item.user?.fullName || '-' },
    { key: 'region', label: 'Hudud', render: (item: any) => item.user?.region?.nameUz || '-' },
    { key: 'period', label: 'Davr' },
    { key: 'appealsResolved', label: 'Hal qilingan murojaatlar', render: (item: any) => item.appealsResolved || 0 },
    { key: 'tasksCompleted', label: 'Bajarilgan vazifalar', render: (item: any) => item.tasksCompleted || 0 },
    { key: 'youthEngaged', label: 'Jalb qilingan yoshlar', render: (item: any) => item.youthEngaged || 0 },
    { key: 'score', label: 'Ball', render: (item: any) => (
      <span className={`font-bold ${(item.score || 0) >= 80 ? 'text-green-600' : (item.score || 0) >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
        {item.score || 0}
      </span>
    )},
    { key: 'rank', label: "O'rin", render: (item: any) => item.rank || '-' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">KPI ko&apos;rsatkichlari</h1>
      </div>
      <div className="flex gap-3">
        <select value={period} onChange={(e) => setPeriod(e.target.value)}
          className="px-4 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500">
          <option value="">Barcha davrlar</option>
          <option value="2024-Q1">2024 Q1</option>
          <option value="2024-Q2">2024 Q2</option>
          <option value="2024-Q3">2024 Q3</option>
          <option value="2024-Q4">2024 Q4</option>
          <option value="2025-Q1">2025 Q1</option>
          <option value="2025-Q2">2025 Q2</option>
        </select>
      </div>
      <DataTable columns={columns} data={data} isLoading={loading} />
      <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={fetchKpi} />
    </div>
  );
}
