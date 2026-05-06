"use server";

import { supabase } from "@/lib/supabase";

// TypeScript'in tip uyuşmazlığı uyarısını bilerek susturuyoruz. (KeyGenerator'daki taktiğin aynısı)
// @ts-ignore
import { authenticator } from "otplib";

// KRİTİK AYARLAR: Mobil uygulamayla birebir aynı olmak ZORUNDA
authenticator.options = { 
  digits: 12,    // 12 Haneli kod
  step: 30,      // 30 saniyelik ömür
  window: 1      // Tolerans: İçinde bulunduğumuz saniye VEYA bir önceki/sonraki 30 saniye
};

export async function verifyBlackGateAccess(clientCode: string) {
  try {
    // 1. Veritabanından sadece "aktif" olan müşterilerin tohumlarını çek
    const { data: keys, error } = await supabase
      .from('access_keys')
      .select('client_name, project_name, secret_seed')
      .eq('is_active', true);

    if (error || !keys) {
      console.error("Database sync failed");
      return { success: false };
    }

    // 2. GHOST VALIDATION (Tüm tohumları sessizce tara)
    for (const key of keys) {
      const isValid = authenticator.verify({
        token: clientCode,
        secret: key.secret_seed
      });

      if (isValid) {
        // EŞLEŞTİ! Müşteriyi kimlik sormadan tanıdık.
        return { 
          success: true, 
          client: key.client_name, 
          project: key.project_name 
        };
      }
    }

    // Hiçbir tohumla eşleşmediyse erişim reddedilir
    return { success: false };

  } catch (error) {
    console.error("Verification Engine Error:", error);
    return { success: false };
  }
}