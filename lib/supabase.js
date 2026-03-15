import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bzdrxvsrpgpugizrmkap.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseKey)

export const saveConfig = async (config) => {
  if (!supabaseKey) return { error: 'No Supabase key configured' }
  const userId = 'default_user'
  const { error } = await supabase
    .from('configs')
    .upsert({ user_id: userId, config_data: config, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
  return { error }
}

export const loadConfig = async () => {
  if (!supabaseKey) return { data: null, error: 'No Supabase key configured' }
  const userId = 'default_user'
  const { data, error } = await supabase
    .from('configs')
    .select('config_data')
    .eq('user_id', userId)
    .single()
  return { data, error }
}

export const saveProductos = async (productos) => {
  if (!supabaseKey) return { error: 'No Supabase key configured' }
  const userId = 'default_user'
  const { error } = await supabase
    .from('productos')
    .upsert({ user_id: userId, productos_data: productos, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
  return { error }
}

export const loadProductos = async () => {
  if (!supabaseKey) return { data: null, error: 'No Supabase key configured' }
  const userId = 'default_user'
  const { data, error } = await supabase
    .from('productos')
    .select('productos_data')
    .eq('user_id', userId)
    .single()
  return { data, error }
}

export const saveExchangeRate = async (dolar, inflacion) => {
  if (!supabaseKey) return { error: 'No Supabase key configured' }
  const { error } = await supabase
    .from('exchange_rates')
    .insert({ dolar, inflacion })
  return { error }
}
