import { useState, useEffect } from 'react'
import Link from 'next/link'
import { loadConfig, saveConfig } from '../lib/supabase'

const DEFAULT_CONFIG = {
  precioFilamentoKg: 0,
  factorInflacion: 1.0,
  precioKwh: 0,
  potenciaW: 0,
  precioImpresora: 0,
  vidaUtilHoras: 0,
  horasDia: 0,
  diasMes: 0,
  alquiler: 0,
  proporcionNegocio: 0,
  ads: 0,
  monotributo: 0,
  gasolina: 0,
  mantPorHora: 0,
  valorHoraTrabajo: 0
}

export default function Config() {
  const [darkMode, setDarkMode] = useState(false)
  const [config, setConfig] = useState(DEFAULT_CONFIG)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedDarkMode = localStorage.getItem('calc3d_darkMode')
      if (savedDarkMode !== null) setDarkMode(savedDarkMode === 'true')
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('calc3d_darkMode', darkMode)
    }
  }, [darkMode])

  useEffect(() => {
    const loadData = async () => {
      const { data: configData } = await loadConfig()
      if (configData) {
        setConfig({
          precioFilamentoKg: configData.precio_filamento_kg ?? 0,
          factorInflacion: 1.0,
          precioKwh: configData.precio_kwh ?? 0,
          potenciaW: configData.potencia_w ?? 0,
          precioImpresora: configData.precio_impresora ?? 0,
          vidaUtilHoras: configData.vida_util_horas ?? 0,
          horasDia: configData.horas_dia ?? 0,
          diasMes: configData.dias_mes ?? 0,
          alquiler: configData.alquiler_mensual ?? 0,
          proporcionNegocio: configData.proporcion_espacio ?? 0,
          ads: configData.facebook_ads ?? 0,
          monotributo: configData.monotributo ?? 0,
          gasolina: configData.gasolina ?? 0,
          mantPorHora: configData.mant_por_hora ?? 0,
          valorHoraTrabajo: configData.valor_hora_trabajo ?? 0
        })
      }
    }
    loadData()
  }, [])

  const horasImpresionMes = config.horasDia * config.diasMes
  const costoDesgaste = config.precioImpresora / config.vidaUtilHoras
  const alquilerNegocio = config.alquiler * config.proporcionNegocio
  const totalFijos = config.ads + config.monotributo + config.gasolina + alquilerNegocio
  const overheadPorHora = totalFijos / horasImpresionMes

  const guardarCambios = async () => {
    const { error } = await saveConfig(config)
    if (error) {
      console.error('Error guardando config:', error)
      alert('Error al guardar: ' + (error.message || JSON.stringify(error)))
      return
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const resetConfig = () => {
    setConfig(DEFAULT_CONFIG)
    saveConfig(DEFAULT_CONFIG)
  }

  const theme = darkMode ? dark : light

  return (
    <div style={{...styles.container, ...theme.container}}>
      <header style={{...styles.header, ...theme.header}}>
        <div style={styles.headerTop}>
          <Link href="/" style={styles.backButton}>← Volver</Link>
          <div style={{display: 'flex', gap: '10px'}}>
            <button onClick={guardarCambios} style={{...styles.saveButton, ...theme.saveButton}}>
              {saved ? '✅ Guardado' : '💾 Guardar'}
            </button>
            <button onClick={() => setDarkMode(!darkMode)} style={{...styles.themeToggle, ...theme.themeToggle}}>
              {darkMode ? '☀️ Claro' : '🌙 Oscuro'}
            </button>
          </div>
        </div>
        <h1 style={{...styles.title, ...theme.title}}>⚙️ Configuración</h1>
        <p style={{...styles.subtitle, ...theme.subtitle}}>Ajusta los parámetros de tu negocio</p>
      </header>

      <section style={{...styles.configSection, ...theme.configSection}}>
        <div style={styles.configHeader}>
          <h2 style={{...styles.sectionTitle, ...theme.sectionTitle}}>Parámetros del Negocio</h2>
          <button onClick={resetConfig} style={{...styles.resetConfigBtn, ...theme.resetConfigBtn}}>🔄 Restablecer</button>
        </div>
        
        <div style={styles.configGrid}>
          <div style={{...styles.configCard, ...theme.configCard}}>
            <h3 style={{...styles.configCardTitle, ...theme.configCardTitle}}>📦 Materiales</h3>
            <div style={styles.configRow}>
              <label style={{...styles.label, ...theme.label}}>Precio filamento/kg ($)</label>
              <input 
                type="number" 
                value={config.precioFilamentoKg} 
                onChange={e => setConfig({...config, precioFilamentoKg: parseFloat(e.target.value)})} 
                style={{...styles.input, ...theme.input}} 
              />
            </div>
          </div>

          <div style={{...styles.configCard, ...theme.configCard}}>
            <h3 style={{...styles.configCardTitle, ...theme.configCardTitle}}>⚡ Energía</h3>
            <div style={styles.configRow}>
              <label style={{...styles.label, ...theme.label}}>Precio kWh ($)</label>
              <input 
                type="number" 
                value={config.precioKwh} 
                onChange={e => setConfig({...config, precioKwh: parseFloat(e.target.value)})} 
                style={{...styles.input, ...theme.input}} 
              />
            </div>
            <div style={styles.configRow}>
              <label style={{...styles.label, ...theme.label}}>Potencia impr. (W)</label>
              <input 
                type="number" 
                value={config.potenciaW} 
                onChange={e => setConfig({...config, potenciaW: parseFloat(e.target.value)})} 
                style={{...styles.input, ...theme.input}} 
              />
            </div>
          </div>

          <div style={{...styles.configCard, ...theme.configCard}}>
            <h3 style={{...styles.configCardTitle, ...theme.configCardTitle}}>🖨️ Equipo</h3>
            <div style={styles.configRow}>
              <label style={{...styles.label, ...theme.label}}>Precio impresora ($)</label>
              <input 
                type="number" 
                value={config.precioImpresora} 
                onChange={e => setConfig({...config, precioImpresora: parseFloat(e.target.value)})} 
                style={{...styles.input, ...theme.input}} 
              />
            </div>
            <div style={styles.configRow}>
              <label style={{...styles.label, ...theme.label}}>Vida útil (horas)</label>
              <input 
                type="number" 
                value={config.vidaUtilHoras} 
                onChange={e => setConfig({...config, vidaUtilHoras: parseFloat(e.target.value)})} 
                style={{...styles.input, ...theme.input}} 
              />
            </div>
          </div>

          <div style={{...styles.configCard, ...theme.configCard}}>
            <h3 style={{...styles.configCardTitle, ...theme.configCardTitle}}>🏭 Operaciones</h3>
            <div style={styles.configRow}>
              <label style={{...styles.label, ...theme.label}}>Horas/día</label>
              <input 
                type="number" 
                value={config.horasDia} 
                onChange={e => setConfig({...config, horasDia: parseFloat(e.target.value)})} 
                style={{...styles.input, ...theme.input}} 
              />
            </div>
            <div style={styles.configRow}>
              <label style={{...styles.label, ...theme.label}}>Días/mes</label>
              <input 
                type="number" 
                value={config.diasMes} 
                onChange={e => setConfig({...config, diasMes: parseFloat(e.target.value)})} 
                style={{...styles.input, ...theme.input}} 
              />
            </div>
          </div>

          <div style={{...styles.configCard, ...theme.configCard}}>
            <h3 style={{...styles.configCardTitle, ...theme.configCardTitle}}>💰 Costos Fijos</h3>
            <div style={styles.configRow}>
              <label style={{...styles.label, ...theme.label}}>Alquiler ($)</label>
              <input 
                type="number" 
                value={config.alquiler} 
                onChange={e => setConfig({...config, alquiler: parseFloat(e.target.value)})} 
                style={{...styles.input, ...theme.input}} 
              />
            </div>
            <div style={styles.configRow}>
              <label style={{...styles.label, ...theme.label}}>% Negocio</label>
              <input 
                type="number" 
                value={Math.round(config.proporcionNegocio * 100)} 
                onChange={e => setConfig({...config, proporcionNegocio: parseFloat(e.target.value) / 100})} 
                style={{...styles.input, ...theme.input}} 
              />
            </div>
            <div style={styles.configRow}>
              <label style={{...styles.label, ...theme.label}}>Ads ($)</label>
              <input 
                type="number" 
                value={config.ads} 
                onChange={e => setConfig({...config, ads: parseFloat(e.target.value)})} 
                style={{...styles.input, ...theme.input}} 
              />
            </div>
            <div style={styles.configRow}>
              <label style={{...styles.label, ...theme.label}}>Monotributo ($)</label>
              <input 
                type="number" 
                value={config.monotributo} 
                onChange={e => setConfig({...config, monotributo: parseFloat(e.target.value)})} 
                style={{...styles.input, ...theme.input}} 
              />
            </div>
            <div style={styles.configRow}>
              <label style={{...styles.label, ...theme.label}}>Gasolina ($)</label>
              <input 
                type="number" 
                value={config.gasolina} 
                onChange={e => setConfig({...config, gasolina: parseFloat(e.target.value)})} 
                style={{...styles.input, ...theme.input}} 
              />
            </div>
          </div>

          <div style={{...styles.configCard, ...theme.configCard}}>
            <h3 style={{...styles.configCardTitle, ...theme.configCardTitle}}>👷 Mano de Obra</h3>
            <div style={styles.configRow}>
              <label style={{...styles.label, ...theme.label}}>Mant. por hora ($)</label>
              <input 
                type="number" 
                value={config.mantPorHora} 
                onChange={e => setConfig({...config, mantPorHora: parseFloat(e.target.value)})} 
                style={{...styles.input, ...theme.input}} 
              />
            </div>
            <div style={styles.configRow}>
              <label style={{...styles.label, ...theme.label}}>Valor hora ($)</label>
              <input 
                type="number" 
                value={config.valorHoraTrabajo} 
                onChange={e => setConfig({...config, valorHoraTrabajo: parseFloat(e.target.value)})} 
                style={{...styles.input, ...theme.input}} 
              />
            </div>
          </div>

          <div style={{...styles.configCard, ...styles.summaryCardFull, ...theme.summaryCard}}>
            <h3 style={{...styles.configCardTitle, ...theme.configCardTitle}}>📊 Resumen Calculado</h3>
            <div style={styles.summaryGrid}>
              <div style={styles.summaryItem}>
                <span style={{...styles.summaryLabel, ...theme.summaryLabel}}>Horas/mes:</span>
                <span style={{...styles.summaryValue, ...theme.summaryValue}}>{horasImpresionMes.toLocaleString()}</span>
              </div>
              <div style={styles.summaryItem}>
                <span style={{...styles.summaryLabel, ...theme.summaryLabel}}>Desgaste ($/h):</span>
                <span style={{...styles.summaryValue, ...theme.summaryValue}}>${Math.round(costoDesgaste).toLocaleString()}</span>
              </div>
              <div style={styles.summaryItem}>
                <span style={{...styles.summaryLabel, ...theme.summaryLabel}}>Alquiler negocio:</span>
                <span style={{...styles.summaryValue, ...theme.summaryValue}}>${Math.round(alquilerNegocio).toLocaleString()}</span>
              </div>
              <div style={styles.summaryItem}>
                <span style={{...styles.summaryLabel, ...theme.summaryLabel}}>Total fijos/mes:</span>
                <span style={{...styles.summaryValue, ...theme.summaryValue}}>${Math.round(totalFijos).toLocaleString()}</span>
              </div>
              <div style={{...styles.summaryItem, ...styles.summaryItemHighlight}}>
                <span style={{...styles.summaryLabel, ...theme.summaryLabel}}>Overhead ($/h):</span>
                <span style={{...styles.summaryValueHighlight, ...theme.summaryValueHighlight}}>${Math.round(overheadPorHora).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer style={{...styles.footer, ...theme.footer}}>
        <p>💡 Los cambios se guardan automáticamente</p>
      </footer>
    </div>
  )
}

const light = {
  container: { backgroundColor: '#f5f7fa' },
  header: { background: 'linear-gradient(135deg, #1a365d 0%, #2d4a6f 100%)' },
  title: { color: '#ffffff' },
  subtitle: { color: 'rgba(255, 255, 255, 0.85)' },
  themeToggle: { backgroundColor: '#ffffff', color: '#1a365d', border: '2px solid #2d8b8b' },
  saveButton: { backgroundColor: '#22c55e', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
  backButton: { color: '#ffffff', textDecoration: 'none', fontSize: '14px', fontWeight: '600' },
  configSection: { backgroundColor: '#ffffff' },
  sectionTitle: { color: '#1a365d', fontWeight: '700' },
  resetConfigBtn: { backgroundColor: '#dc2626', color: '#ffffff' },
  configCard: { background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  summaryCard: { background: '#f0fdf4', border: '2px solid #22c55e' },
  configCardTitle: { color: '#1a365d', fontWeight: '700', fontSize: '14px' },
  label: { color: '#334155', fontWeight: '600', fontSize: '12px' },
  input: { border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#1e293b', fontWeight: '500', fontSize: '13px', padding: '10px' },
  summaryLabel: { color: '#166534', fontWeight: '600', fontSize: '13px' },
  summaryValue: { color: '#166534', fontWeight: '700', fontSize: '14px' },
  summaryValueHighlight: { color: '#15803d', fontWeight: '800', fontSize: '16px' },
  footer: { color: '#64748b', backgroundColor: '#f5f7fa' }
}

const dark = {
  container: { backgroundColor: '#0f172a' },
  header: { background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' },
  title: { color: '#ffffff' },
  subtitle: { color: '#ffffff' },
  themeToggle: { background: '#ffffff', color: '#0f172a', border: '2px solid #2d8b8b' },
  saveButton: { backgroundColor: '#22c55e', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
  backButton: { color: '#ffffff', textDecoration: 'none', fontSize: '14px', fontWeight: '600' },
  configSection: { backgroundColor: '#1e293b' },
  sectionTitle: { color: '#ffffff', fontWeight: '700' },
  resetConfigBtn: { backgroundColor: '#dc2626', color: '#ffffff' },
  configCard: { background: '#0f172a', border: '1px solid #334155' },
  summaryCard: { background: 'rgba(34, 197, 94, 0.15)', border: '2px solid #22c55e' },
  configCardTitle: { color: '#ffffff', fontWeight: '700', fontSize: '14px' },
  label: { color: '#ffffff', fontWeight: '600', fontSize: '12px' },
  input: { border: '1px solid #475569', backgroundColor: '#1e293b', color: '#ffffff', fontWeight: '500', fontSize: '13px', padding: '10px' },
  summaryLabel: { color: '#ffffff', fontWeight: '600', fontSize: '13px' },
  summaryValue: { color: '#ffffff', fontWeight: '700', fontSize: '14px' },
  summaryValueHighlight: { color: '#ffffff', fontWeight: '800', fontSize: '16px' },
  footer: { color: '#ffffff', backgroundColor: '#0f172a' }
}

const styles = {
  container: { 
    minHeight: '100vh', 
    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif"
  },
  header: {
    padding: '30px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
  },
  headerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  backButton: {
    display: 'inline-block',
    padding: '8px 16px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '6px',
    transition: 'background 0.2s'
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    margin: 0
  },
  subtitle: {
    fontSize: '14px',
    margin: '5px 0 0 0'
  },
  themeToggle: {
    padding: '8px 14px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600'
  },
  configSection: {
    padding: '30px',
    margin: '20px',
    borderRadius: '16px',
    boxShadow: '0 2px 15px rgba(0,0,0,0.08)'
  },
  configHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '25px',
    flexWrap: 'wrap',
    gap: '15px'
  },
  resetConfigBtn: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600'
  },
  sectionTitle: {
    fontSize: '22px',
    margin: 0
  },
  configGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px'
  },
  configCard: {
    padding: '20px',
    borderRadius: '12px'
  },
  summaryCardFull: {
    gridColumn: '1 / -1'
  },
  configCardTitle: {
    marginBottom: '15px',
    fontSize: '14px'
  },
  configRow: {
    marginBottom: '12px'
  },
  label: {
    display: 'block',
    marginBottom: '5px'
  },
  input: {
    width: '100%',
    borderRadius: '8px',
    outline: 'none',
    boxSizing: 'border-box'
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '15px'
  },
  summaryItem: {
    textAlign: 'center',
    padding: '10px'
  },
  summaryItemHighlight: {
    background: 'rgba(34, 197, 94, 0.2)',
    borderRadius: '8px'
  },
  summaryLabel: {
    display: 'block',
    marginBottom: '5px'
  },
  summaryValue: {},
  summaryValueHighlight: {},
  footer: {
    textAlign: 'center',
    padding: '20px',
    fontSize: '13px'
  }
}
