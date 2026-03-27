import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
    // Bağlantı kopsa bile otomatik olarak tekrar bağlanmasını sağlar
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  }
)