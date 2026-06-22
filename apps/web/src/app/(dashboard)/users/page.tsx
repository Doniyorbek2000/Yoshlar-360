'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import DataTable from '@/components/ui/DataTable';
import Pagination from '@/components/ui/Pagination';
import RoleBadge from '@/components/ui/RoleBadge';
import { Plus, Search, Filter, UserPlus, ToggleLeft, ToggleRight, Key } from 'lucide-react';
import toast from 'react-hot-toast';

const roles = [
  { value: '', label: 'Barcha rollar' },
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
  { value: 'REPUBLIC_ADMIN', label: 'Respublika Admin' },
  { value: 'REGION_ADMIN', label: 'Viloyat Admin' },
  { value: 'DISTRICT_ADMIN', label: 'Tuman Admin' },
  { value: 'MAHALLA_LEADER', label: 'Mahalla yetakchisi' },
  { value: 'YOUTH', label: 'Yoshlar' },
  { value: 'MODERATOR', label: 'Moderator' },
];

export default function UsersPage() {
  const [data, setData] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUser, setNewUser] = useState({ fullName: '', email: '', password: '', role: 'YOUTH', phone: '' });

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      const { data: res } = await api.get('/users', { params });
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

  useEffect(() => { fetchUsers(); }, [roleFilter]);

  const toggleActive = async (userId: number, isActive: boolean) => {
    try {
      await api.put(`/users/${userId}`, { isActive: !isActive });
      toast.success(isActive ? 'Foydalanuvchi nofaol qilindi' : 'Foydalanuvchi faollashtirildi');
      fetchUsers(meta.page);
    } catch {
      toast.error('Xatolik');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/users', newUser);
      toast.success('Foydalanuvchi yaratildi');
      setShowCreateForm(false);
      setNewUser({ fullName: '', email: '', password: '', role: 'YOUTH', phone: '' });
      fetchUsers();
    } catch {
      toast.error('Xatolik');
    }
  };

  const columns = [
    { key: 'fullName', label: 'F.I.O.' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Telefon', render: (item: any) => item.phone || '-' },
    { key: 'role', label: 'Rol', render: (item: any) => <RoleBadge role={item.role} /> },
    { key: 'region', label: 'Viloyat', render: (item: any) => item.region?.nameUz || '-' },
    { key: 'isActive', label: 'Holat', render: (item: any) => (
      <button onClick={() => toggleActive(item.id, item.isActive)}
        className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
          item.isActive ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'
        }`}>
        {item.isActive ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
        {item.isActive ? 'Faol' : 'Nofaol'}
      </button>
    )},
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Foydalanuvchilar</h1>
        <button onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
          <UserPlus className="w-4 h-4" /> Yangi foydalanuvchi
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Qidirish..."
            className="pl-9 pr-4 py-2 border rounded-lg text-sm w-64 outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => e.key === 'Enter' && fetchUsers(1)} />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm">
          {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
        <button onClick={() => fetchUsers(1)}
          className="px-4 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 flex items-center gap-1">
          <Filter className="w-4 h-4" /> Filtrlash
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Yangi foydalanuvchi</h3>
          <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">F.I.O.</label>
              <input type="text" value={newUser.fullName} onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parol</label>
              <input type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
              <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2">
                {roles.slice(1).map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
              <input type="tel" value={newUser.phone} onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="+998901234567" />
            </div>
            <div className="flex items-end gap-3">
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">Yaratish</button>
              <button type="button" onClick={() => setShowCreateForm(false)}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300">Bekor qilish</button>
            </div>
          </form>
        </div>
      )}

      <DataTable columns={columns} data={data} isLoading={loading} />
      <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={fetchUsers} />
    </div>
  );
}
