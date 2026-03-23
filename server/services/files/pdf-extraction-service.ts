import fs from 'fs';
import { PDFParse } from 'pdf-parse';

export async function extractPdfText(filePath: string): Promise<string> {
  const buffer = fs.readFileSync(filePath);
  const parser = new PDFParse({ data: buffer });
  const parsed = await parser.getText();
  return parsed.text?.trim() || '';
}



