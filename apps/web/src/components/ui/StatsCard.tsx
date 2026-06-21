import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color?: string;
}

export default function StatsCard({ title, value, icon: Icon, color = 'text-primary-600' }: StatsCardProps) {
  return (
    <div className="bg-white rounded-lg border p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={cn('p-3 rounded-lg bg-gray-50', color)}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
