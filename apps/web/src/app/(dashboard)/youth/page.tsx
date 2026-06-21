'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import DataTable from '@/components/ui/DataTable';
import Pagination from '@/components/ui/Pagination';
import StatusBadge from '@/components/ui/StatusBadge';
import { Plus } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function YouthPage() {
  const [data, setData] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchYouth = async (page = 1) => {
    setLoading(true);
    try {
      const { data: res } = await api.get('/youth', { params: { page, limit: 20, search: search || undefined } });
      setData(res.data.data);
      setMeta(res.data.meta);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchYouth(); }, []);

  const columns = [
    { key: 'user', label: 'F.I.O.', render: (item: any) => item.user?.fullName || '-' },
    { key: 'phone', label: 'Telefon', render: (item: any) => item.user?.phone || '-' },
    { key: 'gender', label: 'Jinsi', render: (item: any) => item.gender === 'MALE' ? 'Erkak' : item.gender === 'FEMALE' ? 'Ayol' : '-' },
    { key: 'education', label: "Ta'lim", render: (item: any) => item.education || '-' },
    { key: 'employmentStatus', label: 'Bandlik', render: (item: any) => item.employmentStatus || '-' },
    { key: 'riskLevel', label: 'Risk darajasi', render: (item: any) => <StatusBadge status={item.riskLevel || 'LOW'} /> },
    { key: 'region', label: 'Hudud', render: (item: any) => item.user?.region?.nameUz || '-' },
    { key: 'createdAt', label: 'Sana', render: (item: any) => formatDate(item.createdAt) },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Yoshlar bazasi</h1>
        <Link href="/youth/create" className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">
          <Plus className="w-4 h-4" /> Yangi yosh
        </Link>
      </div>
      <div className="flex gap-3">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Qidirish (ism, telefon)..."
          className="px-4 py-2 border rounded-lg text-sm w-64 outline-none focus:ring-2 focus:ring-primary-500"
          onKeyDown={(e) => e.key === 'Enter' && fetchYouth(1)} />
        <button onClick={() => fetchYouth(1)} className="px-4 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200">Qidirish</button>
      </div>
      <DataTable columns={columns} data={data} isLoading={loading} />
      <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={fetchYouth} />
    </div>
  );
}
