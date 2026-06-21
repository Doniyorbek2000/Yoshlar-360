'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';
import {
  LayoutDashboard, Users, UserCheck, MessageSquare, AlertTriangle,
  ListTodo, BarChart3, FileText, Upload, Bell, Shield, LogOut
} from 'lucide-react';

const menuItems = [
  { href: '/dashboard', label: 'Boshqaruv paneli', icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'REPUBLIC_ADMIN', 'REGION_ADMIN', 'DISTRICT_ADMIN', 'MAHALLA_LEADER'] },
  { href: '/users', label: 'Foydalanuvchilar', icon: Users, roles: ['SUPER_ADMIN', 'REPUBLIC_ADMIN', 'REGION_ADMIN', 'DISTRICT_ADMIN', 'MAHALLA_LEADER'] },
  { href: '/youth', label: 'Yoshlar', icon: UserCheck, roles: ['SUPER_ADMIN', 'REPUBLIC_ADMIN', 'REGION_ADMIN', 'DISTRICT_ADMIN', 'MAHALLA_LEADER'] },
  { href: '/appeals', label: 'Murojaatlar', icon: MessageSquare, roles: ['SUPER_ADMIN', 'REPUBLIC_ADMIN', 'REGION_ADMIN', 'DISTRICT_ADMIN', 'MAHALLA_LEADER', 'MODERATOR', 'YOUTH'] },
  { href: '/problems', label: 'Muammolar', icon: AlertTriangle, roles: ['SUPER_ADMIN', 'REPUBLIC_ADMIN', 'REGION_ADMIN', 'DISTRICT_ADMIN', 'MAHALLA_LEADER', 'MODERATOR'] },
  { href: '/tasks', label: 'Vazifalar', icon: ListTodo, roles: ['SUPER_ADMIN', 'REPUBLIC_ADMIN', 'REGION_ADMIN', 'DISTRICT_ADMIN', 'MAHALLA_LEADER', 'MODERATOR'] },
  { href: '/kpi', label: 'KPI', icon: BarChart3, roles: ['SUPER_ADMIN', 'REPUBLIC_ADMIN', 'REGION_ADMIN', 'DISTRICT_ADMIN'] },
  { href: '/reports', label: 'Hisobotlar', icon: FileText, roles: ['SUPER_ADMIN', 'REPUBLIC_ADMIN', 'REGION_ADMIN', 'DISTRICT_ADMIN'] },
  { href: '/imports', label: 'Import', icon: Upload, roles: ['SUPER_ADMIN', 'REPUBLIC_ADMIN', 'REGION_ADMIN', 'DISTRICT_ADMIN'] },
  { href: '/notifications', label: 'Bildirishnomalar', icon: Bell, roles: ['SUPER_ADMIN', 'REPUBLIC_ADMIN', 'REGION_ADMIN', 'DISTRICT_ADMIN', 'MAHALLA_LEADER', 'MODERATOR', 'YOUTH'] },
  { href: '/audit-logs', label: 'Audit log', icon: Shield, roles: ['SUPER_ADMIN', 'REPUBLIC_ADMIN'] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const filteredMenu = menuItems.filter((item) => user && item.roles.includes(user.role));

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-primary-700">Yoshlar 360</h1>
        <p className="text-xs text-gray-500 mt-1">Boshqaruv tizimi</p>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {filteredMenu.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link key={item.href} href={item.href}
              className={cn('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}>
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-gray-200">
        <div className="px-3 py-2 mb-2">
          <p className="text-sm font-medium text-gray-900 truncate">{user?.fullName}</p>
          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
        </div>
        <button onClick={() => logout()} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
          <LogOut className="w-5 h-5" />
          Chiqish
        </button>
      </div>
    </aside>
  );
}
