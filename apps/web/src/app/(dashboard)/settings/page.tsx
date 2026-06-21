'use client';

import { useAuthStore } from '@/store/auth';
import { roleLabels } from '@/lib/utils';

export default function SettingsPage() {
  const { user } = useAuthStore();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Sozlamalar</h1>
      <div className="bg-white rounded-lg border p-6 max-w-2xl">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Profil ma'lumotlari</h2>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b">
            <span className="text-sm text-gray-500">F.I.O.</span>
            <span className="text-sm font-medium">{user?.fullName}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-sm text-gray-500">Email</span>
            <span className="text-sm font-medium">{user?.email}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-sm text-gray-500">Telefon</span>
            <span className="text-sm font-medium">{user?.phone || '-'}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-sm text-gray-500">Rol</span>
            <span className="text-sm font-medium">{user?.role && roleLabels[user.role]}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-sm text-gray-500">Hudud</span>
            <span className="text-sm font-medium">{user?.region?.nameUz || '-'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
