import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Environment variables NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY não encontradas.")
}

/**
 * Singleton para evitar múltiplas instâncias do Supabase no cliente.
 */
let _supabase: SupabaseClient | null = null

export function createClient(): SupabaseClient {
  if (_supabase) return _supabase
  _supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey)
  return _supabase
}

/**
 * Instância padrão já inicializada.
 *  - Use `createClient()` quando precisar garantir singleton.
 *  - Ou importe `supabase` diretamente para chamadas rápidas.
 */
export const supabase = createClient()
