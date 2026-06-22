'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import DataTable from '@/components/ui/DataTable';
import Pagination from '@/components/ui/Pagination';
import StatusBadge from '@/components/ui/StatusBadge';
import PriorityBadge from '@/components/ui/PriorityBadge';
import ExportButton from '@/components/ui/ExportButton';
import { formatDate } from '@/lib/utils';
import { Plus, Search, LayoutList, Columns, Calendar, Filter, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

type ViewMode = 'table' | 'kanban' | 'calendar';

const statusColumns = [
  { key: 'TODO', label: 'Rejada', color: 'bg-gray-100 border-gray-300', icon: Clock },
  { key: 'IN_PROGRESS', label: 'Jarayonda', color: 'bg-yellow-50 border-yellow-300', icon: AlertCircle },
  { key: 'DONE', label: 'Bajarilgan', color: 'bg-green-50 border-green-300', icon: CheckCircle },
  { key: 'CANCELLED', label: 'Bekor', color: 'bg-red-50 border-red-300', icon: AlertCircle },
];

export default function TasksPage() {
  const [data, setData] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  const fetchTasks = async (page = 1) => {
    setLoading(true);
    try {
      const params: any = { page, limit: viewMode === 'kanban' ? 100 : 20 };
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (search) params.search = search;
      const { data: res } = await api.get('/tasks', { params });
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

  useEffect(() => { fetchTasks(); }, [statusFilter, priorityFilter, viewMode]);

  const updateTaskStatus = async (taskId: number, newStatus: string) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      toast.success('Vazifa holati yangilandi');
      fetchTasks(meta.page);
    } catch {
      toast.error('Xatolik');
    }
  };

  const isOverdue = (dueDate: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'title', label: 'Sarlavha', render: (item: any) => (
      <div>
        <Link href={`/tasks/${item.id}`} className="text-blue-600 hover:underline font-medium">{item.title}</Link>
        {isOverdue(item.dueDate) && item.status !== 'DONE' && item.status !== 'CANCELLED' && (
          <span className="ml-2 text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-medium">MUDDATI O'TGAN</span>
        )}
      </div>
    )},
    { key: 'status', label: 'Status', render: (item: any) => <StatusBadge status={item.status} /> },
    { key: 'priority', label: 'Muhimlik', render: (item: any) => <PriorityBadge priority={item.priority} /> },
    { key: 'assignedTo', label: "Mas'ul", render: (item: any) => item.assignedTo?.fullName || '-' },
    { key: 'createdBy', label: 'Yaratuvchi', render: (item: any) => item.createdBy?.fullName || '-' },
    { key: 'dueDate', label: 'Muddat', render: (item: any) => item.dueDate ? (
      <span className={isOverdue(item.dueDate) && item.status !== 'DONE' ? 'text-red-600 font-medium' : ''}>
        {formatDate(item.dueDate)}
      </span>
    ) : '-' },
    { key: 'createdAt', label: 'Yaratilgan', render: (item: any) => formatDate(item.createdAt) },
  ];

  const renderKanban = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statusColumns.map(col => {
        const tasks = data.filter(t => t.status === col.key);
        const Icon = col.icon;
        return (
          <div key={col.key} className={`rounded-lg border-2 ${col.color} p-3`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4" />
                <h3 className="font-semibold text-sm">{col.label}</h3>
              </div>
              <span className="bg-white px-2 py-0.5 rounded-full text-xs font-medium">{tasks.length}</span>
            </div>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {tasks.map(task => (
                <div key={task.id} className="bg-white rounded-lg border p-3 shadow-sm hover:shadow-md transition-shadow">
                  <Link href={`/tasks/${task.id}`} className="text-sm font-medium text-gray-900 hover:text-blue-600">{task.title}</Link>
                  <div className="flex items-center gap-2 mt-2">
                    <PriorityBadge priority={task.priority} />
                    {isOverdue(task.dueDate) && task.status !== 'DONE' && (
                      <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-medium">MUDDATI O'TGAN</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <span>{task.assignedTo?.fullName || '-'}</span>
                    {task.dueDate && <span>{formatDate(task.dueDate)}</span>}
                  </div>
                  {col.key !== 'DONE' && col.key !== 'CANCELLED' && (
                    <div className="flex gap-1 mt-2">
                      {col.key === 'TODO' && (
                        <button onClick={() => updateTaskStatus(task.id, 'IN_PROGRESS')}
                          className="text-[10px] px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200">Boshlash</button>
                      )}
                      {col.key === 'IN_PROGRESS' && (
                        <button onClick={() => updateTaskStatus(task.id, 'DONE')}
                          className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 rounded hover:bg-green-200">Tugatish</button>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {tasks.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">Bo'sh</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderCalendar = () => {
    const today = new Date();
    const month = today.getMonth();
    const year = today.getFullYear();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);

    const getTasksForDay = (day: number) => {
      return data.filter(t => {
        if (!t.dueDate) return false;
        const d = new Date(t.dueDate);
        return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
      });
    };

    const monthNames = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];

    return (
      <div className="bg-white rounded-lg border p-4">
        <h3 className="text-lg font-semibold mb-4">{monthNames[month]} {year}</h3>
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'].map(d => (
            <div key={d} className="bg-gray-50 p-2 text-center text-xs font-medium text-gray-500">{d}</div>
          ))}
          {days.map((day, i) => (
            <div key={i} className={`bg-white p-1 min-h-[80px] ${day === today.getDate() ? 'ring-2 ring-blue-500 ring-inset' : ''}`}>
              {day && (
                <>
                  <span className="text-xs font-medium text-gray-700">{day}</span>
                  <div className="space-y-0.5 mt-0.5">
                    {getTasksForDay(day).slice(0, 3).map(t => (
                      <Link key={t.id} href={`/tasks/${t.id}`}
                        className={`block text-[9px] px-1 py-0.5 rounded truncate ${
                          t.status === 'DONE' ? 'bg-green-100 text-green-700' :
                          isOverdue(t.dueDate) ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>{t.title}</Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Vazifalar</h1>
        <div className="flex items-center gap-3">
          <ExportButton
            onExportExcel={() => toast.success('Excel eksport')}
            onExportPdf={() => toast.success('PDF eksport')}
          />
          <Link href="/tasks/create"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            <Plus className="w-4 h-4" /> Yangi vazifa
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Qidirish..."
            className="pl-9 pr-4 py-2 border rounded-lg text-sm w-64 outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => e.key === 'Enter' && fetchTasks(1)} />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm">
          <option value="">Barcha statuslar</option>
          <option value="TODO">Rejada</option>
          <option value="IN_PROGRESS">Jarayonda</option>
          <option value="DONE">Bajarilgan</option>
          <option value="CANCELLED">Bekor qilingan</option>
        </select>
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm">
          <option value="">Barcha muhimlik</option>
          <option value="LOW">Past</option>
          <option value="MEDIUM">O'rta</option>
          <option value="HIGH">Yuqori</option>
          <option value="URGENT">Shoshilinch</option>
        </select>
        <div className="ml-auto flex items-center bg-gray-100 rounded-lg p-0.5">
          <button onClick={() => setViewMode('table')}
            className={`p-1.5 rounded ${viewMode === 'table' ? 'bg-white shadow-sm' : 'text-gray-500'}`} title="Jadval">
            <LayoutList className="w-4 h-4" />
          </button>
          <button onClick={() => setViewMode('kanban')}
            className={`p-1.5 rounded ${viewMode === 'kanban' ? 'bg-white shadow-sm' : 'text-gray-500'}`} title="Kanban">
            <Columns className="w-4 h-4" />
          </button>
          <button onClick={() => setViewMode('calendar')}
            className={`p-1.5 rounded ${viewMode === 'calendar' ? 'bg-white shadow-sm' : 'text-gray-500'}`} title="Kalendar">
            <Calendar className="w-4 h-4" />
          </button>
        </div>
      </div>

      {viewMode === 'table' && (
        <>
          <DataTable columns={columns} data={data} isLoading={loading} />
          <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={fetchTasks} />
        </>
      )}
      {viewMode === 'kanban' && (loading ? <div className="text-center py-10 text-gray-500">Yuklanmoqda...</div> : renderKanban())}
      {viewMode === 'calendar' && (loading ? <div className="text-center py-10 text-gray-500">Yuklanmoqda...</div> : renderCalendar())}
    </div>
  );
}
