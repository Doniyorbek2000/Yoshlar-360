'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatDate } from '@/lib/utils';

export default function YouthDetailPage() {
  const { id } = useParams();
  const [youth, setYouth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/youth/${id}`).then(({ data }) => {
      setYouth(data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center py-10 text-gray-500">Yuklanmoqda...</div>;
  if (!youth) return <div className="text-center py-10 text-gray-500">Yosh topilmadi</div>;

  const info = [
    ['F.I.O.', youth.user?.fullName],
    ['Email', youth.user?.email],
    ['Telefon', youth.user?.phone],
    ["Tug'ilgan sana", youth.birthDate ? formatDate(youth.birthDate) : '-'],
    ['Jinsi', youth.gender === 'MALE' ? 'Erkak' : youth.gender === 'FEMALE' ? 'Ayol' : '-'],
    ['Pasport/PINFL', youth.passportOrPinfl || '-'],
    ["Ta'lim", youth.education || '-'],
    ['Bandlik', youth.employmentStatus || '-'],
    ['Ijtimoiy holat', youth.socialStatus || '-'],
    ['Manzil', youth.address || '-'],
    ['Qiziqishlari', youth.interests || '-'],
    ['Viloyat', youth.user?.region?.nameUz || '-'],
    ['Tuman', youth.user?.district?.nameUz || '-'],
    ['Mahalla', youth.user?.mahalla?.nameUz || '-'],
  ];

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Yosh profili</h1>
        <StatusBadge status={youth.riskLevel || 'LOW'} />
      </div>
      <div className="bg-white rounded-lg border p-6">
        <div className="grid grid-cols-2 gap-4">
          {info.map(([label, value]) => (
            <div key={label} className="py-2 border-b border-gray-100">
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-sm font-medium text-gray-900 mt-0.5">{value || '-'}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
