import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('>>> Supabase init - URL:', supabaseUrl)
console.log('>>> Supabase init - Key exists:', !!supabaseKey, 'Key length:', supabaseKey?.length)

if (!supabaseUrl || !supabaseKey) {
  console.error('SUPABASE ENV VARS MISSING:', { supabaseUrl: !!supabaseUrl, supabaseKey: !!supabaseKey })
}

export const supabase = createClient(supabaseUrl, supabaseKey)

export const saveConfig = async (config) => {
  console.log('>>> saveConfig called')
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
  console.log('>>> saveConfig: sending to Supabase:', configData)
  const { data, error } = await supabase
    .from('config')
    .upsert(configData, { onConflict: 'id' })
  console.log('>>> saveConfig result - data:', data, 'error:', error)
  return { data, error }
}

export const loadConfig = async () => {
  console.log('>>> loadConfig called')
  const { data, error } = await supabase
    .from('config')
    .select('*')
    .eq('id', 1)
    .single()
  console.log('>>> loadConfig result - data:', data, 'error:', error)
  if (error && error.code !== 'PGRST116') console.error('loadConfig error:', error)
  return { data, error }
}

export const saveProductos = async (productos) => {
  console.log('>>> saveProductos called, count:', productos?.length)
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
  console.log('>>> saveProductos: sending to Supabase:', productosWithOrden)
  const { data, error } = await supabase
    .from('productos')
    .upsert(productosWithOrden, { onConflict: 'id' })
  console.log('>>> saveProductos result - data:', data, 'error:', error)
  return { data, error }
}

export const loadProductos = async () => {
  console.log('>>> loadProductos called')
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .order('orden')
  console.log('>>> loadProductos result - count:', data?.length, 'error:', error)
  if (error) console.error('loadProductos error:', error)
  return { data, error }
}

export const saveExchangeRate = async (dolar, inflacion) => {
  console.log('>>> saveExchangeRate called')
  const { error } = await supabase
    .from('exchange_rates')
    .insert({ dolar, inflacion })
  if (error) console.error('saveExchangeRate error:', error)
  return { error }
}
