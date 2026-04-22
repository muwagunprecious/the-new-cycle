const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn('[SUPABASE] Missing environment variables for secondary client.')
}

// Safe initialization: Only create the client if keys are present.
// This prevents build-time crashes on Vercel when keys aren't yet configured.
const supabase = (supabaseUrl && supabaseServiceRoleKey) 
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    })
  : null;

module.exports = { supabase }

