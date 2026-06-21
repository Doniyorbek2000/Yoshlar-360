'use client';

import { useEffect, useState, useRef } from 'react';
import api from '@/lib/api';
import DataTable from '@/components/ui/DataTable';
import Pagination from '@/components/ui/Pagination';
import { formatDate } from '@/lib/utils';
import { Upload } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ImportsPage() {
  const [data, setData] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchImports = async (page = 1) => {
    setLoading(true);
    try {
      const { data: res } = await api.get('/imports', { params: { page, limit: 20 } });
      setData(res.data.data);
      setMeta(res.data.meta);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchImports(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'fileName', label: 'Fayl nomi' },
    { key: 'type', label: 'Turi', render: (item: any) => item.type || '-' },
    { key: 'status', label: 'Holat', render: (item: any) => (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
        item.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
        item.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-800' :
        item.status === 'FAILED' ? 'bg-red-100 text-red-800' :
        'bg-gray-100 text-gray-800'
      }`}>
        {item.status === 'COMPLETED' ? 'Tayyor' :
         item.status === 'PROCESSING' ? 'Jarayonda' :
         item.status === 'FAILED' ? 'Xatolik' :
         item.status === 'PENDING' ? 'Kutilmoqda' : item.status}
      </span>
    )},
    { key: 'totalRows', label: 'Jami qatorlar', render: (item: any) => item.totalRows || 0 },
    { key: 'successRows', label: 'Muvaffaqiyatli', render: (item: any) => item.successRows || 0 },
    { key: 'errorRows', label: 'Xatoliklar', render: (item: any) => item.errorRows || 0 },
    { key: 'createdBy', label: 'Yuklagan', render: (item: any) => item.createdBy?.fullName || '-' },
    { key: 'createdAt', label: 'Sana', render: (item: any) => formatDate(item.createdAt) },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Import</h1>
        <div>
          <input type="file" ref={fileInputRef} onChange={handleUpload} accept=".xlsx,.xls,.csv" className="hidden" />
          <button onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">
            <Upload className="w-4 h-4" /> Fayl yuklash
          </button>
        </div>
      </div>
      <DataTable columns={columns} data={data} isLoading={loading} />
      <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={fetchImports} />
    </div>
  );
}
