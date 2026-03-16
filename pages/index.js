import { useState, useEffect } from 'react'
import Link from 'next/link'
import { calcularCosto } from '../lib/calculos'
import { loadConfig, saveConfig, loadProductos, saveProductos } from '../lib/supabase'

// Fantastic Plastik - Calculadora de Costos 3D
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

const DEFAULT_PRODUCTOS = [
  { id: 1, nombre: 'Figura decorativa', materialG: 50, horas: 2, minTrabajo: 15, packaging: 200, tasaFallos: 0.05, ganancia: 0.3, orden: 1 },
  { id: 2, nombre: 'Soporte teléfono', materialG: 30, horas: 1.5, minTrabajo: 10, packaging: 150, tasaFallos: 0.03, ganancia: 0.3, orden: 2 },
  { id: 3, nombre: 'Tornillo personalizado', materialG: 10, horas: 0.5, minTrabajo: 5, packaging: 100, tasaFallos: 0.02, ganancia: 0.3, orden: 3 },
  { id: 4, nombre: 'Engranaje', materialG: 25, horas: 1, minTrabajo: 10, packaging: 150, tasaFallos: 0.03, ganancia: 0.3, orden: 4 },
  { id: 5, nombre: 'Copa', materialG: 80, horas: 3, minTrabajo: 20, packaging: 250, tasaFallos: 0.08, ganancia: 0.3, orden: 5 },
  { id: 6, nombre: 'Maceta', materialG: 150, horas: 4, minTrabajo: 25, packaging: 300, tasaFallos: 0.1, ganancia: 0.3, orden: 6 },
  { id: 7, nombre: 'Llavero', materialG: 8, horas: 0.5, minTrabajo: 5, packaging: 80, tasaFallos: 0.02, ganancia: 0.3, orden: 7 },
  { id: 8, nombre: 'Caja organizadora', materialG: 100, horas: 3.5, minTrabajo: 20, packaging: 250, tasaFallos: 0.07, ganancia: 0.3, orden: 8 },
  { id: 9, nombre: 'Pelota', materialG: 60, horas: 2.5, minTrabajo: 15, packaging: 200, tasaFallos: 0.06, ganancia: 0.3, orden: 9 },
  { id: 10, nombre: 'Jarrón', materialG: 200, horas: 5, minTrabajo: 30, packaging: 350, tasaFallos: 0.12, ganancia: 0.3, orden: 10 }
]

export default function Home() {
  const [dolar, setDolar] = useState(null)
  const [inflacion, setInflacion] = useState(null)
  const [loading, setLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [darkMode, setDarkMode] = useState(false)
  const [config, setConfig] = useState(DEFAULT_CONFIG)
  const [productos, setProductos] = useState(DEFAULT_PRODUCTOS)
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
          valorHoraTrabajo: configData.valor_hora_trabajo ?? 0,
          dolar: configData.dolar_oficial ?? null,
          inflacion: configData.inflacion_anual ?? null
        })
        if (configData.dolar_oficial) setDolar(configData.dolar_oficial)
        if (configData.inflacion_anual) setInflacion(configData.inflacion_anual)
      }
      const { data: productosData } = await loadProductos()
      if (productosData && productosData.length > 0) {
        const mapped = productosData.map(p => ({
          id: p.id,
          nombre: p.nombre || '',
          materialG: p.material_g || 0,
          horas: p.horas_impresion || 0,
          minTrabajo: p.min_trabajo || 0,
          packaging: p.packaging || 0,
          tasaFallos: p.tasa_fallos || 0,
          ganancia: p.porcentaje_ganancia || 0.3,
          orden: p.orden || p.id
        }))
        setProductos(mapped)
      }
    }
    loadData()
  }, [])

  const actualizarDatos = async () => {
    setLoading(true)
    try {
      const [resDolar, resInflacion] = await Promise.all([
        fetch('/api/dolar'),
        fetch('/api/inflacion')
      ])
      const dataDolar = await resDolar.json()
      const dataInflacion = await resInflacion.json()
      
      if (dataDolar.venta) setDolar(dataDolar.venta)
      if (dataInflacion.anual) setInflacion(dataInflacion.anual)
      
      const factor = dataInflacion.anual 
        ? 1 + dataInflacion.anual / 100 
        : 1
      
      setConfig(prev => ({ ...prev, factorInflacion: factor }))
      setLastUpdate(new Date())
    } catch (e) {
      console.error('Error actualizando datos:', e)
    }
    setLoading(false)
  }

  const horasImpresionMes = config.horasDia * config.diasMes
  const costoDesgaste = config.precioImpresora / config.vidaUtilHoras
  const alquilerNegocio = config.alquiler * config.proporcionNegocio
  const totalFijos = config.ads + config.monotributo + config.gasolina + alquilerNegocio
  const overheadPorHora = totalFijos / horasImpresionMes

  const calcularParaProducto = (producto) => {
    const resultado = calcularCosto({
      materialG: producto.materialG,
      horasImpresion: producto.horas,
      minTrabajo: producto.minTrabajo,
      packaging: producto.packaging,
      tasaFallos: producto.tasaFallos,
      ganancia: producto.ganancia,
      precioFilamentoKg: config.precioFilamentoKg,
      factorInflacion: config.factorInflacion,
      precioKwh: config.precioKwh,
      potenciaW: config.potenciaW,
      precioImpresora: config.precioImpresora,
      vidaUtilHoras: config.vidaUtilHoras,
      mantPorHora: config.mantPorHora,
      valorHoraTrabajo: config.valorHoraTrabajo,
      overheadPorHour: overheadPorHora
    })
    return resultado
  }

  const emptyProducts = [
    { id: 1, nombre: '', materialG: 0, horas: 0, minTrabajo: 0, packaging: 0, tasaFallos: 0, ganancia: 0 },
    { id: 2, nombre: '', materialG: 0, horas: 0, minTrabajo: 0, packaging: 0, tasaFallos: 0, ganancia: 0 },
    { id: 3, nombre: '', materialG: 0, horas: 0, minTrabajo: 0, packaging: 0, tasaFallos: 0, ganancia: 0 },
    { id: 4, nombre: '', materialG: 0, horas: 0, minTrabajo: 0, packaging: 0, tasaFallos: 0, ganancia: 0 },
    { id: 5, nombre: '', materialG: 0, horas: 0, minTrabajo: 0, packaging: 0, tasaFallos: 0, ganancia: 0 },
    { id: 6, nombre: '', materialG: 0, horas: 0, minTrabajo: 0, packaging: 0, tasaFallos: 0, ganancia: 0 },
    { id: 7, nombre: '', materialG: 0, horas: 0, minTrabajo: 0, packaging: 0, tasaFallos: 0, ganancia: 0 },
    { id: 8, nombre: '', materialG: 0, horas: 0, minTrabajo: 0, packaging: 0, tasaFallos: 0, ganancia: 0 },
    { id: 9, nombre: '', materialG: 0, horas: 0, minTrabajo: 0, packaging: 0, tasaFallos: 0, ganancia: 0 },
    { id: 10, nombre: '', materialG: 0, horas: 0, minTrabajo: 0, packaging: 0, tasaFallos: 0, ganancia: 0 }
  ]

  const resetProductos = async () => {
    if (!confirm('¿Borrar todos los productos?')) return
    
    const productosVacios = productos.map((p, i) => ({
      id: p.id,
      nombre: '',
      materialG: 0,
      horas: 0,
      minTrabajo: 0,
      packaging: 0,
      tasaFallos: 0,
      ganancia: 0.40,
      orden: i + 1
    }))
    
    await saveProductos(productosVacios)
    setProductos(productosVacios)
  }

  const guardarCambios = async () => {
    const { error: errorConfig } = await saveConfig(config)
    if (errorConfig) {
      console.error('Error guardando config:', errorConfig)
      alert('Error al guardar config: ' + (errorConfig.message || JSON.stringify(errorConfig)))
      return
    }
    const { error: errorProductos } = await saveProductos(productos)
    if (errorProductos) {
      console.error('Error guardando productos:', errorProductos)
      alert('Error al guardar productos: ' + (errorProductos.message || JSON.stringify(errorProductos)))
      return
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const resetConfig = () => {
    setConfig(DEFAULT_CONFIG)
    saveConfig(DEFAULT_CONFIG)
  }

  const handleInputChange = (index, field, value) => {
    const nuevos = [...productos]
    nuevos[index] = { ...nuevos[index], [field]: parseFloat(value) || 0 }
    setProductos(nuevos)
  }

  const handleNombreChange = (index, value) => {
    const nuevos = [...productos]
    nuevos[index] = { ...nuevos[index], nombre: value }
    setProductos(nuevos)
  }

  const agregarProducto = () => {
    const nuevoId = Math.max(...productos.map(p => p.id)) + 1
    setProductos([...productos, { id: nuevoId, nombre: 'Nuevo producto', materialG: 50, horas: 2, minTrabajo: 15, packaging: 200, tasaFallos: 0.05, ganancia: 0.3 }])
  }

  const eliminarProducto = (id) => {
    setProductos(productos.filter(p => p.id !== id))
  }

  const costoTotalGeneral = productos.reduce((acc, p) => acc + calcularParaProducto(p).costoTotal, 0)
  const precioTotalGeneral = productos.reduce((acc, p) => acc + calcularParaProducto(p).precioFinal, 0)

  const theme = darkMode ? dark : light

  return (
    <div style={{...styles.container, ...theme.container}}>
      <header style={{...styles.header, ...theme.header}}>
        <div style={styles.headerContent}>
          <h1 style={{...styles.title, ...theme.title}}>🖨️ Calculadora de Costos</h1>
          <p style={{...styles.subtitle, ...theme.subtitle}}>Impresión 3D - Fantastic Plastik</p>
        </div>
        <div style={styles.headerRight}>
          <Link href="/config" style={{...styles.configLink, ...theme.configLink}} aria-label="Ir a configuración">
            <span aria-hidden="true">⚙️</span> Configuración
          </Link>
          <button onClick={guardarCambios} style={{...styles.saveButton, ...theme.saveButton}} aria-label="Guardar cambios">
            {saved ? '✓ Guardado' : '💾 Guardar'}
          </button>
          <button onClick={() => setDarkMode(!darkMode)} style={{...styles.themeToggle, ...theme.themeToggle}} aria-label={darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}>
            {darkMode ? '☀️ Claro' : '🌙 Oscuro'}
          </button>
        </div>
      </header>

      <div style={{...styles.dataSection, ...theme.dataSection}}>
        <div style={styles.dataInfo}>
          <button onClick={actualizarDatos} disabled={loading} style={{...styles.refreshButton, ...theme.refreshButton}} aria-label="Actualizar datos económicos">
            {loading ? '⏳ Actualizando...' : '🔄 Actualizar Datos'}
          </button>
          <div style={styles.dataDisplay}>
            {dolar && (
              <div style={{...styles.dataChip, ...theme.dataChip}}>
                <span style={styles.dataIcon}>💵</span>
                <span style={{...styles.dataText, ...theme.dataText}}>Dólar: <strong>${dolar}</strong></span>
              </div>
            )}
            {inflacion && (
              <div style={{...styles.dataChip, ...theme.dataChip}}>
                <span style={styles.dataIcon}>📈</span>
                <span style={{...styles.dataText, ...theme.dataText}}>Inflación: <strong>{inflacion}%</strong></span>
              </div>
            )}
            {config.factorInflacion !== 1 && (
              <div style={{...styles.dataChip, ...theme.dataChip}}>
                <span style={styles.dataIcon}>📊</span>
                <span style={{...styles.dataText, ...theme.dataText}}>Factor: <strong>{config.factorInflacion.toFixed(2)}</strong></span>
              </div>
            )}
            {lastUpdate && (
              <span style={{...styles.lastUpdate, ...theme.lastUpdate}}>Actualizado: {lastUpdate.toLocaleTimeString()}</span>
            )}
          </div>
        </div>
      </div>

      <section style={{...styles.tableSection, ...theme.tableSection}}>
        <div style={styles.tableHeader}>
          <h2 style={{...styles.sectionTitle, ...theme.sectionTitle}}>📦 Productos ({productos.length})</h2>
          <div style={styles.tableActions}>
            <button onClick={agregarProducto} style={{...styles.addButton, ...theme.addButton}} aria-label="Agregar nuevo producto">➕ Agregar</button>
            <button onClick={resetProductos} style={{...styles.resetButton, ...theme.resetButton}} aria-label="Restablecer productos">🗑️ Reset</button>
          </div>
        </div>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={{...styles.headerRow, ...theme.headerRow}}>
                <th style={{...styles.th, ...theme.th, width: '160px'}}>Producto</th>
                <th style={{...styles.th, ...theme.th, width: '70px'}}>Material(g)</th>
                <th style={{...styles.th, ...theme.th, width: '60px'}}>Horas</th>
                <th style={{...styles.th, ...theme.th, width: '60px'}}>Min Trab</th>
                <th style={{...styles.th, ...theme.th, width: '70px'}}>Packaging</th>
                <th style={{...styles.th, ...theme.th, width: '70px'}}>Tasa Fallos</th>
                <th style={{...styles.th, ...theme.th, width: '70px'}}>% Ganancia</th>
                <th style={{...styles.th, ...theme.th, width: '90px'}}>COSTO</th>
                <th style={{...styles.th, ...theme.th, width: '100px'}}>PRECIO FINAL</th>
                <th style={{...styles.th, ...theme.th, width: '40px'}}></th>
              </tr>
            </thead>
              <tbody>
              {productos.map((producto, index) => {
                const resultado = calcularParaProducto(producto)
                return (
                  <tr key={producto.id} style={{...styles.row, ...theme.row}}>
                    <td style={{...styles.td, ...theme.td}}>
                      <label className="sr-only">Nombre del producto</label>
                      <input type="text" value={producto.nombre} onChange={e => handleNombreChange(index, e.target.value)} style={{...styles.inputText, ...theme.inputText}} aria-label={`Producto ${index + 1}: ${producto.nombre || 'Sin nombre'}`} />
                    </td>
                    <td style={{...styles.td, ...theme.td}}>
                      <label className="sr-only">Material en gramos</label>
                      <input type="number" value={producto.materialG} onChange={e => handleInputChange(index, 'materialG', e.target.value)} style={{...styles.inputNumber, ...theme.inputNumber}} aria-label="Material (gramos)" />
                    </td>
                    <td style={{...styles.td, ...theme.td}}>
                      <label className="sr-only">Horas de impresión</label>
                      <input type="number" value={producto.horas} onChange={e => handleInputChange(index, 'horas', e.target.value)} style={{...styles.inputNumber, ...theme.inputNumber}} aria-label="Horas de impresión" />
                    </td>
                    <td style={{...styles.td, ...theme.td}}>
                      <label className="sr-only">Minutos de trabajo</label>
                      <input type="number" value={producto.minTrabajo} onChange={e => handleInputChange(index, 'minTrabajo', e.target.value)} style={{...styles.inputNumber, ...theme.inputNumber}} aria-label="Minutos de trabajo" />
                    </td>
                    <td style={{...styles.td, ...theme.td}}>
                      <label className="sr-only">Costo de packaging</label>
                      <input type="number" value={producto.packaging} onChange={e => handleInputChange(index, 'packaging', e.target.value)} style={{...styles.inputNumber, ...theme.inputNumber}} aria-label="Costo de packaging" />
                    </td>
                    <td style={{...styles.td, ...theme.td}}>
                      <label className="sr-only">Tasa de fallos</label>
                      <input type="number" value={Math.round(producto.tasaFallos * 100)} onChange={e => handleInputChange(index, 'tasaFallos', e.target.value / 100)} style={{...styles.inputNumber, ...theme.inputNumber}} aria-label="Tasa de fallos (%)" />
                    </td>
                    <td style={{...styles.td, ...theme.td}}>
                      <label className="sr-only">Porcentaje de ganancia</label>
                      <input type="number" value={Math.round(producto.ganancia * 100)} onChange={e => handleInputChange(index, 'ganancia', e.target.value / 100)} style={{...styles.inputNumber, ...theme.inputNumber}} aria-label="Porcentaje de ganancia" />
                    </td>
                    <td style={{...styles.td, ...styles.calculated, ...theme.calculated}} aria-label={`Costo total: $${Math.round(resultado.costoTotal).toLocaleString()}`}>${Math.round(resultado.costoTotal).toLocaleString()}</td>
                    <td style={{...styles.td, ...styles.finalPrice, ...theme.finalPrice}} aria-label={`Precio final: $${Math.round(resultado.precioFinal).toLocaleString()}`}>${Math.round(resultado.precioFinal).toLocaleString()}</td>
                    <td style={{...styles.td, ...theme.td}}>
                      <button onClick={() => eliminarProducto(producto.id)} style={{...styles.deleteButton, ...theme.deleteButton}} aria-label={`Eliminar producto ${producto.nombre || index + 1}`}>×</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <footer style={{...styles.footer, ...theme.footer}}>
        <p>💡 Los cálculos se actualizan automáticamente cuando modificas cualquier valor</p>
      </footer>
    </div>
  )
}

const light = {
  container: { backgroundColor: '#f5f7fa' },
  header: { background: 'linear-gradient(135deg, #1a365d 0%, #2d4a6f 100%)' },
  title: { color: '#ffffff' },
  subtitle: { color: 'rgba(255, 255, 255, 0.85)' },
  configLink: { color: '#ffffff', textDecoration: 'none', padding: '10px 18px', background: 'rgba(255,255,255,0.15)', borderRadius: '8px', fontSize: '14px', fontWeight: '600', border: '1px solid rgba(255,255,255,0.3)', transition: 'all 0.2s ease' },
  themeToggle: { backgroundColor: '#ffffff', color: '#1a365d', border: '2px solid #2d8b8b', padding: '10px 18px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', transition: 'all 0.2s ease' },
  saveButton: { backgroundColor: '#22c55e', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', boxShadow: '0 2px 4px rgba(34, 197, 94, 0.3)', transition: 'all 0.2s ease' },
  statCard: { background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)' },
  statCardHighlight: { background: 'rgba(45, 139, 139, 0.4)', border: '1px solid #2d8b8b' },
  statLabel: { color: 'rgba(255, 255, 255, 0.9)' },
  statValue: { color: '#ffffff' },
  statValueGreen: { color: '#7ddba5' },
  dataSection: { background: '#ffffff', borderBottom: '3px solid #2d8b8b', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  refreshButton: { backgroundColor: '#2d8b8b', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', boxShadow: '0 2px 4px rgba(45, 139, 139, 0.3)', transition: 'all 0.2s ease' },
  dataChip: { background: '#f0fdfa', border: '1px solid #2d8b8b' },
  dataText: { color: '#1a365d' },
  lastUpdate: { color: '#64748b' },
  configSection: { backgroundColor: '#ffffff' },
  configCard: { background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  summaryCard: { background: '#f0fdf4', border: '2px solid #22c55e' },
  configCardTitle: { color: '#1a365d', fontWeight: '700', fontSize: '13px' },
  label: { color: '#475569', fontWeight: '600', fontSize: '11px' },
  input: { border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#1e293b', fontWeight: '500', fontSize: '12px', padding: '10px 12px', borderRadius: '6px' },
  summaryLabel: { color: '#166534', fontWeight: '600', fontSize: '12px' },
  summaryValue: { color: '#166534', fontWeight: '700', fontSize: '12px' },
  summaryValueHighlight: { color: '#15803d', fontWeight: '800', fontSize: '14px' },
  tableSection: { backgroundColor: '#ffffff' },
  sectionTitle: { color: '#1a365d', fontWeight: '700' },
  addButton: { backgroundColor: '#2d8b8b', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', boxShadow: '0 2px 4px rgba(45, 139, 139, 0.3)', transition: 'all 0.2s ease' },
  resetButton: { backgroundColor: '#dc2626', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', boxShadow: '0 2px 4px rgba(220, 38, 38, 0.3)', transition: 'all 0.2s ease' },
  headerRow: { backgroundColor: '#1a365d' },
  th: { color: '#ffffff', fontWeight: '700', fontSize: '10px' },
  row: { borderBottom: '1px solid #e2e8f0' },
  td: { color: '#1e293b', fontSize: '12px' },
  inputText: { border: '1px solid #2d8b8b', color: '#1a365d', backgroundColor: '#f0fdfa', fontWeight: '600', fontSize: '12px', padding: '10px', borderRadius: '6px' },
  inputNumber: { border: '1px solid #2d8b8b', color: '#1a365d', backgroundColor: '#f0fdfa', fontWeight: '600', fontSize: '12px', padding: '10px', borderRadius: '6px', width: '70px' },
  calculated: { backgroundColor: '#dcfce7', color: '#166534', fontWeight: '700', fontSize: '12px', padding: '10px' },
  finalPrice: { backgroundColor: '#dcfce7', color: '#15803d', fontWeight: '700', fontSize: '13px', padding: '10px' },
  footerRow: { backgroundColor: '#f1f5f9' },
  tdFooter: { color: '#1a365d', fontWeight: '700', fontSize: '12px' },
  deleteButton: { color: '#dc2626', fontWeight: '700', background: 'none', border: 'none', cursor: 'pointer', padding: '8px 12px', borderRadius: '6px', fontSize: '18px', transition: 'all 0.2s ease' },
  footer: { color: '#64748b', backgroundColor: '#f5f7fa' },
  resetConfigBtn: { backgroundColor: '#dc2626', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }
}

const dark = {
  container: { backgroundColor: '#0f172a' },
  header: { background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' },
  title: { color: '#ffffff' },
  subtitle: { color: '#ffffff' },
  configLink: { color: '#ffffff', textDecoration: 'none', padding: '10px 18px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '14px', fontWeight: '600', border: '1px solid rgba(255,255,255,0.2)', transition: 'all 0.2s ease' },
  themeToggle: { background: '#ffffff', color: '#0f172a', border: '2px solid #2d8b8b', padding: '10px 18px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', transition: 'all 0.2s ease' },
  saveButton: { backgroundColor: '#22c55e', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', boxShadow: '0 2px 4px rgba(34, 197, 94, 0.3)', transition: 'all 0.2s ease' },
  statCard: { background: 'rgba(45, 139, 139, 0.3)', border: '1px solid #2d8b8b' },
  statCardHighlight: { background: 'rgba(34, 197, 94, 0.3)', border: '1px solid #22c55e' },
  statLabel: { color: '#ffffff' },
  statValue: { color: '#ffffff' },
  statValueGreen: { color: '#ffffff' },
  dataSection: { background: '#1e293b', borderBottom: '3px solid #2d8b8b' },
  refreshButton: { backgroundColor: '#2d8b8b', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', boxShadow: '0 2px 4px rgba(45, 139, 139, 0.3)', transition: 'all 0.2s ease' },
  dataChip: { background: 'rgba(45, 139, 139, 0.3)' },
  dataText: { color: '#ffffff' },
  lastUpdate: { color: '#ffffff' },
  configSection: { backgroundColor: '#1e293b' },
  configCard: { background: '#0f172a', border: '1px solid #334155' },
  summaryCard: { background: 'rgba(34, 197, 94, 0.15)', border: '2px solid #22c55e' },
  configCardTitle: { color: '#ffffff', fontWeight: '700', fontSize: '13px' },
  label: { color: '#ffffff', fontWeight: '600', fontSize: '11px' },
  input: { border: '1px solid #475569', backgroundColor: '#1e293b', color: '#ffffff', fontWeight: '500', fontSize: '12px', padding: '6px 8px' },
  summaryLabel: { color: '#ffffff', fontWeight: '600', fontSize: '12px' },
  summaryValue: { color: '#ffffff', fontWeight: '700', fontSize: '12px' },
  summaryValueHighlight: { color: '#ffffff', fontWeight: '800', fontSize: '14px' },
  tableSection: { backgroundColor: '#1e293b' },
  sectionTitle: { color: '#ffffff', fontWeight: '700' },
  addButton: { backgroundColor: '#2d8b8b' },
  resetButton: { backgroundColor: '#dc2626' },
  headerRow: { backgroundColor: '#1a365d' },
  th: { color: '#ffffff', fontWeight: '700', fontSize: '10px' },
  row: { borderBottom: '1px solid #334155' },
  td: { color: '#ffffff', fontSize: '12px' },
  inputText: { border: '1px solid #2d8b8b', color: '#ffffff', backgroundColor: '#1e293b', fontWeight: '600', fontSize: '12px', padding: '5px' },
  inputNumber: { border: '1px solid #2d8b8b', color: '#ffffff', backgroundColor: '#1e293b', fontWeight: '600', fontSize: '12px', padding: '5px', width: '60px' },
  calculated: { backgroundColor: '#14532d', color: '#ffffff', fontWeight: '700', fontSize: '12px' },
  finalPrice: { backgroundColor: '#166534', color: '#ffffff', fontWeight: '700', fontSize: '13px' },
  footerRow: { backgroundColor: '#0f172a' },
  tdFooter: { color: '#ffffff', fontWeight: '700', fontSize: '12px' },
  deleteButton: { color: '#ffffff', fontWeight: '700' },
  footer: { color: '#ffffff', backgroundColor: '#0f172a' },
  resetConfigBtn: { backgroundColor: '#dc2626', color: '#ffffff' }
}

const styles = {
  container: { 
    minHeight: '100vh', 
    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
    transition: 'background-color 0.3s'
  },
  header: {
    padding: '20px 30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '15px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
  },
  headerContent: {},
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  title: {
    fontSize: '26px',
    fontWeight: '700',
    margin: 0,
    letterSpacing: '-0.5px'
  },
  subtitle: {
    fontSize: '13px',
    margin: '3px 0 0 0'
  },
  themeToggle: {
    padding: '8px 14px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600'
  },
  headerStats: {
    display: 'flex',
    gap: '12px'
  },
  statCard: {
    padding: '12px 18px',
    borderRadius: '10px',
    textAlign: 'center',
    border: '1px solid rgba(255,255,255,0.2)'
  },
  statCardHighlight: {},
  statLabel: {
    display: 'block',
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '3px'
  },
  statValue: {
    fontSize: '20px',
    fontWeight: '700'
  },
  statValueGreen: {
    fontSize: '20px',
    fontWeight: '700'
  },
  dataSection: {
    padding: '12px 30px'
  },
  dataInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px'
  },
  refreshButton: {
    padding: '8px 16px',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600'
  },
  dataDisplay: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  dataChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '16px',
    fontSize: '12px'
  },
  dataIcon: {
    fontSize: '14px'
  },
  dataText: {},
  lastUpdate: {
    fontSize: '11px'
  },
  configSection: {
    padding: '20px 30px',
    margin: '15px 30px',
    borderRadius: '12px',
    boxShadow: '0 2px 15px rgba(0,0,0,0.08)'
  },
  configHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px'
  },
  resetConfigBtn: {
    padding: '6px 12px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600'
  },
  sectionTitle: {
    marginBottom: '0',
    fontSize: '18px',
    fontWeight: '600'
  },
  configGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '12px'
  },
  configCard: {
    padding: '12px',
    borderRadius: '10px'
  },
  summaryCard: {
    padding: '12px',
    borderRadius: '10px'
  },
  configCardTitle: {
    fontSize: '12px',
    marginBottom: '10px',
    fontWeight: '600'
  },
  configRow: {
    marginBottom: '6px'
  },
  label: {
    display: 'block',
    fontSize: '10px',
    marginBottom: '2px'
  },
  input: {
    width: '100%',
    borderRadius: '6px',
    outline: 'none'
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '4px 0'
  },
  summaryRowHighlight: {
    borderTop: '1px solid',
    marginTop: '4px',
    paddingTop: '6px'
  },
  summaryLabel: {},
  summaryValue: {},
  summaryValueHighlight: {},
  tableSection: {
    padding: '20px 30px',
    margin: '15px 30px',
    borderRadius: '12px',
    boxShadow: '0 2px 15px rgba(0,0,0,0.08)'
  },
  tableHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
    flexWrap: 'wrap',
    gap: '12px'
  },
  tableActions: {
    display: 'flex',
    gap: '8px'
  },
  addButton: {
    padding: '8px 16px',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '13px'
  },
  resetButton: {
    padding: '8px 16px',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '13px'
  },
  tableWrapper: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '750px'
  },
  headerRow: {},
  th: {
    padding: '10px 8px',
    textAlign: 'left',
    fontSize: '10px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.3px'
  },
  row: {
    transition: 'background-color 0.2s'
  },
  td: {
    padding: '8px 6px'
  },
  inputText: {
    width: '100%',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500'
  },
  inputNumber: {
    borderRadius: '4px',
    fontSize: '12px',
    textAlign: 'right'
  },
  calculated: {
    textAlign: 'right',
    fontWeight: '700',
    fontSize: '12px'
  },
  finalPrice: {
    textAlign: 'right',
    fontWeight: '700',
    fontSize: '13px'
  },
  footerRow: {},
  tdFooter: {
    padding: '12px 8px',
    textAlign: 'right',
    fontSize: '13px'
  },
  deleteButton: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '4px',
    fontWeight: 'bold'
  },
  footer: {
    textAlign: 'center',
    padding: '15px',
    fontSize: '12px'
  }
}
