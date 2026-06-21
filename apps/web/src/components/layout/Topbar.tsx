'use client';

import { useAuthStore } from '@/store/auth';
import { roleLabels } from '@/lib/utils';
import { Bell } from 'lucide-react';

export default function Topbar() {
  const { user } = useAuthStore();
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div>
        <h2 className="text-sm text-gray-500">
          {user?.region?.nameUz && `${user.region.nameUz}`}
          {user?.district?.nameUz && ` / ${user.district.nameUz}`}
          {user?.mahalla?.nameUz && ` / ${user.mahalla.nameUz}`}
        </h2>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-400 hover:text-gray-600">
          <Bell className="w-5 h-5" />
        </button>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-700">{user?.fullName}</p>
          <p className="text-xs text-gray-500">{user?.role && roleLabels[user.role]}</p>
        </div>
      </div>
    </header>
  );
}
