import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

export const saveConfig = async (config) => {
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
}

export const loadConfig = async () => {
  const { data, error } = await supabase
    .from('config')
    .select('*')
    .eq('id', 1)
    .single()
  
  return { data, error }
}

export const saveProductos = async (productos) => {
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
}

export const loadProductos = async () => {
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .order('orden')
  
  return { data, error }
}
