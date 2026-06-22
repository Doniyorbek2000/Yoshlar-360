'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import DataTable from '@/components/ui/DataTable';
import Pagination from '@/components/ui/Pagination';
import StatusBadge from '@/components/ui/StatusBadge';
import ExportButton from '@/components/ui/ExportButton';
import StatsCard from '@/components/ui/StatsCard';
import { formatDate } from '@/lib/utils';
import { Plus, Search, Filter, Upload, Download, Users, UserCheck, UserX, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function YouthPage() {
  const [data, setData] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [educationFilter, setEducationFilter] = useState('');
  const [employmentFilter, setEmploymentFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [ageFrom, setAgeFrom] = useState('');
  const [ageTo, setAgeTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [regions, setRegions] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, employed: 0, unemployed: 0, atRisk: 0 });

  const fetchYouth = async (page = 1) => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (search) params.search = search;
      if (genderFilter) params.gender = genderFilter;
      if (educationFilter) params.education = educationFilter;
      if (employmentFilter) params.employmentStatus = employmentFilter;
      if (riskFilter) params.riskLevel = riskFilter;
      if (regionFilter) params.regionId = regionFilter;
      if (ageFrom) params.ageFrom = ageFrom;
      if (ageTo) params.ageTo = ageTo;
      const { data: res } = await api.get('/youth', { params });
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
    fetchYouth();
    api.get('/regions').then(res => {
      const r = res.data.data;
      setRegions(Array.isArray(r) ? r : r?.data || []);
    }).catch(() => {});
    api.get('/youth/stats').then(res => {
      if (res.data.data) setStats(prev => ({ ...prev, ...res.data.data }));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    fetchYouth();
  }, [genderFilter, educationFilter, employmentFilter, riskFilter, regionFilter]);

  const getRiskBadge = (level: string) => {
    const colors: Record<string, string> = {
      LOW: 'bg-green-100 text-green-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      HIGH: 'bg-orange-100 text-orange-800',
      CRITICAL: 'bg-red-100 text-red-800',
    };
    const labels: Record<string, string> = {
      LOW: 'Past', MEDIUM: "O'rta", HIGH: 'Yuqori', CRITICAL: 'Juda yuqori',
    };
    return <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[level] || 'bg-gray-100 text-gray-800'}`}>{labels[level] || level}</span>;
  };

  const columns = [
    { key: 'fullName', label: 'F.I.O.', render: (item: any) => (
      <Link href={`/youth/${item.id}`} className="text-blue-600 hover:underline font-medium">
        {item.user?.fullName || item.fullName || '-'}
      </Link>
    )},
    { key: 'phone', label: 'Telefon', render: (item: any) => item.user?.phone || item.phone || '-' },
    { key: 'gender', label: 'Jinsi', render: (item: any) => (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${item.gender === 'MALE' ? 'bg-blue-50 text-blue-700' : item.gender === 'FEMALE' ? 'bg-pink-50 text-pink-700' : 'bg-gray-50 text-gray-700'}`}>
        {item.gender === 'MALE' ? 'Erkak' : item.gender === 'FEMALE' ? 'Ayol' : '-'}
      </span>
    )},
    { key: 'birthDate', label: 'Yoshi', render: (item: any) => {
      if (!item.birthDate) return '-';
      const age = Math.floor((Date.now() - new Date(item.birthDate).getTime()) / 31557600000);
      return `${age} yosh`;
    }},
    { key: 'education', label: "Ta'lim", render: (item: any) => {
      const labels: Record<string, string> = {
        SECONDARY: "O'rta", HIGHER: 'Oliy', VOCATIONAL: 'Kasb-hunar', INCOMPLETE_HIGHER: "Tugallanmagan oliy", NONE: "Yo'q",
      };
      return labels[item.education] || item.education || '-';
    }},
    { key: 'employmentStatus', label: 'Bandlik', render: (item: any) => {
      const labels: Record<string, string> = {
        EMPLOYED: 'Band', UNEMPLOYED: 'Ishsiz', STUDENT: 'Talaba', SELF_EMPLOYED: 'Yakka tartibdagi',
      };
      const colors: Record<string, string> = {
        EMPLOYED: 'bg-green-100 text-green-800', UNEMPLOYED: 'bg-red-100 text-red-800',
        STUDENT: 'bg-blue-100 text-blue-800', SELF_EMPLOYED: 'bg-purple-100 text-purple-800',
      };
      return <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[item.employmentStatus] || 'bg-gray-100 text-gray-800'}`}>
        {labels[item.employmentStatus] || item.employmentStatus || '-'}
      </span>;
    }},
    { key: 'riskLevel', label: 'Risk', render: (item: any) => getRiskBadge(item.riskLevel || 'LOW') },
    { key: 'region', label: 'Hudud', render: (item: any) => item.user?.region?.nameUz || item.region?.nameUz || '-' },
    { key: 'createdAt', label: 'Sana', render: (item: any) => formatDate(item.createdAt) },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Yoshlar bazasi</h1>
          <p className="text-sm text-gray-500 mt-1">Yoshlar ma'lumotlari boshqaruvi</p>
        </div>
        <div className="flex items-center gap-3">
          <ExportButton
            onExportExcel={() => toast.success('Excel eksport')}
            onExportPdf={() => toast.success('PDF eksport')}
          />
          <Link href="/youth/create"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            <Plus className="w-4 h-4" /> Yangi yosh
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Jami yoshlar" value={stats.total || meta.total} icon={Users} color="text-blue-600" />
        <StatsCard title="Band" value={stats.employed} icon={UserCheck} color="text-green-600" />
        <StatsCard title="Ishsiz" value={stats.unemployed} icon={UserX} color="text-red-600" />
        <StatsCard title="Risk guruhida" value={stats.atRisk} icon={AlertTriangle} color="text-orange-600" />
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Ism, telefon, passport..."
            className="pl-9 pr-4 py-2 border rounded-lg text-sm w-72 outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => e.key === 'Enter' && fetchYouth(1)} />
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm ${showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>
          <Filter className="w-4 h-4" /> Filtrlar
        </button>
        <button onClick={() => fetchYouth(1)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Qidirish</button>
      </div>

      {showFilters && (
        <div className="bg-gray-50 rounded-lg border p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <select value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm bg-white">
              <option value="">Jins</option>
              <option value="MALE">Erkak</option>
              <option value="FEMALE">Ayol</option>
            </select>
            <select value={educationFilter} onChange={(e) => setEducationFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm bg-white">
              <option value="">Ta'lim</option>
              <option value="SECONDARY">O'rta</option>
              <option value="VOCATIONAL">Kasb-hunar</option>
              <option value="HIGHER">Oliy</option>
              <option value="INCOMPLETE_HIGHER">Tugallanmagan oliy</option>
              <option value="NONE">Yo'q</option>
            </select>
            <select value={employmentFilter} onChange={(e) => setEmploymentFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm bg-white">
              <option value="">Bandlik</option>
              <option value="EMPLOYED">Band</option>
              <option value="UNEMPLOYED">Ishsiz</option>
              <option value="STUDENT">Talaba</option>
              <option value="SELF_EMPLOYED">Yakka tartibdagi</option>
            </select>
            <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm bg-white">
              <option value="">Risk darajasi</option>
              <option value="LOW">Past</option>
              <option value="MEDIUM">O'rta</option>
              <option value="HIGH">Yuqori</option>
              <option value="CRITICAL">Juda yuqori</option>
            </select>
            <select value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm bg-white">
              <option value="">Viloyat</option>
              {regions.map((r: any) => <option key={r.id} value={r.id}>{r.nameUz}</option>)}
            </select>
            <div className="flex items-center gap-1">
              <input type="number" value={ageFrom} onChange={(e) => setAgeFrom(e.target.value)} placeholder="Yosh dan"
                className="px-2 py-2 border rounded-lg text-sm w-20 bg-white" min={14} max={35} />
              <span className="text-gray-400">-</span>
              <input type="number" value={ageTo} onChange={(e) => setAgeTo(e.target.value)} placeholder="gacha"
                className="px-2 py-2 border rounded-lg text-sm w-20 bg-white" min={14} max={35} />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={() => { setGenderFilter(''); setEducationFilter(''); setEmploymentFilter(''); setRiskFilter(''); setRegionFilter(''); setAgeFrom(''); setAgeTo(''); }}
              className="text-sm text-gray-500 hover:text-gray-700">Tozalash</button>
          </div>
        </div>
      )}

      <DataTable columns={columns} data={data} isLoading={loading} />
      <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={fetchYouth} />
    </div>
  );
}
