import { cn, priorityLabels, priorityColors } from '@/lib/utils';

export default function PriorityBadge({ priority }: { priority: string }) {
  return (
    <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium', priorityColors[priority] || 'bg-gray-100 text-gray-800')}>
      {priorityLabels[priority] || priority}
    </span>
  );
}
