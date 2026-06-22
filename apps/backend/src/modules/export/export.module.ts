import { Module, Global } from '@nestjs/common';
import { ExcelService } from './excel.service';
import { PdfService } from './pdf.service';

@Global()
@Module({
  providers: [ExcelService, PdfService],
  exports: [ExcelService, PdfService],
})
export class ExportModule {}
