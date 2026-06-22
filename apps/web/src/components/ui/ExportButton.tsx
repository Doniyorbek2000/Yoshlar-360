'use client';

import { useState } from 'react';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';

interface ExportButtonProps {
  onExportExcel?: () => void;
  onExportPdf?: () => void;
}

export default function ExportButton({ onExportExcel, onExportPdf }: ExportButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 text-sm font-medium">
        <Download className="w-4 h-4" /> Export
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 bg-white border rounded-lg shadow-lg py-1 z-20 min-w-[160px]">
            {onExportExcel && (
              <button onClick={() => { onExportExcel(); setOpen(false); }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <FileSpreadsheet className="w-4 h-4 text-green-600" /> Excel
              </button>
            )}
            {onExportPdf && (
              <button onClick={() => { onExportPdf(); setOpen(false); }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <FileText className="w-4 h-4 text-red-600" /> PDF
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
