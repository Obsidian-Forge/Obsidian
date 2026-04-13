// app/types/audit.ts

export interface LighthouseScore {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  legacyLcp?: string;
  novatrumLcp?: string;
}

export interface TechnicalAudit {
  id: string;
  slug: string;
  client_name: string; // DB'deki isimle eşleşmeli
  target_url: string;
  legacy_stack: string[];
  scores: LighthouseScore;
  images: {
    heroImage: string; // Arkaplan görseli
  };
  created_at: string;
  has_security_issue?: boolean; 
  revenue_index?: number;
}