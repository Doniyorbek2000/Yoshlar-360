'use client';

import { useEffect, useState, useRef } from 'react';
import api from '@/lib/api';
import DataTable from '@/components/ui/DataTable';
import Pagination from '@/components/ui/Pagination';
import { formatDate } from '@/lib/utils';
import { Upload, Download, FileSpreadsheet, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ImportsPage() {
  const [data, setData] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const fetchImports = async (page = 1) => {
    setLoading(true);
    try {
      const { data: res } = await api.get('/imports', { params: { page, limit: 20 } });
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

  useEffect(() => { fetchImports(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post('/imports/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Fayl muvaffaqiyatli yuklandi');
      fetchImports();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Yuklashda xatolik');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'PROCESSING': return <Clock className="w-4 h-4 text-yellow-500 animate-spin" />;
      case 'FAILED': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'fileName', label: 'Fayl nomi', render: (item: any) => (
      <div className="flex items-center gap-2">
        <FileSpreadsheet className="w-4 h-4 text-green-600" />
        <span className="font-medium">{item.fileName || '-'}</span>
      </div>
    )},
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
    { key: 'totalRows', label: 'Jami', render: (item: any) => item.totalRows || 0 },
    { key: 'successRows', label: 'Muvaffaqiyatli', render: (item: any) => (
      <span className="text-green-600 font-medium">{item.successRows || 0}</span>
    )},
    { key: 'errorRows', label: 'Xatoliklar', render: (item: any) => (
      <span className={`font-medium ${(item.errorRows || 0) > 0 ? 'text-red-600' : 'text-gray-400'}`}>
        {item.errorRows || 0}
      </span>
    )},
    { key: 'createdBy', label: 'Yuklagan', render: (item: any) => item.createdBy?.fullName || '-' },
    { key: 'createdAt', label: 'Sana', render: (item: any) => formatDate(item.createdAt) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Import</h1>
        <div className="flex items-center gap-3">
          <button onClick={() => toast.success('Template yuklab olinmoqda...')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
            <Download className="w-4 h-4" /> Template
          </button>
          <input type="file" ref={fileInputRef} onChange={handleUpload} accept=".xlsx,.xls,.csv" className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            <Upload className="w-4 h-4" /> {uploading ? 'Yuklanmoqda...' : 'Fayl yuklash'}
          </button>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-blue-500 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-800">Import qoidalari</h4>
            <ul className="text-sm text-blue-700 mt-1 list-disc list-inside space-y-0.5">
              <li>Faqat .xlsx, .xls, .csv formatdagi fayllar qabul qilinadi</li>
              <li>Template faylni yuklab oling va unga mos ravishda to&apos;ldiring</li>
              <li>Xato bo&apos;lgan qatorlar import qilinmaydi, xatolik ro&apos;yxatda ko&apos;rsatiladi</li>
            </ul>
          </div>
        </div>
      </div>

      <DataTable columns={columns} data={data} isLoading={loading} />
      <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={fetchImports} />
    </div>
  );
}
