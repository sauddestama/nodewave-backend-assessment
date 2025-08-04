import * as XLSX from 'xlsx';
import { prisma } from '../utils/prisma.utils';

export interface ExcelRowData {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
}

class ExcelService {
  async parseExcelFile(filePath: string): Promise<ExcelRowData[]> {
    try {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      
      if (!sheetName) {
        throw new Error('No sheets found in Excel file');
      }

      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { 
        raw: false,
        defval: null 
      }) as any[];

      return data.map((row: any) => ({
        name: this.extractValue(row, ['name', 'full_name', 'fullname', 'nama', 'Name', 'Full Name']),
        email: this.extractValue(row, ['email', 'Email', 'email_address', 'e-mail']),
        phone: this.extractValue(row, ['phone', 'Phone', 'phone_number', 'mobile', 'Mobile', 'telefon']),
        company: this.extractValue(row, ['company', 'Company', 'organization', 'Organization', 'perusahaan'])
      }));
    } catch (error) {
      throw new Error(`Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private extractValue(row: any, possibleKeys: string[]): string | undefined {
    for (const key of possibleKeys) {
      if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
        return String(row[key]).trim();
      }
    }
    return undefined;
  }

  async processParsedData(fileId: number, data: ExcelRowData[]): Promise<void> {
    const sampleDataToInsert = data
      .filter(row => row.name || row.email || row.phone || row.company)
      .map(row => ({
        fileId,
        name: row.name || null,
        email: row.email || null,
        phone: row.phone || null,
        company: row.company || null
      }));

    if (sampleDataToInsert.length > 0) {
      await prisma.sampleData.createMany({
        data: sampleDataToInsert
      });
    }
  }
}

export default new ExcelService();