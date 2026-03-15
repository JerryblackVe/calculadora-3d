import { useState, useEffect } from 'react'
import { calcularCosto } from '../lib/calculos'
import { loadConfig, saveConfig, loadProductos, saveProductos, saveExchangeRate } from '../lib/supabase'

const DEFAULT_CONFIG = {
  precioFilamentoKg: 18000,
  factorInflacion: 1.0,
  precioKwh: 115,
  potenciaW: 200,
  precioImpresora: 1200000,
  vidaUtilHoras: 5000,
  horasDia: 16,
  diasMes: 30,
  alquiler: 600000,
  proporcionNegocio: 0.33,
  ads: 200000,
  monotributo: 180000,
  gasolina: 80000,
  mantPorHora: 90,
  valorHoraTrabajo: 8000
}

const DEFAULT_PRODUCTOS = [
  { id: 1, nombre: 'Figura decorativa', materialG: 50, horas: 2, minTrabajo: 15, packaging: 200, tasaFallos: 0.05, ganancia: 0.3 },
  { id: 2, nombre: 'Soporte teléfono', materialG: 30, horas: 1.5, minTrabajo: 10, packaging: 150, tasaFallos: 0.03, ganancia: 0.3 },
  { id: 3, nombre: 'Tornillo personalizado', materialG: 10, horas: 0.5, minTrabajo: 5, packaging: 100, tasaFallos: 0.02, ganancia: 0.3 },
  { id: 4, nombre: 'Engranaje', materialG: 25, horas: 1, minTrabajo: 10, packaging: 150, tasaFallos: 0.03, ganancia: 0.3 },
  { id: 5, nombre: 'Copa', materialG: 80, horas: 3, minTrabajo: 20, packaging: 250, tasaFallos: 0.08, ganancia: 0.3 },
  { id: 6, nombre: 'Maceta', materialG: 150, horas: 4, minTrabajo: 25, packaging: 300, tasaFallos: 0.1, ganancia: 0.3 },
  { id: 7, nombre: 'Llavero', materialG: 8, horas: 0.5, minTrabajo: 5, packaging: 80, tasaFallos: 0.02, ganancia: 0.3 },
  { id: 8, nombre: 'Caja organizadora', materialG: 100, horas: 3.5, minTrabajo: 20, packaging: 250, tasaFallos: 0.07, ganancia: 0.3 },
  { id: 9, nombre: 'Pelota', materialG: 60, horas: 2.5, minTrabajo: 15, packaging: 200, tasaFallos: 0.06, ganancia: 0.3 },
  { id: 10, nombre: 'Jarrón', materialG: 200, horas: 5, minTrabajo: 30, packaging: 350, tasaFallos: 0.12, ganancia: 0.3 }
]

export default function Home() {
  const [dolar, setDolar] = useState(null)
  const [inflacion, setInflacion] = useState(null)
  const [loading, setLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [darkMode, setDarkMode] = useState(false)
  const [config, setConfig] = useState(DEFAULT_CONFIG)
  const [productos, setProductos] = useState(DEFAULT_PRODUCTOS)

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('calc3d_darkMode')
    if (savedDarkMode !== null) setDarkMode(savedDarkMode === 'true')
  }, [])

  useEffect(() => {
    localStorage.setItem('calc3d_darkMode', darkMode)
  }, [darkMode])

  useEffect(() => {
    const loadData = async () => {
      const { data: configData } = await loadConfig()
      if (configData?.config_data) {
        setConfig({ ...DEFAULT_CONFIG, ...configData.config_data })
      }
      const { data: productosData } = await loadProductos()
      if (productosData?.productos_data) {
        setProductos(productosData.productos_data)
      }
    }
    loadData()
  }, [])

  useEffect(() => {
    saveConfig(config)
  }, [config])

  useEffect(() => {
    saveProductos(productos)
  }, [productos])

  const actualizarDatos = async () => {
    setLoading(true)
    try {
      const [resDolar, resInflacion] = await Promise.all([
        fetch('/api/dolar'),
        fetch('/api/inflacion')
      ])
      const dataDolar = await resDolar.json()
      const dataInflacion = await resInflacion.json()
      setDolar(dataDolar.venta)
      setInflacion(dataInflacion.anual)
      setConfig(c => ({...c, factorInflacion: 1 + dataInflacion.anual / 100}))
      setLastUpdate(new Date())
      await saveExchangeRate(dataDolar.venta, dataInflacion.anual)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
    setLoading(false)
  }

  useEffect(() => {
    actualizarDatos()
  }, [])

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

  const resetProductos = () => {
    setProductos(DEFAULT_PRODUCTOS)
  }

  const resetConfig = () => {
    setConfig(DEFAULT_CONFIG)
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
          <button onClick={() => setDarkMode(!darkMode)} style={{...styles.themeToggle, ...theme.themeToggle}}>
            {darkMode ? '☀️ Claro' : '🌙 Oscuro'}
          </button>
          <div style={styles.headerStats}>
            <div style={{...styles.statCard, ...theme.statCard}}>
              <span style={{...styles.statLabel, ...theme.statLabel}}>Costo Total</span>
              <span style={{...styles.statValue, ...theme.statValue}}>${Math.round(costoTotalGeneral).toLocaleString()}</span>
            </div>
            <div style={{...styles.statCard, ...styles.statCardHighlight, ...theme.statCardHighlight}}>
              <span style={{...styles.statLabel, ...theme.statLabel}}>Ingreso Potential</span>
              <span style={{...styles.statValueGreen, ...theme.statValueGreen}}>${Math.round(precioTotalGeneral).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </header>

      <div style={{...styles.dataSection, ...theme.dataSection}}>
        <div style={styles.dataInfo}>
          <button onClick={actualizarDatos} disabled={loading} style={{...styles.refreshButton, ...theme.refreshButton}}>
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

      <section style={{...styles.configSection, ...theme.configSection}}>
        <div style={styles.configHeader}>
          <h2 style={{...styles.sectionTitle, ...theme.sectionTitle}}>⚙️ Configuración Global</h2>
          <button onClick={resetConfig} style={{...styles.resetConfigBtn, ...theme.resetConfigBtn}}>🔄 Reset</button>
        </div>
        
        <div style={styles.configGrid}>
          {/* 📦 MATERIALES */}
          <div style={{...styles.configCard, ...theme.configCard}}>
            <h3 style={{...styles.configCardTitle, ...theme.configCardTitle}}>📦 Materiales</h3>
            <div style={styles.configRow}>
              <label style={{...styles.label, ...theme.label}}>Precio filamento/kg ($)</label>
              <input type="number" value={config.precioFilamentoKg} onChange={e => setConfig({...config, precioFilamentoKg: parseFloat(e.target.value)})} style={{...styles.input, ...theme.input}} />
            </div>
          </div>

          {/* ⚡ ENERGÍA */}
          <div style={{...styles.configCard, ...theme.configCard}}>
            <h3 style={{...styles.configCardTitle, ...theme.configCardTitle}}>⚡ Energía</h3>
            <div style={styles.configRow}>
              <label style={{...styles.label, ...theme.label}}>Precio kWh ($)</label>
              <input type="number" value={config.precioKwh} onChange={e => setConfig({...config, precioKwh: parseFloat(e.target.value)})} style={{...styles.input, ...theme.input}} />
            </div>
            <div style={styles.configRow}>
              <label style={{...styles.label, ...theme.label}}>Potencia impr. (W)</label>
              <input type="number" value={config.potenciaW} onChange={e => setConfig({...config, potenciaW: parseFloat(e.target.value)})} style={{...styles.input, ...theme.input}} />
            </div>
          </div>

          {/* 🖨️ EQUIPO */}
          <div style={{...styles.configCard, ...theme.configCard}}>
            <h3 style={{...styles.configCardTitle, ...theme.configCardTitle}}>🖨️ Equipo</h3>
            <div style={styles.configRow}>
              <label style={{...styles.label, ...theme.label}}>Precio impresora ($)</label>
              <input type="number" value={config.precioImpresora} onChange={e => setConfig({...config, precioImpresora: parseFloat(e.target.value)})} style={{...styles.input, ...theme.input}} />
            </div>
            <div style={styles.configRow}>
              <label style={{...styles.label, ...theme.label}}>Vida útil (horas)</label>
              <input type="number" value={config.vidaUtilHoras} onChange={e => setConfig({...config, vidaUtilHoras: parseFloat(e.target.value)})} style={{...styles.input, ...theme.input}} />
            </div>
          </div>

          {/* 🏭 OPERACIONES */}
          <div style={{...styles.configCard, ...theme.configCard}}>
            <h3 style={{...styles.configCardTitle, ...theme.configCardTitle}}>🏭 Operaciones</h3>
            <div style={styles.configRow}>
              <label style={{...styles.label, ...theme.label}}>Horas/día</label>
              <input type="number" value={config.horasDia} onChange={e => setConfig({...config, horasDia: parseFloat(e.target.value)})} style={{...styles.input, ...theme.input}} />
            </div>
            <div style={styles.configRow}>
              <label style={{...styles.label, ...theme.label}}>Días/mes</label>
              <input type="number" value={config.diasMes} onChange={e => setConfig({...config, diasMes: parseFloat(e.target.value)})} style={{...styles.input, ...theme.input}} />
            </div>
          </div>

          {/* 💰 COSTOS FIJOS */}
          <div style={{...styles.configCard, ...theme.configCard}}>
            <h3 style={{...styles.configCardTitle, ...theme.configCardTitle}}>💰 Costos Fijos</h3>
            <div style={styles.configRow}>
              <label style={{...styles.label, ...theme.label}}>Alquiler ($)</label>
              <input type="number" value={config.alquiler} onChange={e => setConfig({...config, alquiler: parseFloat(e.target.value)})} style={{...styles.input, ...theme.input}} />
            </div>
            <div style={styles.configRow}>
              <label style={{...styles.label, ...theme.label}}>% Negocio</label>
              <input type="number" value={Math.round(config.proporcionNegocio * 100)} onChange={e => setConfig({...config, proporcionNegocio: parseFloat(e.target.value) / 100})} style={{...styles.input, ...theme.input}} />
            </div>
            <div style={styles.configRow}>
              <label style={{...styles.label, ...theme.label}}>Ads ($)</label>
              <input type="number" value={config.ads} onChange={e => setConfig({...config, ads: parseFloat(e.target.value)})} style={{...styles.input, ...theme.input}} />
            </div>
            <div style={styles.configRow}>
              <label style={{...styles.label, ...theme.label}}>Monotributo ($)</label>
              <input type="number" value={config.monotributo} onChange={e => setConfig({...config, monotributo: parseFloat(e.target.value)})} style={{...styles.input, ...theme.input}} />
            </div>
            <div style={styles.configRow}>
              <label style={{...styles.label, ...theme.label}}>Gasolina ($)</label>
              <input type="number" value={config.gasolina} onChange={e => setConfig({...config, gasolina: parseFloat(e.target.value)})} style={{...styles.input, ...theme.input}} />
            </div>
          </div>

          {/* 👷 MANO DE OBRA */}
          <div style={{...styles.configCard, ...theme.configCard}}>
            <h3 style={{...styles.configCardTitle, ...theme.configCardTitle}}>👷 Mano de Obra</h3>
            <div style={styles.configRow}>
              <label style={{...styles.label, ...theme.label}}>Mant. por hora ($)</label>
              <input type="number" value={config.mantPorHora} onChange={e => setConfig({...config, mantPorHora: parseFloat(e.target.value)})} style={{...styles.input, ...theme.input}} />
            </div>
            <div style={styles.configRow}>
              <label style={{...styles.label, ...theme.label}}>Valor hora ($)</label>
              <input type="number" value={config.valorHoraTrabajo} onChange={e => setConfig({...config, valorHoraTrabajo: parseFloat(e.target.value)})} style={{...styles.input, ...theme.input}} />
            </div>
          </div>

          {/* 📊 RESUMEN CALCULADO */}
          <div style={{...styles.configCard, ...styles.summaryCard, ...theme.summaryCard}}>
            <h3 style={{...styles.configCardTitle, ...theme.configCardTitle}}>📊 Resumen</h3>
            <div style={styles.summaryRow}>
              <span style={{...styles.summaryLabel, ...theme.summaryLabel}}>Horas/mes:</span>
              <span style={{...styles.summaryValue, ...theme.summaryValue}}>{horasImpresionMes.toLocaleString()}</span>
            </div>
            <div style={styles.summaryRow}>
              <span style={{...styles.summaryLabel, ...theme.summaryLabel}}>Desgaste ($/h):</span>
              <span style={{...styles.summaryValue, ...theme.summaryValue}}>${Math.round(costoDesgaste).toLocaleString()}</span>
            </div>
            <div style={styles.summaryRow}>
              <span style={{...styles.summaryLabel, ...theme.summaryLabel}}>Alquiler negocio:</span>
              <span style={{...styles.summaryValue, ...theme.summaryValue}}>${Math.round(alquilerNegocio).toLocaleString()}</span>
            </div>
            <div style={styles.summaryRow}>
              <span style={{...styles.summaryLabel, ...theme.summaryLabel}}>Total fijos/mes:</span>
              <span style={{...styles.summaryValue, ...theme.summaryValue}}>${Math.round(totalFijos).toLocaleString()}</span>
            </div>
            <div style={{...styles.summaryRow, ...styles.summaryRowHighlight}}>
              <span style={{...styles.summaryLabel, ...theme.summaryLabel}}>Overhead ($/h):</span>
              <span style={{...styles.summaryValueHighlight, ...theme.summaryValueHighlight}}>${Math.round(overheadPorHora).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </section>

      <section style={{...styles.tableSection, ...theme.tableSection}}>
        <div style={styles.tableHeader}>
          <h2 style={{...styles.sectionTitle, ...theme.sectionTitle}}>📦 Productos ({productos.length})</h2>
          <div style={styles.tableActions}>
            <button onClick={agregarProducto} style={{...styles.addButton, ...theme.addButton}}>➕ Agregar</button>
            <button onClick={resetProductos} style={{...styles.resetButton, ...theme.resetButton}}>🗑️ Reset</button>
          </div>
        </div>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={{...styles.headerRow, ...theme.headerRow}}>
                <th style={{...styles.th, width: '160px'}}>Producto</th>
                <th style={{...styles.th, width: '70px'}}>Material(g)</th>
                <th style={{...styles.th, width: '60px'}}>Horas</th>
                <th style={{...styles.th, width: '60px'}}>Min Trab</th>
                <th style={{...styles.th, width: '70px'}}>Packaging</th>
                <th style={{...styles.th, width: '70px'}}>Tasa Fallos</th>
                <th style={{...styles.th, width: '70px'}}>% Ganancia</th>
                <th style={{...styles.th, width: '90px'}}>COSTO</th>
                <th style={{...styles.th, width: '100px'}}>PRECIO FINAL</th>
                <th style={{...styles.th, width: '40px'}}></th>
              </tr>
            </thead>
            <tbody>
              {productos.map((producto, index) => {
                const resultado = calcularParaProducto(producto)
                return (
                  <tr key={producto.id} style={{...styles.row, ...theme.row}}>
                    <td style={{...styles.td, ...theme.td}}>
                      <input type="text" value={producto.nombre} onChange={e => handleNombreChange(index, e.target.value)} style={{...styles.inputText, ...theme.inputText}} />
                    </td>
                    <td style={{...styles.td, ...theme.td}}>
                      <input type="number" value={producto.materialG} onChange={e => handleInputChange(index, 'materialG', e.target.value)} style={{...styles.inputNumber, ...theme.inputNumber}} />
                    </td>
                    <td style={{...styles.td, ...theme.td}}>
                      <input type="number" value={producto.horas} onChange={e => handleInputChange(index, 'horas', e.target.value)} style={{...styles.inputNumber, ...theme.inputNumber}} />
                    </td>
                    <td style={{...styles.td, ...theme.td}}>
                      <input type="number" value={producto.minTrabajo} onChange={e => handleInputChange(index, 'minTrabajo', e.target.value)} style={{...styles.inputNumber, ...theme.inputNumber}} />
                    </td>
                    <td style={{...styles.td, ...theme.td}}>
                      <input type="number" value={producto.packaging} onChange={e => handleInputChange(index, 'packaging', e.target.value)} style={{...styles.inputNumber, ...theme.inputNumber}} />
                    </td>
                    <td style={{...styles.td, ...theme.td}}>
                      <input type="number" value={Math.round(producto.tasaFallos * 100)} onChange={e => handleInputChange(index, 'tasaFallos', e.target.value / 100)} style={{...styles.inputNumber, ...theme.inputNumber}} />
                    </td>
                    <td style={{...styles.td, ...theme.td}}>
                      <input type="number" value={Math.round(producto.ganancia * 100)} onChange={e => handleInputChange(index, 'ganancia', e.target.value / 100)} style={{...styles.inputNumber, ...theme.inputNumber}} />
                    </td>
                    <td style={{...styles.td, ...styles.calculated, ...theme.calculated}}>${Math.round(resultado.costoTotal).toLocaleString()}</td>
                    <td style={{...styles.td, ...styles.finalPrice, ...theme.finalPrice}}>${Math.round(resultado.precioFinal).toLocaleString()}</td>
                    <td style={{...styles.td, ...theme.td}}>
                      <button onClick={() => eliminarProducto(producto.id)} style={{...styles.deleteButton, ...theme.deleteButton}}>×</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr style={{...styles.footerRow, ...theme.footerRow}}>
                <td style={{...styles.tdFooter, ...theme.tdFooter}} colSpan={7}><strong>TOTALES</strong></td>
                <td style={{...styles.tdFooter, ...styles.calculated, ...theme.calculated}}><strong>${Math.round(costoTotalGeneral).toLocaleString()}</strong></td>
                <td style={{...styles.tdFooter, ...styles.finalPrice, ...theme.finalPrice}}><strong>${Math.round(precioTotalGeneral).toLocaleString()}</strong></td>
                <td></td>
              </tr>
            </tfoot>
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
  themeToggle: { backgroundColor: '#ffffff', color: '#1a365d', border: '2px solid #2d8b8b' },
  statCard: { background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)' },
  statCardHighlight: { background: 'rgba(45, 139, 139, 0.4)', border: '1px solid #2d8b8b' },
  statLabel: { color: 'rgba(255, 255, 255, 0.9)' },
  statValue: { color: '#ffffff' },
  statValueGreen: { color: '#7ddba5' },
  dataSection: { background: '#ffffff', borderBottom: '3px solid #2d8b8b', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  refreshButton: { backgroundColor: '#2d8b8b' },
  dataChip: { background: '#f0fdfa', border: '1px solid #2d8b8b' },
  dataText: { color: '#1a365d' },
  lastUpdate: { color: '#64748b' },
  configSection: { backgroundColor: '#ffffff' },
  configCard: { background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  summaryCard: { background: '#f0fdf4', border: '2px solid #22c55e' },
  configCardTitle: { color: '#1a365d', fontWeight: '700', fontSize: '13px' },
  label: { color: '#475569', fontWeight: '600', fontSize: '11px' },
  input: { border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#1e293b', fontWeight: '500', fontSize: '12px', padding: '6px 8px' },
  summaryLabel: { color: '#166534', fontWeight: '600', fontSize: '12px' },
  summaryValue: { color: '#166534', fontWeight: '700', fontSize: '12px' },
  summaryValueHighlight: { color: '#15803d', fontWeight: '800', fontSize: '14px' },
  tableSection: { backgroundColor: '#ffffff' },
  sectionTitle: { color: '#1a365d', fontWeight: '700' },
  addButton: { backgroundColor: '#2d8b8b' },
  resetButton: { backgroundColor: '#dc2626' },
  headerRow: { backgroundColor: '#1a365d' },
  th: { color: '#ffffff', fontWeight: '700', fontSize: '10px' },
  row: { borderBottom: '1px solid #e2e8f0' },
  td: { color: '#1e293b', fontSize: '12px' },
  inputText: { border: '1px solid #2d8b8b', color: '#1a365d', backgroundColor: '#f0fdfa', fontWeight: '600', fontSize: '12px', padding: '5px' },
  inputNumber: { border: '1px solid #2d8b8b', color: '#1a365d', backgroundColor: '#f0fdfa', fontWeight: '600', fontSize: '12px', padding: '5px', width: '60px' },
  calculated: { backgroundColor: '#dcfce7', color: '#166534', fontWeight: '700', fontSize: '12px' },
  finalPrice: { backgroundColor: '#dcfce7', color: '#15803d', fontWeight: '700', fontSize: '13px' },
  footerRow: { backgroundColor: '#f1f5f9' },
  tdFooter: { color: '#1a365d', fontWeight: '700', fontSize: '12px' },
  deleteButton: { color: '#dc2626', fontWeight: '700' },
  footer: { color: '#64748b', backgroundColor: '#f5f7fa' },
  resetConfigBtn: { backgroundColor: '#dc2626', color: '#ffffff' }
}

const dark = {
  container: { backgroundColor: '#0f172a' },
  header: { background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' },
  title: { color: '#f1faee' },
  subtitle: { color: 'rgba(241, 250, 238, 0.7)' },
  themeToggle: { background: '#334155', border: '1px solid #475569' },
  statCard: { background: 'rgba(45, 139, 139, 0.2)', border: '1px solid #2d8b8b' },
  statCardHighlight: { background: 'rgba(34, 197, 94, 0.2)', border: '1px solid #22c55e' },
  statLabel: { color: 'rgba(241, 250, 238, 0.7)' },
  statValue: { color: '#f1faee' },
  statValueGreen: { color: '#4ade80' },
  dataSection: { background: '#1e293b', borderBottom: '3px solid #2d8b8b' },
  refreshButton: { backgroundColor: '#2d8b8b' },
  dataChip: { background: 'rgba(45, 139, 139, 0.2)' },
  dataText: { color: '#f1faee' },
  lastUpdate: { color: 'rgba(241, 250, 238, 0.5)' },
  configSection: { backgroundColor: '#1e293b' },
  configCard: { background: '#0f172a', border: '1px solid #334155' },
  summaryCard: { background: 'rgba(34, 197, 94, 0.1)', border: '2px solid #22c55e' },
  configCardTitle: { color: '#2d8b8b', fontWeight: '700', fontSize: '13px' },
  label: { color: '#94a3b8', fontWeight: '600', fontSize: '11px' },
  input: { border: '1px solid #334155', backgroundColor: '#0f172a', color: '#f1faee', fontWeight: '500', fontSize: '12px', padding: '6px 8px' },
  summaryLabel: { color: '#86efac', fontWeight: '600', fontSize: '12px' },
  summaryValue: { color: '#86efac', fontWeight: '700', fontSize: '12px' },
  summaryValueHighlight: { color: '#4ade80', fontWeight: '800', fontSize: '14px' },
  tableSection: { backgroundColor: '#1e293b' },
  sectionTitle: { color: '#f1faee', fontWeight: '700' },
  addButton: { backgroundColor: '#2d8b8b' },
  resetButton: { backgroundColor: '#dc2626' },
  headerRow: { backgroundColor: '#0f172a' },
  th: { color: '#f1faee', fontWeight: '700', fontSize: '10px' },
  row: { borderBottom: '1px solid #334155' },
  td: { color: '#e2e8f0', fontSize: '12px' },
  inputText: { border: '1px solid #2d8b8b', color: '#f1faee', backgroundColor: '#0f172a', fontWeight: '600', fontSize: '12px', padding: '5px' },
  inputNumber: { border: '1px solid #2d8b8b', color: '#f1faee', backgroundColor: '#0f172a', fontWeight: '600', fontSize: '12px', padding: '5px', width: '60px' },
  calculated: { backgroundColor: '#14532d', color: '#86efac', fontWeight: '700', fontSize: '12px' },
  finalPrice: { backgroundColor: '#166534', color: '#4ade80', fontWeight: '700', fontSize: '13px' },
  footerRow: { backgroundColor: '#0f172a' },
  tdFooter: { color: '#e2e8f0', fontWeight: '700', fontSize: '12px' },
  deleteButton: { color: '#f87171', fontWeight: '700' },
  footer: { color: '#94a3b8', backgroundColor: '#0f172a' },
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
