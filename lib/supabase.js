import { createClient } from '@supabase/supabase-js'

let supabaseClient = null

const getSupabase = () => {
  if (supabaseClient) return supabaseClient
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase env vars')
    return null
  }
  
  supabaseClient = createClient(supabaseUrl, supabaseKey)
  return supabaseClient
}

export const saveConfig = async (config) => {
  const supabase = getSupabase()
  if (!supabase) return { error: 'Supabase not initialized' }
  
  try {
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
      dolar_oficial: config.dolar || 0,
      inflacion_anual: config.inflacion || 0
    }
    
    const { error } = await supabase
      .from('config')
      .upsert(configData, { onConflict: 'id' })
    
    return { error }
  } catch (err) {
    return { error: err }
  }
}

export const loadConfig = async () => {
  const supabase = getSupabase()
  if (!supabase) return { data: null, error: 'Supabase not initialized' }
  
  try {
    const { data, error } = await supabase
      .from('config')
      .select('*')
      .eq('id', 1)
      .single()
    
    return { data, error }
  } catch (err) {
    return { data: null, error: err }
  }
}

export const saveProductos = async (productos) => {
  const supabase = getSupabase()
  if (!supabase) return { error: 'Supabase not initialized' }
  
  try {
    for (const p of productos) {
      const productoData = {
        nombre: p.nombre,
        material_g: p.materialG,
        horas_impresion: p.horas,
        min_trabajo: p.minTrabajo,
        packaging: p.packaging,
        tasa_fallos: p.tasaFallos,
        porcentaje_ganancia: p.ganancia,
        orden: p.orden || p.id
      }
      
      await supabase
        .from('productos')
        .update(productoData)
        .eq('id', p.id)
    }
    
    return { error: null }
  } catch (err) {
    return { error: err }
  }
}

export const loadProductos = async () => {
  const supabase = getSupabase()
  if (!supabase) return { data: null, error: 'Supabase not initialized' }
  
  try {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .order('orden')
    
    return { data, error }
  } catch (err) {
    return { data: null, error: err }
  }
}
