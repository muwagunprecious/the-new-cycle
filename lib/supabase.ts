import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// Load environment variables early
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

if (!supabaseUrl) {
  console.error('[SUPABASE] Missing NEXT_PUBLIC_SUPABASE_URL in .env');
}
if (!serviceKey) {
  console.error('[SUPABASE] Missing SUPABASE_SERVICE_ROLE_KEY in .env');
}
if (!anonKey) {
  console.warn('[SUPABASE] Missing NEXT_PUBLIC_SUPABASE_ANON_KEY in .env (public reads may fail)');
}

// Admin client – uses Service Role key (full access, server‑side only)
export const supabaseAdmin = createClient(
  supabaseUrl!,
  serviceKey!
);

// Public client – uses anon key (client‑side safe reads)
export const supabasePublic = createClient(
  supabaseUrl!,
  anonKey!
);

// Default export kept for backward compatibility – uses admin client
export const supabase = supabaseAdmin;

// Debug logging (trimmed for security)
console.log('[SUPABASE] URL:', supabaseUrl);
console.log('[SUPABASE] Service key length:', serviceKey?.length ?? 0);
console.log('[SUPABASE] Anon key length:', anonKey?.length ?? 0);
