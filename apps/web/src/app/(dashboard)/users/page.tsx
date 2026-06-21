'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import DataTable from '@/components/ui/DataTable';
import Pagination from '@/components/ui/Pagination';
import { roleLabels } from '@/lib/utils';
import { Plus } from 'lucide-react';

export default function UsersPage() {
  const [data, setData] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const { data: res } = await api.get('/users', { params: { page, limit: 20, search: search || undefined } });
      setData(res.data.data);
      setMeta(res.data.meta);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const columns = [
    { key: 'fullName', label: 'F.I.O.' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Telefon', render: (item: any) => item.phone || '-' },
    { key: 'role', label: 'Rol', render: (item: any) => (
      <span className="px-2 py-0.5 bg-primary-50 text-primary-700 rounded text-xs font-medium">{roleLabels[item.role] || item.role}</span>
    )},
    { key: 'region', label: 'Viloyat', render: (item: any) => item.region?.nameUz || '-' },
    { key: 'isActive', label: 'Holat', render: (item: any) => (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${item.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        {item.isActive ? 'Faol' : 'Nofaol'}
      </span>
    )},
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Foydalanuvchilar</h1>
        <Link href="/users/create" className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">
          <Plus className="w-4 h-4" /> Yangi
        </Link>
      </div>
      <div className="flex gap-3">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Qidirish..."
          className="px-4 py-2 border rounded-lg text-sm w-64 outline-none focus:ring-2 focus:ring-primary-500"
          onKeyDown={(e) => e.key === 'Enter' && fetchUsers(1)} />
        <button onClick={() => fetchUsers(1)} className="px-4 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200">Qidirish</button>
      </div>
      <DataTable columns={columns} data={data} isLoading={loading} />
      <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={fetchUsers} />
    </div>
  );
}
