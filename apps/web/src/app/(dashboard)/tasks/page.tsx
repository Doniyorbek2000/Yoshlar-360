'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import DataTable from '@/components/ui/DataTable';
import Pagination from '@/components/ui/Pagination';
import StatusBadge from '@/components/ui/StatusBadge';
import PriorityBadge from '@/components/ui/PriorityBadge';
import { formatDate } from '@/lib/utils';

export default function TasksPage() {
  const [data, setData] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchTasks = async (page = 1) => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (statusFilter) params.status = statusFilter;
      const { data: res } = await api.get('/tasks', { params });
      setData(res.data.data);
      setMeta(res.data.meta);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchTasks(); }, [statusFilter]);

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'title', label: 'Sarlavha', render: (item: any) => (
      <Link href={`/tasks/${item.id}`} className="text-primary-600 hover:underline font-medium">{item.title}</Link>
    )},
    { key: 'status', label: 'Status', render: (item: any) => <StatusBadge status={item.status} /> },
    { key: 'priority', label: 'Muhimlik', render: (item: any) => <PriorityBadge priority={item.priority} /> },
    { key: 'assignedTo', label: "Mas'ul", render: (item: any) => item.assignedTo?.fullName || '-' },
    { key: 'createdBy', label: 'Yaratuvchi', render: (item: any) => item.createdBy?.fullName || '-' },
    { key: 'dueDate', label: 'Muddat', render: (item: any) => item.dueDate ? formatDate(item.dueDate) : '-' },
    { key: 'createdAt', label: 'Yaratilgan', render: (item: any) => formatDate(item.createdAt) },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Vazifalar</h1>
      </div>
      <div className="flex gap-3">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500">
          <option value="">Barcha statuslar</option>
          <option value="TODO">Rejada</option>
          <option value="IN_PROGRESS">Jarayonda</option>
          <option value="DONE">Bajarilgan</option>
          <option value="CANCELLED">Bekor qilingan</option>
        </select>
      </div>
      <DataTable columns={columns} data={data} isLoading={loading} />
      <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={fetchTasks} />
    </div>
  );
}
