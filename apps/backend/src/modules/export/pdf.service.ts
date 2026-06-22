import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class PdfService {
  constructor(private prisma: PrismaService) {}

  async generateReport(options: { type: string; regionId?: number; quarter?: number; year?: number }): Promise<Buffer> {
    const PDFDocument = require('pdfkit');

    return new Promise(async (resolve) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Header
      doc.fontSize(16).font('Helvetica-Bold').text("O'ZBEKISTON RESPUBLIKASI", { align: 'center' });
      doc.fontSize(14).text("YOSHLAR ISHLARI AGENTLIGI", { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).font('Helvetica-Bold').text('YOSHLAR 360 - HISOBOT', { align: 'center' });
      doc.moveDown();

      const year = options.year || new Date().getFullYear();

      if (options.type === 'quarterly') {
        const quarter = options.quarter || Math.ceil((new Date().getMonth() + 1) / 3);
        doc.fontSize(11).font('Helvetica').text(`${year}-yil ${quarter}-chorak hisoboti`, { align: 'center' });
        doc.moveDown(2);

        const where: any = {};
        if (options.regionId) where.regionId = options.regionId;

        const startMonth = (quarter - 1) * 3;
        const startDate = new Date(year, startMonth, 1);
        const endDate = new Date(year, startMonth + 3, 0);

        const [totalYouth, totalAppeals, resolvedAppeals, totalEvents, totalProblems] = await Promise.all([
          this.prisma.user.count({ where: { ...where, role: 'YOUTH' } }),
          this.prisma.appeal.count({ where: { ...where, createdAt: { gte: startDate, lte: endDate } } }),
          this.prisma.appeal.count({ where: { ...where, status: 'RESOLVED', createdAt: { gte: startDate, lte: endDate } } }),
          this.prisma.event.count({ where: { ...where, startDate: { gte: startDate, lte: endDate } } }),
          this.prisma.problem.count({ where: { ...where, createdAt: { gte: startDate, lte: endDate } } }),
        ]);

        doc.font('Helvetica-Bold').text('Asosiy ko\'rsatkichlar:');
        doc.moveDown(0.5);
        doc.font('Helvetica');
        doc.text(`  Jami yoshlar soni: ${totalYouth}`);
        doc.text(`  Jami murojaatlar: ${totalAppeals}`);
        doc.text(`  Hal qilingan murojaatlar: ${resolvedAppeals}`);
        doc.text(`  O'tkazilgan tadbirlar: ${totalEvents}`);
        doc.text(`  Aniqlangan muammolar: ${totalProblems}`);
        if (totalAppeals > 0) {
          doc.text(`  Hal qilish foizi: ${((resolvedAppeals / totalAppeals) * 100).toFixed(1)}%`);
        }
      } else {
        doc.fontSize(11).font('Helvetica').text(`${year}-yil yillik hisoboti`, { align: 'center' });
        doc.moveDown(2);

        const where: any = {};
        if (options.regionId) where.regionId = options.regionId;
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31);

        const [totalYouth, totalAppeals, resolvedAppeals, totalEvents, totalTasks, doneTasks] = await Promise.all([
          this.prisma.user.count({ where: { ...where, role: 'YOUTH' } }),
          this.prisma.appeal.count({ where: { ...where, createdAt: { gte: startDate, lte: endDate } } }),
          this.prisma.appeal.count({ where: { ...where, status: 'RESOLVED', createdAt: { gte: startDate, lte: endDate } } }),
          this.prisma.event.count({ where: { ...where, startDate: { gte: startDate, lte: endDate } } }),
          this.prisma.task.count({ where: { createdAt: { gte: startDate, lte: endDate } } }),
          this.prisma.task.count({ where: { status: 'DONE', createdAt: { gte: startDate, lte: endDate } } }),
        ]);

        doc.font('Helvetica-Bold').text('Yillik ko\'rsatkichlar:');
        doc.moveDown(0.5);
        doc.font('Helvetica');
        doc.text(`  Jami yoshlar soni: ${totalYouth}`);
        doc.text(`  Jami murojaatlar: ${totalAppeals}`);
        doc.text(`  Hal qilingan murojaatlar: ${resolvedAppeals}`);
        doc.text(`  O'tkazilgan tadbirlar: ${totalEvents}`);
        doc.text(`  Jami vazifalar: ${totalTasks}`);
        doc.text(`  Bajarilgan vazifalar: ${doneTasks}`);
      }

      doc.moveDown(3);
      doc.fontSize(9).text(`Hisobot sanasi: ${new Date().toLocaleDateString('uz-UZ')}`, { align: 'right' });
      doc.text('Yoshlar 360 tizimi orqali avtomatik shakllangan', { align: 'right' });

      doc.end();
    });
  }
}
