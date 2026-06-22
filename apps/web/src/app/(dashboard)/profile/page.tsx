'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';
import { User, Mail, Phone, MapPin, Building2, Home, Shield, Calendar, Key } from 'lucide-react';
import toast from 'react-hot-toast';

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  REPUBLIC_ADMIN: 'Respublika Admin',
  REGION_ADMIN: 'Viloyat Admin',
  DISTRICT_ADMIN: 'Tuman Admin',
  MAHALLA_LEADER: 'Mahalla yetakchisi',
  YOUTH: 'Yoshlar',
  MODERATOR: 'Moderator',
};

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Parollar mos kelmadi');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Parol kamida 6 belgi bo\'lishi kerak');
      return;
    }
    setSaving(true);
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
      toast.success('Parol o\'zgartirildi');
      setShowPasswordForm(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      toast.error('Xatolik yuz berdi');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Mening profilim</h1>

      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-blue-700">{user.fullName[0]}</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{user.fullName}</h2>
            <span className="inline-block mt-1 text-xs font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
              {roleLabels[user.role] || user.role}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoRow icon={Mail} label="Email" value={user.email} />
          <InfoRow icon={Phone} label="Telefon" value={user.phone || '-'} />
          <InfoRow icon={Shield} label="Rol" value={roleLabels[user.role] || user.role} />
          <InfoRow icon={MapPin} label="Viloyat" value={user.region?.nameUz || '-'} />
          <InfoRow icon={Building2} label="Tuman" value={user.district?.nameUz || '-'} />
          <InfoRow icon={Home} label="Mahalla" value={user.mahalla?.nameUz || '-'} />
        </div>
      </div>

      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Xavfsizlik</h3>
          <button onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
            <Key className="w-4 h-4" /> Parolni o&apos;zgartirish
          </button>
        </div>

        {showPasswordForm && (
          <form onSubmit={handleChangePassword} className="space-y-4 mt-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Joriy parol</label>
              <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Yangi parol</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parolni tasdiqlang</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {saving ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
              <button type="button" onClick={() => setShowPasswordForm(false)}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300">Bekor qilish</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <Icon className="w-5 h-5 text-gray-400 flex-shrink-0" />
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
}
