'use client';

const roleConfig: Record<string, { label: string; className: string }> = {
  SUPER_ADMIN: { label: 'Super Admin', className: 'bg-red-100 text-red-700' },
  REPUBLIC_ADMIN: { label: 'Respublika Admin', className: 'bg-purple-100 text-purple-700' },
  REGION_ADMIN: { label: 'Viloyat Admin', className: 'bg-blue-100 text-blue-700' },
  DISTRICT_ADMIN: { label: 'Tuman Admin', className: 'bg-indigo-100 text-indigo-700' },
  MAHALLA_LEADER: { label: 'Mahalla yetakchisi', className: 'bg-green-100 text-green-700' },
  YOUTH: { label: 'Yoshlar', className: 'bg-yellow-100 text-yellow-700' },
  MODERATOR: { label: 'Moderator', className: 'bg-gray-100 text-gray-700' },
};

export default function RoleBadge({ role }: { role: string }) {
  const config = roleConfig[role] || { label: role, className: 'bg-gray-100 text-gray-700' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}
