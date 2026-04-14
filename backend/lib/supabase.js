import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn('[SUPABASE] Missing environment variables for secondary client.')
}

/**
 * PRODUCTION-GRADE SUPABASE CLIENT
 * This client uses standard HTTPS (Port 443) and is used as a highly reliable
 * alternative to Prisma for high-traffic read operations or when SQL ports are blocked.
 */
export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
})
