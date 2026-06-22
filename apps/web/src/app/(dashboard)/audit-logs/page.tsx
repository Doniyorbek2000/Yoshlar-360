'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import DataTable from '@/components/ui/DataTable';
import Pagination from '@/components/ui/Pagination';
import { formatDate } from '@/lib/utils';
import { Shield, Search, Filter, Calendar, Monitor, User, Activity } from 'lucide-react';

export default function AuditLogsPage() {
  const [data, setData] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const fetchLogs = async (page = 1) => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (search) params.search = search;
      if (actionFilter) params.action = actionFilter;
      if (entityFilter) params.entity = entityFilter;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      const { data: res } = await api.get('/audit-logs', { params });
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

  useEffect(() => { fetchLogs(); }, [actionFilter, entityFilter]);

  const getActionBadge = (action: string) => {
    const colors: Record<string, string> = {
      CREATE: 'bg-green-100 text-green-800',
      UPDATE: 'bg-blue-100 text-blue-800',
      DELETE: 'bg-red-100 text-red-800',
      LOGIN: 'bg-purple-100 text-purple-800',
      LOGOUT: 'bg-gray-100 text-gray-800',
      EXPORT: 'bg-yellow-100 text-yellow-800',
      IMPORT: 'bg-indigo-100 text-indigo-800',
    };
    return <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[action] || 'bg-gray-100 text-gray-800'}`}>{action}</span>;
  };

  const columns = [
    { key: 'id', label: 'ID', render: (item: any) => <span className="text-gray-400 text-xs">#{item.id}</span> },
    { key: 'user', label: 'Foydalanuvchi', render: (item: any) => (
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center">
          <User className="w-3.5 h-3.5 text-gray-500" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{item.user?.fullName || 'System'}</p>
          <p className="text-xs text-gray-400">{item.user?.email || ''}</p>
        </div>
      </div>
    )},
    { key: 'action', label: 'Amal', render: (item: any) => getActionBadge(item.action) },
    { key: 'entity', label: "Ob'ekt", render: (item: any) => (
      <div>
        <span className="font-medium text-gray-700">{item.entity}</span>
        {item.entityId && <span className="text-gray-400 text-xs ml-1">#{item.entityId}</span>}
      </div>
    )},
    { key: 'details', label: 'Tafsilot', render: (item: any) => (
      <span className="text-sm text-gray-500 max-w-xs truncate block">{item.details || item.description || '-'}</span>
    )},
    { key: 'ipAddress', label: 'IP', render: (item: any) => (
      <span className="text-xs text-gray-500 font-mono">{item.ipAddress || '-'}</span>
    )},
    { key: 'userAgent', label: 'Qurilma', render: (item: any) => {
      if (!item.userAgent) return '-';
      const ua = item.userAgent;
      if (ua.includes('Mobile')) return <span title="Mobil"><Monitor className="w-4 h-4 text-gray-400" /></span>;
      return <span title="Desktop"><Monitor className="w-4 h-4 text-gray-400" /></span>;
    }},
    { key: 'createdAt', label: 'Sana', render: (item: any) => (
      <div>
        <p className="text-sm">{formatDate(item.createdAt)}</p>
        <p className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleTimeString('uz-UZ')}</p>
      </div>
    )},
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-gray-600" /> Audit log
          </h1>
          <p className="text-sm text-gray-500 mt-1">Tizimda bajarilgan barcha amallar qaydlari</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Foydalanuvchi, amal..."
            className="pl-9 pr-4 py-2 border rounded-lg text-sm w-64 outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => e.key === 'Enter' && fetchLogs(1)} />
        </div>
        <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm">
          <option value="">Barcha amallar</option>
          <option value="CREATE">Yaratish</option>
          <option value="UPDATE">Yangilash</option>
          <option value="DELETE">O'chirish</option>
          <option value="LOGIN">Kirish</option>
          <option value="LOGOUT">Chiqish</option>
          <option value="EXPORT">Eksport</option>
          <option value="IMPORT">Import</option>
        </select>
        <select value={entityFilter} onChange={(e) => setEntityFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm">
          <option value="">Barcha modullar</option>
          <option value="USER">Foydalanuvchi</option>
          <option value="APPEAL">Murojaat</option>
          <option value="TASK">Vazifa</option>
          <option value="YOUTH">Yosh</option>
          <option value="PROBLEM">Muammo</option>
          <option value="REPORT">Hisobot</option>
          <option value="NOTIFICATION">Bildirishnoma</option>
          <option value="SETTING">Sozlama</option>
        </select>
        <button onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm ${showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>
          <Filter className="w-4 h-4" /> Qo'shimcha
        </button>
      </div>

      {showFilters && (
        <div className="bg-gray-50 rounded-lg border p-4 flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Sana (dan)</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm bg-white" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Sana (gacha)</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm bg-white" />
          </div>
          <button onClick={() => fetchLogs(1)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Qo'llash</button>
          <button onClick={() => { setDateFrom(''); setDateTo(''); setActionFilter(''); setEntityFilter(''); setSearch(''); }}
            className="px-4 py-2 text-gray-500 text-sm hover:text-gray-700">Tozalash</button>
        </div>
      )}

      <DataTable columns={columns} data={data} isLoading={loading} />
      <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={fetchLogs} />
    </div>
  );
}
