'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import DataTable from '@/components/ui/DataTable';
import Pagination from '@/components/ui/Pagination';
import StatsCard from '@/components/ui/StatsCard';
import { formatDate } from '@/lib/utils';
import { Download, FileText, Printer, Calendar, Filter, BarChart3, CheckCircle, Clock, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReportsPage() {
  const [data, setData] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [regions, setRegions] = useState<any[]>([]);
  const [generating, setGenerating] = useState(false);

  const fetchReports = async (page = 1) => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (typeFilter) params.type = typeFilter;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      if (regionFilter) params.regionId = regionFilter;
      const { data: res } = await api.get('/reports', { params });
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
    fetchReports();
    api.get('/regions').then(res => {
      const r = res.data.data;
      setRegions(Array.isArray(r) ? r : r?.data || []);
    }).catch(() => {});
  }, [typeFilter]);

  const handleGenerate = async (format: 'EXCEL' | 'PDF') => {
    setGenerating(true);
    try {
      const body: any = { type: typeFilter || 'GENERAL', format };
      if (dateFrom) body.dateFrom = dateFrom;
      if (dateTo) body.dateTo = dateTo;
      if (regionFilter) body.regionId = regionFilter;
      await api.post('/reports/generate', body);
      toast.success(`${format} hisobot yaratilmoqda...`);
      setTimeout(() => fetchReports(), 2000);
    } catch {
      toast.error('Hisobot yaratishda xatolik');
    }
    setGenerating(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'PROCESSING': return <Clock className="w-4 h-4 text-yellow-500 animate-spin" />;
      case 'FAILED': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const completedCount = data.filter(d => d.status === 'COMPLETED').length;
  const processingCount = data.filter(d => d.status === 'PROCESSING').length;

  const reportTypes = [
    { value: '', label: 'Barcha turlar' },
    { value: 'GENERAL', label: 'Umumiy' },
    { value: 'APPEALS', label: 'Murojaatlar' },
    { value: 'PROBLEMS', label: 'Muammolar' },
    { value: 'YOUTH', label: 'Yoshlar' },
    { value: 'KPI', label: 'KPI' },
    { value: 'TASKS', label: 'Vazifalar' },
    { value: 'REGIONAL', label: 'Hududiy' },
  ];

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'title', label: 'Sarlavha', render: (item: any) => (
      <div className="flex items-center gap-2">
        <FileText className="w-4 h-4 text-blue-500" />
        <span className="font-medium">{item.title || '-'}</span>
      </div>
    )},
    { key: 'type', label: 'Turi', render: (item: any) => {
      const t = reportTypes.find(rt => rt.value === item.type);
      return <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">{t?.label || item.type}</span>;
    }},
    { key: 'status', label: 'Holat', render: (item: any) => (
      <div className="flex items-center gap-1.5">
        {getStatusIcon(item.status)}
        <span className={`text-xs font-medium ${
          item.status === 'COMPLETED' ? 'text-green-700' :
          item.status === 'PROCESSING' ? 'text-yellow-700' :
          item.status === 'FAILED' ? 'text-red-700' : 'text-gray-700'
        }`}>
          {item.status === 'COMPLETED' ? 'Tayyor' :
           item.status === 'PROCESSING' ? 'Jarayonda' :
           item.status === 'FAILED' ? 'Xatolik' :
           item.status === 'PENDING' ? 'Kutilmoqda' : item.status}
        </span>
      </div>
    )},
    { key: 'format', label: 'Format', render: (item: any) => (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
        item.format === 'PDF' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
      }`}>{item.format || '-'}</span>
    )},
    { key: 'createdBy', label: 'Yaratuvchi', render: (item: any) => item.createdBy?.fullName || '-' },
    { key: 'createdAt', label: 'Sana', render: (item: any) => formatDate(item.createdAt) },
    { key: 'actions', label: 'Amallar', render: (item: any) => item.fileUrl && item.status === 'COMPLETED' ? (
      <a href={item.fileUrl} target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-blue-600 hover:underline text-sm">
        <Download className="w-4 h-4" /> Yuklab olish
      </a>
    ) : '-' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hisobotlar</h1>
          <p className="text-sm text-gray-500 mt-1">Tizim hisobotlarini yarating va yuklab oling</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handlePrint}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
            <Printer className="w-4 h-4" /> Chop etish
          </button>
          <button onClick={() => handleGenerate('EXCEL')} disabled={generating}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50">
            <Download className="w-4 h-4" /> Excel
          </button>
          <button onClick={() => handleGenerate('PDF')} disabled={generating}
            className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50">
            <Download className="w-4 h-4" /> PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard title="Jami hisobotlar" value={meta.total || data.length} icon={FileText} color="text-blue-600" />
        <StatsCard title="Tayyor" value={completedCount} icon={CheckCircle} color="text-green-600" />
        <StatsCard title="Jarayonda" value={processingCount} icon={Clock} color="text-yellow-600" />
      </div>

      <div className="bg-white rounded-lg border p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Filter className="w-4 h-4" /> Filtrlar
        </h3>
        <div className="flex flex-wrap gap-3">
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm">
            {reportTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <select value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm">
            <option value="">Barcha hududlar</option>
            {regions.map((r: any) => <option key={r.id} value={r.id}>{r.nameUz}</option>)}
          </select>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm" />
            <span className="text-gray-400">—</span>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm" />
          </div>
          <button onClick={() => fetchReports(1)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            Qo'llash
          </button>
        </div>
      </div>

      <DataTable columns={columns} data={data} isLoading={loading} />
      <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={fetchReports} />
    </div>
  );
}
