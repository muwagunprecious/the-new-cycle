// lib/supabase-utils.ts
/**
 * Helper to handle Supabase responses uniformly.
 * Throws the error if present, otherwise returns the data.
 */
export async function handleSupabase<T>(promise: PromiseLike<{ data: T | null; error: any }>) {
  const { data, error } = await promise
  if (error) throw error
  // Supabase can return `null` for empty results – callers can decide what to do.
  return data as T
}

/**
 * Simple retry wrapper for transient DB errors (connection pool timeouts, etc.).
 * It retries `fn` up to `retries` times with exponential back‑off.
 */
export async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 300): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (err: any) {
      const transient =
        err?.message?.includes('ECHECKOUTTIMEOUT') ||
        err?.code === 'P1001' ||
        err?.message?.includes('connection pool')
      if (!transient || attempt === retries) throw err
      await new Promise((res) => setTimeout(res, delay * Math.pow(2, attempt - 1)))
    }
  }
  // Should never reach here
  throw new Error('Retry exhausted')
}
