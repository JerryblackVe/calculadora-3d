import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bzdrxvsrpgpugizrmkap.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

let supabase = null
if (supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey)
}

export { supabase }

export const saveConfig = async (config) => {
  if (!supabase) {
    console.warn('Supabase no configurado - guardando solo en localStorage')
    return { error: 'Supabase no configurado' }
  }
  const configData = {
    id: 1,
    precio_filamento_kg: config.precioFilamentoKg,
    precio_kwh: config.precioKwh,
    potencia_w: config.potenciaW,
    precio_impresora: config.precioImpresora,
    vida_util_horas: config.vidaUtilHoras,
    horas_dia: config.horasDia,
    dias_mes: config.diasMes,
    alquiler_mensual: config.alquiler,
    proporcion_espacio: config.proporcionNegocio,
    facebook_ads: config.ads,
    monotributo: config.monotributo,
    gasolina: config.gasolina,
    mant_por_hora: config.mantPorHora,
    valor_hora_trabajo: config.valorHoraTrabajo,
    updated_at: new Date().toISOString()
  }
  const { error } = await supabase
    .from('config')
    .upsert(configData, { onConflict: 'id' })
  if (error) console.error('saveConfig error:', error)
  return { error }
}

export const loadConfig = async () => {
  if (!supabase) return { data: null, error: 'Supabase no configurado' }
  const { data, error } = await supabase
    .from('config')
    .select('*')
    .eq('id', 1)
    .single()
  if (error && error.code !== 'PGRST116') console.error('loadConfig error:', error)
  return { data, error }
}

export const saveProductos = async (productos) => {
  if (!supabase) {
    console.warn('Supabase no configurado - guardando solo en localStorage')
    return { error: 'Supabase no configurado' }
  }
  const productosWithOrden = productos.map((p, index) => ({
    id: p.id,
    nombre: p.nombre,
    material_g: p.materialG,
    horas_impresion: p.horas,
    min_trabajo: p.minTrabajo,
    packaging: p.packaging,
    tasa_fallos: p.tasaFallos,
    porcentaje_ganancia: p.ganancia,
    orden: index + 1
  }))
  const { error } = await supabase
    .from('productos')
    .upsert(productosWithOrden, { onConflict: 'id' })
  if (error) console.error('saveProductos error:', error)
  return { error }
}

export const loadProductos = async () => {
  if (!supabase) return { data: null, error: 'Supabase no configurado' }
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .order('orden')
  if (error) console.error('loadProductos error:', error)
  return { data, error }
}

export const saveExchangeRate = async (dolar, inflacion) => {
  if (!supabase) return { error: 'Supabase no configurado' }
  const { error } = await supabase
    .from('exchange_rates')
    .insert({ dolar, inflacion })
  if (error) console.error('saveExchangeRate error:', error)
  return { error }
}
