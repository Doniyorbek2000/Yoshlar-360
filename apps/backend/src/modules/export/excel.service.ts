import { Injectable } from '@nestjs/common';

@Injectable()
export class ExcelService {
  async exportToExcel(columns: { key: string; header: string; width?: number }[], data: any[]): Promise<Buffer> {
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Yoshlar 360';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Ma\'lumotlar');
    sheet.columns = columns.map(col => ({ header: col.header, key: col.key, width: col.width || 20 }));

    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, size: 12 };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };

    data.forEach(item => sheet.addRow(item));

    return workbook.xlsx.writeBuffer() as Promise<Buffer>;
  }
}
