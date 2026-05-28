// supabaseWrapper.ts – generic CRUD helpers for Supabase
import { supabase } from '@/lib/supabase'
import { handleSupabase } from '@/lib/supabase-utils'

/** Fetch many rows with optional filters, ordering, limit */
export async function fetchMany<T>(
  table: string,
  opts: {
    columns?: string
    where?: Record<string, any>
    order?: { column: string; ascending?: boolean }
    limit?: number
  } = {}
): Promise<T[]> {
  let query = supabase.from(table).select(opts.columns ?? '*')

  if (opts.where) {
    Object.entries(opts.where).forEach(([k, v]) => {
      query = query.eq(k, v)
    })
  }

  if (opts.order) {
    query = query.order(opts.order.column, { ascending: opts.order.ascending ?? true })
  }

  if (opts.limit) {
    query = query.limit(opts.limit)
  }

  return handleSupabase<T[]>(query)
}

/** Fetch a single row */
export async function fetchOne<T>(
  table: string,
  where: Record<string, any>,
  columns: string = '*'
): Promise<T | null> {
  let query = supabase.from(table).select(columns)
  Object.entries(where).forEach(([k, v]) => {
    query = query.eq(k, v)
  })
  return handleSupabase<T>(query.single())
}

/** Insert a row and return inserted record */
export async function insertOne<T>(
  table: string,
  data: Record<string, any>,
  columns: string = '*'
): Promise<T> {
  const query = supabase.from(table).insert(data).select(columns).single()
  return handleSupabase<T>(query)
}

/** Update a row (single) */
export async function updateOne<T>(
  table: string,
  where: Record<string, any>,
  data: Record<string, any>,
  columns: string = '*'
): Promise<T> {
  let query = supabase.from(table).update(data)
  Object.entries(where).forEach(([k, v]) => {
    query = query.eq(k, v)
  })
  return handleSupabase<T>(query.select(columns).single())
}

/** Delete a row */
export async function deleteOne(
  table: string,
  where: Record<string, any>
): Promise<void> {
  let query = supabase.from(table).delete()
  Object.entries(where).forEach(([k, v]) => {
    query = query.eq(k, v)
  })
  await handleSupabase(query)
}

/** Execute raw SQL via a Postgres function (needs to be defined in Supabase) */
export async function rawQuery<T = any>(sql: string): Promise<T> {
  const { data, error } = await supabase.rpc('execute_sql', { sql })
  if (error) throw error
  return data as T
}
