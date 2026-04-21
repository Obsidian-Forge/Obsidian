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
export function extractWappalyzerData(csvText: string): string[] {
  if (!csvText) return [];

  try {
    // 1. Satırları ayır ve boş olanları temizle (Windows \r\n ve Mac/Linux \n uyumlu)
    const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length < 2) return []; // En azından başlık ve 1 satır veri olmalı

    // 2. Başlıkları (headers) al, tırnakları temizle ve 'technology' sütununu bul
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
    const techIndex = headers.indexOf('technology');

    // Aynı teknolojiyi iki kez eklememek için Set kullanıyoruz
    const techSet = new Set<string>();

    // 3. Veri satırlarını döngüye al
    for (let i = 1; i < lines.length; i++) {
      // DİKKAT: CSV içindeki virgülleri (quotes içindekiler hariç) doğru ayıran Regex
      // Bu sayede "Vue.js, React" gibi veriler tek sütun olarak okunur, kod çökmez.
      const rowMatches = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
      const row = rowMatches.map(val => val.replace(/^"|"$/g, '').trim());

      // 'technology' sütunu bulunduysa onu al, yoksa Wappalyzer standardı olan 2. sütunu (index 1) al
      if (techIndex !== -1 && row[techIndex]) {
        techSet.add(row[techIndex]);
      } else if (techIndex === -1 && row.length > 1) {
        techSet.add(row[1]);
      }
    }

    // Set'i Array'e çevir, boş olanları filtrele ve döndür
    return Array.from(techSet).filter(Boolean);
  } catch (error) {
    console.error("CSV Parse Error:", error);
    return [];
  }
}