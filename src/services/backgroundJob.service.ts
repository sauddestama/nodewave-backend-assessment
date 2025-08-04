import { prisma } from '../utils/prisma.utils';
import excelService from './excel.service';
import fs from 'fs';

class BackgroundJobService {
  async processFileUpload(fileId: number, filePath: string): Promise<void> {
    try {
      await prisma.fileUpload.update({
        where: { id: fileId },
        data: { status: 'processing' }
      });

      await new Promise(resolve => setTimeout(resolve, 2000));

      const parsedData = await excelService.parseExcelFile(filePath);
      
      await excelService.processParsedData(fileId, parsedData);

      const processedDataSummary = {
        totalRows: parsedData.length,
        validRows: parsedData.filter(row => row.name || row.email || row.phone || row.company).length,
        columns: ['name', 'email', 'phone', 'company']
      };

      await prisma.fileUpload.update({
        where: { id: fileId },
        data: {
          status: 'completed',
          processedData: processedDataSummary
        }
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown processing error';
      
      await prisma.fileUpload.update({
        where: { id: fileId },
        data: {
          status: 'failed',
          errorMessage
        }
      });

      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (cleanupError) {
        console.error('Failed to cleanup file:', cleanupError);
      }

      throw error;
    }
  }

  startFileProcessing(fileId: number, filePath: string): void {
    setImmediate(async () => {
      try {
        await this.processFileUpload(fileId, filePath);
      } catch (error) {
        console.error(`Background processing failed for file ${fileId}:`, error);
      }
    });
  }
}

export default new BackgroundJobService();