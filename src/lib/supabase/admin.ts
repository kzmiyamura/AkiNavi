import { createClient } from '@supabase/supabase-js'

/**
 * サービスロールを使う管理者専用クライアント。
 * RLS をバイパスし、auth.users の操作が可能。
 * Server Actions / Route Handlers でのみ使用すること。
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
