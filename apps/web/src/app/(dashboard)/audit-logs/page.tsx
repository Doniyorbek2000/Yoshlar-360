'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import DataTable from '@/components/ui/DataTable';
import Pagination from '@/components/ui/Pagination';
import { formatDate } from '@/lib/utils';

export default function AuditLogsPage() {
  const [data, setData] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [loading, setLoading] = useState(true);

  const fetchLogs = async (page = 1) => {
    setLoading(true);
    try {
      const { data: res } = await api.get('/audit-logs', { params: { page, limit: 20 } });
      setData(res.data.data);
      setMeta(res.data.meta);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchLogs(); }, []);

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'user', label: 'Foydalanuvchi', render: (item: any) => item.user?.fullName || 'System' },
    { key: 'action', label: 'Amal' },
    { key: 'entity', label: 'Ob\'ekt' },
    { key: 'entityId', label: 'ID', render: (item: any) => item.entityId || '-' },
    { key: 'ipAddress', label: 'IP', render: (item: any) => item.ipAddress || '-' },
    { key: 'createdAt', label: 'Sana', render: (item: any) => formatDate(item.createdAt) },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Audit log</h1>
      <DataTable columns={columns} data={data} isLoading={loading} />
      <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={fetchLogs} />
    </div>
  );
}
