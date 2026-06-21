'use client';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <p className="text-sm text-gray-500">Sahifa {page} / {totalPages}</p>
      <div className="flex gap-2">
        <button disabled={page <= 1} onClick={() => onPageChange(page - 1)}
          className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50 hover:bg-gray-50">
          Oldingi
        </button>
        <button disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}
          className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50 hover:bg-gray-50">
          Keyingi
        </button>
      </div>
    </div>
  );
}
