// lib/csvParser.ts
import Papa from 'papaparse';

const TARGET_COLUMNS = [
  'CMS', 
  'JavaScript frameworks', 
  'Web servers', 
  'WordPress plugins', 
  'UI frameworks', 
  'Programming languages'
];

export const extractWappalyzerData = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: Papa.ParseResult<Record<string, string>>) => {
        try {
          const techSet = new Set<string>();

          // DÜZELTME: 'row' değişkenine açıkça Record<string, string> tipini atadık.
          results.data.forEach((row: Record<string, string>) => {
            TARGET_COLUMNS.forEach(col => {
              if (row[col]) {
                const items = row[col].split(',').map((item: string) => item.trim()).filter(Boolean);
                items.forEach((item: string) => techSet.add(item));
              }
            });
          });

          resolve(Array.from(techSet).join(', '));
        } catch (error) {
          reject(new Error('Failed to parse specific columns. Please ensure it is a valid Wappalyzer CSV.'));
        }
      },
      error: () => {
        reject(new Error('Failed to read the CSV file.'));
      }
    });
  });
};