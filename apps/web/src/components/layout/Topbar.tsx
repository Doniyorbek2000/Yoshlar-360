'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { roleLabels } from '@/lib/utils';
import api from '@/lib/api';
import { Bell, Search } from 'lucide-react';

export default function Topbar() {
  const { user } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    api.get('/notifications/unread-count')
      .then(res => {
        const count = res.data.data;
        setUnreadCount(typeof count === 'number' ? count : count?.count || 0);
      })
      .catch(() => {});
  }, []);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-sm text-gray-500">
          {user?.region?.nameUz && `${user.region.nameUz}`}
          {user?.district?.nameUz && ` / ${user.district.nameUz}`}
          {user?.mahalla?.nameUz && ` / ${user.mahalla.nameUz}`}
        </h2>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={() => setSearchOpen(!searchOpen)}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
          <Search className="w-5 h-5" />
        </button>
        <Link href="/notifications" className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>
        <div className="h-8 w-px bg-gray-200" />
        <Link href="/profile" className="flex items-center gap-3 hover:bg-gray-50 rounded-lg px-2 py-1">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-blue-700">{user?.fullName?.[0]}</span>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium text-gray-700">{user?.fullName}</p>
            <p className="text-xs text-gray-500">{user?.role && roleLabels[user.role]}</p>
          </div>
        </Link>
      </div>
    </header>
  );
}
