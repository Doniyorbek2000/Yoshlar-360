'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import DataTable from '@/components/ui/DataTable';
import Pagination from '@/components/ui/Pagination';
import ExportButton from '@/components/ui/ExportButton';
import StatsCard from '@/components/ui/StatsCard';
import { formatDate } from '@/lib/utils';
import { Plus, Search, Filter, Calendar, MapPin, Users, CalendarCheck, CalendarClock, CalendarX } from 'lucide-react';
import toast from 'react-hot-toast';

const eventTypes: Record<string, string> = {
  SEMINAR: 'Seminar',
  WORKSHOP: 'Ustaxona',
  CONFERENCE: 'Konferensiya',
  SPORT: 'Sport',
  CULTURAL: 'Madaniy',
  VOLUNTEERING: 'Volontyorlik',
  OTHER: 'Boshqa',
};

const eventStatuses: Record<string, string> = {
  DRAFT: 'Qoralama',
  UPCOMING: 'Rejalashtirilgan',
  ONGOING: 'Davom etmoqda',
  COMPLETED: 'Yakunlangan',
  CANCELLED: 'Bekor qilingan',
};

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  UPCOMING: 'bg-blue-100 text-blue-700',
  ONGOING: 'bg-green-100 text-green-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const typeColors: Record<string, string> = {
  SEMINAR: 'bg-purple-50 text-purple-700',
  WORKSHOP: 'bg-orange-50 text-orange-700',
  CONFERENCE: 'bg-indigo-50 text-indigo-700',
  SPORT: 'bg-green-50 text-green-700',
  CULTURAL: 'bg-pink-50 text-pink-700',
  VOLUNTEERING: 'bg-teal-50 text-teal-700',
  OTHER: 'bg-gray-50 text-gray-700',
};

export default function EventsPage() {
  const [data, setData] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [regions, setRegions] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, upcoming: 0, ongoing: 0, completed: 0 });

  const fetchEvents = async (page = 1) => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.type = typeFilter;
      if (regionFilter) params.regionId = regionFilter;
      const { data: res } = await api.get('/events', { params });
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
      toast.error('Tadbirlarni yuklashda xatolik');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
    api.get('/regions').then(res => {
      const r = res.data.data;
      setRegions(Array.isArray(r) ? r : r?.data || []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [statusFilter, typeFilter, regionFilter]);

  useEffect(() => {
    if (data.length > 0) {
      setStats({
        total: meta.total || data.length,
        upcoming: data.filter(e => e.status === 'UPCOMING').length,
        ongoing: data.filter(e => e.status === 'ONGOING').length,
        completed: data.filter(e => e.status === 'COMPLETED').length,
      });
    }
  }, [data, meta.total]);

  const columns = [
    { key: 'title', label: 'Nomi', render: (item: any) => (
      <Link href={`/events/${item.id}`} className="text-blue-600 hover:underline font-medium">
        {item.title}
      </Link>
    )},
    { key: 'type', label: 'Turi', render: (item: any) => (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeColors[item.type] || 'bg-gray-50 text-gray-700'}`}>
        {eventTypes[item.type] || item.type || '-'}
      </span>
    )},
    { key: 'status', label: 'Holat', render: (item: any) => (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[item.status] || 'bg-gray-100 text-gray-700'}`}>
        {eventStatuses[item.status] || item.status || '-'}
      </span>
    )},
    { key: 'startDate', label: 'Boshlanishi', render: (item: any) => item.startDate ? formatDate(item.startDate) : '-' },
    { key: 'endDate', label: 'Tugashi', render: (item: any) => item.endDate ? formatDate(item.endDate) : '-' },
    { key: 'location', label: 'Joylashuv', render: (item: any) => (
      <span className="flex items-center gap-1 text-sm">
        <MapPin className="w-3.5 h-3.5 text-gray-400" />
        {item.location || '-'}
      </span>
    )},
    { key: 'participants', label: 'Ishtirokchilar', render: (item: any) => (
      <span className="flex items-center gap-1 text-sm">
        <Users className="w-3.5 h-3.5 text-gray-400" />
        {item._count?.participants || item.participantsCount || 0}
        {item.maxParticipants ? ` / ${item.maxParticipants}` : ''}
      </span>
    )},
    { key: 'region', label: 'Hudud', render: (item: any) => item.region?.nameUz || '-' },
    { key: 'organizer', label: 'Tashkilotchi', render: (item: any) => item.organizer?.fullName || '-' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tadbirlar</h1>
          <p className="text-sm text-gray-500 mt-1">Yoshlar tadbirlari va uchrashuvlarini boshqarish</p>
        </div>
        <div className="flex items-center gap-3">
          <ExportButton
            onExportExcel={() => toast.success('Excel eksport')}
            onExportPdf={() => toast.success('PDF eksport')}
          />
          <Link href="/events/create"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            <Plus className="w-4 h-4" /> Yangi tadbir
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Jami tadbirlar" value={stats.total} icon={Calendar} color="text-blue-600" />
        <StatsCard title="Rejalashtirilgan" value={stats.upcoming} icon={CalendarClock} color="text-indigo-600" />
        <StatsCard title="Davom etmoqda" value={stats.ongoing} icon={CalendarCheck} color="text-green-600" />
        <StatsCard title="Yakunlangan" value={stats.completed} icon={CalendarX} color="text-emerald-600" />
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tadbir nomi, joylashuv..."
            className="pl-9 pr-4 py-2 border rounded-lg text-sm w-64 outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => e.key === 'Enter' && fetchEvents(1)} />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm">
          <option value="">Barcha holatlar</option>
          {Object.entries(eventStatuses).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm">
          <option value="">Barcha turlar</option>
          {Object.entries(eventTypes).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm">
          <option value="">Barcha hududlar</option>
          {regions.map((r: any) => <option key={r.id} value={r.id}>{r.nameUz}</option>)}
        </select>
        <button onClick={() => fetchEvents(1)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Qidirish</button>
      </div>

      <DataTable columns={columns} data={data} isLoading={loading} />
      <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={fetchEvents} />
    </div>
  );
}
