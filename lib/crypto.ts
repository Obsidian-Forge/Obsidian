// lib/crypto.ts
export async function hashCode(code: string): Promise<string> {
  // DOĞRUDAN YAZ (sonra .env.local düzeltince değiştirirsin)
  const SEED = 'TEX5UI7SIFPKYZ24';    // ← MOBİL İLE AYNI SEED
  const SALT = 'YlXqG65A';            // ← MOBİL İLE AYNI SALT
  
  const data = SEED.slice(0, 8) + SALT + code;
  
  console.log('🔐 Web Hash Debug:');
  console.log('  Seed (ilk 8):', SEED.slice(0, 8));
  console.log('  Salt:', SALT);
  console.log('  Code:', code);
  console.log('  Data:', data);
  
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const result = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  console.log('  Hash:', result);
  return result;
}