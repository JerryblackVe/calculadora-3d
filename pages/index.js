import { useState, useEffect } from 'react'
import { calcularCosto } from '../lib/calculos'

export default function Home() {
  const [dolar, setDolar] = useState(null)
  const [inflacion, setInflacion] = useState(null)
  const [loading, setLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('darkMode')
    if (saved !== null) setDarkMode(saved === 'true')
  }, [])

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode)
  }, [darkMode])

  const [config, setConfig] = useState({
    precioFilamentoKg: 5000,
    precioKwh: 50,
    potenciaW: 150,
    precioImpresora: 150000,
    vidaUtilHoras: 5000,
    horasDia: 8,
    diasMes: 20,
    alquiler: 100000,
    proporcionNegocio: 0.15,
    ads: 30000,
    monotributo: 25000,
    gasolina: 20000,
    mantPorHora: 500,
    valorHoraTrabajo: 3000,
    overheadPorHora: 1000
  })

  const [productos, setProductos] = useState([
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
  ])

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
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Error fetching data:', error)
    }
    setLoading(false)
  }

  useEffect(() => {
    actualizarDatos()
  }, [])

  const calcularParaProducto = (producto) => {
    const factorInflacion = dolar ? (1 + inflacion / 100) : 1
    const resultado = calcularCosto({
      materialG: producto.materialG,
      horasImpresion: producto.horas,
      minTrabajo: producto.minTrabajo,
      packaging: producto.packaging,
      tasaFallos: producto.tasaFallos,
      ganancia: producto.ganancia,
      precioFilamentoKg: config.precioFilamentoKg,
      factorInflacion,
      precioKwh: config.precioKwh,
      potenciaW: config.potenciaW,
      precioImpresora: config.precioImpresora,
      vidaUtilHoras: config.vidaUtilHoras,
      mantPorHora: config.mantPorHora,
      valorHoraTrabajo: config.valorHoraTrabajo,
      overheadPorHour: config.overheadPorHora
    })
    return resultado
  }

  const resetProductos = () => {
    setProductos([
      { id: 1, nombre: 'Nuevo producto', materialG: 50, horas: 2, minTrabajo: 15, packaging: 200, tasaFallos: 0.05, ganancia: 0.3 }
    ])
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
          <p style={{...styles.subtitle, ...theme.subtitle}}>Impresión 3D - Gestión Profesional</p>
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
            {lastUpdate && (
              <span style={{...styles.lastUpdate, ...theme.lastUpdate}}>Actualizado: {lastUpdate.toLocaleTimeString()}</span>
            )}
          </div>
        </div>
      </div>

      <section style={{...styles.configSection, ...theme.configSection}}>
        <h2 style={{...styles.sectionTitle, ...theme.sectionTitle}}>⚙️ Configuración Global</h2>
        <div style={styles.configGrid}>
          <div style={{...styles.configCard, ...theme.configCard}}>
            <h3 style={{...styles.configCardTitle, ...theme.configCardTitle}}>🎨 Material</h3>
            <div style={styles.inputGroup}>
              <label style={{...styles.label, ...theme.label}}>Precio filamento/kg ($)</label>
              <input type="number" value={config.precioFilamentoKg} onChange={e => setConfig({...config, precioFilamentoKg: parseFloat(e.target.value)})} style={{...styles.input, ...theme.input}} />
            </div>
            <div style={styles.inputGroup}>
              <label style={{...styles.label, ...theme.label}}>Mant. por hora ($)</label>
              <input type="number" value={config.mantPorHora} onChange={e => setConfig({...config, mantPorHora: parseFloat(e.target.value)})} style={{...styles.input, ...theme.input}} />
            </div>
          </div>
          <div style={{...styles.configCard, ...theme.configCard}}>
            <h3 style={{...styles.configCardTitle, ...theme.configCardTitle}}>⚡ Electricidad</h3>
            <div style={styles.inputGroup}>
              <label style={{...styles.label, ...theme.label}}>Precio kWh ($)</label>
              <input type="number" value={config.precioKwh} onChange={e => setConfig({...config, precioKwh: parseFloat(e.target.value)})} style={{...styles.input, ...theme.input}} />
            </div>
            <div style={styles.inputGroup}>
              <label style={{...styles.label, ...theme.label}}>Potencia (W)</label>
              <input type="number" value={config.potenciaW} onChange={e => setConfig({...config, potenciaW: parseFloat(e.target.value)})} style={{...styles.input, ...theme.input}} />
            </div>
          </div>
          <div style={{...styles.configCard, ...theme.configCard}}>
            <h3 style={{...styles.configCardTitle, ...theme.configCardTitle}}>🖨️ Impresora</h3>
            <div style={styles.inputGroup}>
              <label style={{...styles.label, ...theme.label}}>Precio ($)</label>
              <input type="number" value={config.precioImpresora} onChange={e => setConfig({...config, precioImpresora: parseFloat(e.target.value)})} style={{...styles.input, ...theme.input}} />
            </div>
            <div style={styles.inputGroup}>
              <label style={{...styles.label, ...theme.label}}>Vida útil (horas)</label>
              <input type="number" value={config.vidaUtilHoras} onChange={e => setConfig({...config, vidaUtilHoras: parseFloat(e.target.value)})} style={{...styles.input, ...theme.input}} />
            </div>
          </div>
          <div style={{...styles.configCard, ...theme.configCard}}>
            <h3 style={{...styles.configCardTitle, ...theme.configCardTitle}}>📅 Producción</h3>
            <div style={styles.inputGroup}>
              <label style={{...styles.label, ...theme.label}}>Horas/día</label>
              <input type="number" value={config.horasDia} onChange={e => setConfig({...config, horasDia: parseFloat(e.target.value)})} style={{...styles.input, ...theme.input}} />
            </div>
            <div style={styles.inputGroup}>
              <label style={{...styles.label, ...theme.label}}>Días/mes</label>
              <input type="number" value={config.diasMes} onChange={e => setConfig({...config, diasMes: parseFloat(e.target.value)})} style={{...styles.input, ...theme.input}} />
            </div>
          </div>
          <div style={{...styles.configCard, ...theme.configCard}}>
            <h3 style={{...styles.configCardTitle, ...theme.configCardTitle}}>🏢 Costos Fijos</h3>
            <div style={styles.inputGroup}>
              <label style={{...styles.label, ...theme.label}}>Alquiler ($)</label>
              <input type="number" value={config.alquiler} onChange={e => setConfig({...config, alquiler: parseFloat(e.target.value)})} style={{...styles.input, ...theme.input}} />
            </div>
            <div style={styles.inputGroup}>
              <label style={{...styles.label, ...theme.label}}>Ads + Otros ($)</label>
              <input type="number" value={config.ads + config.monotributo + config.gasolina} onChange={e => setConfig({...config, ads: parseFloat(e.target.value) - config.monotributo - config.gasolina})} style={{...styles.input, ...theme.input}} />
            </div>
          </div>
          <div style={{...styles.configCard, ...theme.configCard}}>
            <h3 style={{...styles.configCardTitle, ...theme.configCardTitle}}>👨‍💼 Trabajo</h3>
            <div style={styles.inputGroup}>
              <label style={{...styles.label, ...theme.label}}>Valor hora ($)</label>
              <input type="number" value={config.valorHoraTrabajo} onChange={e => setConfig({...config, valorHoraTrabajo: parseFloat(e.target.value)})} style={{...styles.input, ...theme.input}} />
            </div>
            <div style={styles.inputGroup}>
              <label style={{...styles.label, ...theme.label}}>Overhead/hora ($)</label>
              <input type="number" value={config.overheadPorHora} onChange={e => setConfig({...config, overheadPorHora: parseFloat(e.target.value)})} style={{...styles.input, ...theme.input}} />
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
                <th style={{...styles.th, width: '180px'}}>Producto</th>
                <th style={{...styles.th, width: '80px'}}>Material(g)</th>
                <th style={{...styles.th, width: '70px'}}>Horas</th>
                <th style={{...styles.th, width: '70px'}}>Min Trab</th>
                <th style={{...styles.th, width: '80px'}}>Packaging</th>
                <th style={{...styles.th, width: '80px'}}>Tasa Fallos</th>
                <th style={{...styles.th, width: '80px'}}>% Ganancia</th>
                <th style={{...styles.th, width: '100px'}}>COSTO</th>
                <th style={{...styles.th, width: '110px'}}>PRECIO FINAL</th>
                <th style={{...styles.th, width: '50px'}}></th>
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
  configCardTitle: { color: '#1a365d', fontWeight: '700' },
  label: { color: '#334155', fontWeight: '600' },
  input: { border: '2px solid #cbd5e1', backgroundColor: '#ffffff', color: '#1e293b', fontWeight: '500' },
  tableSection: { backgroundColor: '#ffffff' },
  sectionTitle: { color: '#1a365d', fontWeight: '700' },
  addButton: { backgroundColor: '#2d8b8b' },
  resetButton: { backgroundColor: '#dc2626' },
  headerRow: { backgroundColor: '#1a365d' },
  th: { color: '#ffffff', fontWeight: '700' },
  row: { borderBottom: '1px solid #e2e8f0' },
  td: { color: '#1e293b', fontWeight: '500' },
  inputText: { border: '2px solid #2d8b8b', color: '#1a365d', backgroundColor: '#f0fdfa', fontWeight: '600' },
  inputNumber: { border: '2px solid #2d8b8b', color: '#1a365d', backgroundColor: '#f0fdfa', fontWeight: '600' },
  calculated: { backgroundColor: '#dcfce7', color: '#166534', fontWeight: '700' },
  finalPrice: { backgroundColor: '#dcfce7', color: '#15803d', fontWeight: '700' },
  footerRow: { backgroundColor: '#f1f5f9' },
  tdFooter: { color: '#1a365d', fontWeight: '700' },
  deleteButton: { color: '#dc2626', fontWeight: '700' },
  footer: { color: '#64748b', backgroundColor: '#f5f7fa' }
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
  configCardTitle: { color: '#2d8b8b' },
  label: { color: '#94a3b8' },
  input: { border: '1px solid #334155', backgroundColor: '#0f172a', color: '#f1faee' },
  tableSection: { backgroundColor: '#1e293b' },
  sectionTitle: { color: '#f1faee' },
  addButton: { backgroundColor: '#2d8b8b' },
  resetButton: { backgroundColor: '#dc2626' },
  headerRow: { backgroundColor: '#0f172a' },
  th: { color: '#f1faee' },
  row: { borderBottom: '1px solid #334155' },
  td: { color: '#e2e8f0' },
  inputText: { border: '1px solid #2d8b8b', color: '#f1faee', backgroundColor: '#0f172a' },
  inputNumber: { border: '1px solid #2d8b8b', color: '#f1faee', backgroundColor: '#0f172a' },
  calculated: { backgroundColor: '#14532d', color: '#86efac' },
  finalPrice: { backgroundColor: '#166534', color: '#4ade80' },
  footerRow: { backgroundColor: '#0f172a' },
  tdFooter: { color: '#e2e8f0' },
  deleteButton: { color: '#f87171' },
  footer: { color: '#94a3b8' }
}

const styles = {
  container: { 
    minHeight: '100vh', 
    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
    transition: 'background-color 0.3s',
    backgroundColor: '#f5f7fa'
  },
  header: {
    padding: '30px 40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '20px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
  },
  headerContent: {},
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    margin: 0,
    letterSpacing: '-0.5px'
  },
  subtitle: {
    fontSize: '14px',
    margin: '5px 0 0 0'
  },
  themeToggle: {
    padding: '10px 16px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s'
  },
  headerStats: {
    display: 'flex',
    gap: '15px'
  },
  statCard: {
    padding: '15px 25px',
    borderRadius: '12px',
    textAlign: 'center',
    border: '1px solid rgba(255,255,255,0.2)'
  },
  statCardHighlight: {},
  statLabel: {
    display: 'block',
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '5px'
  },
  statValue: {
    fontSize: '24px',
    fontWeight: '700'
  },
  statValueGreen: {
    fontSize: '24px',
    fontWeight: '700'
  },
  dataSection: {
    padding: '15px 40px'
  },
  dataInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '15px'
  },
  refreshButton: {
    padding: '10px 20px',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600'
  },
  dataDisplay: {
    display: 'flex',
    gap: '15px',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  dataChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 15px',
    borderRadius: '20px',
    fontSize: '14px'
  },
  dataIcon: {
    fontSize: '16px'
  },
  dataText: {},
  lastUpdate: {
    fontSize: '12px'
  },
  configSection: {
    padding: '30px 40px',
    margin: '20px 40px',
    borderRadius: '16px',
    boxShadow: '0 2px 15px rgba(0,0,0,0.08)'
  },
  sectionTitle: {
    marginBottom: '20px',
    fontSize: '20px',
    fontWeight: '600'
  },
  configGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px'
  },
  configCard: {
    padding: '20px',
    borderRadius: '12px'
  },
  configCardTitle: {
    fontSize: '14px',
    marginBottom: '15px',
    fontWeight: '600'
  },
  inputGroup: {
    marginBottom: '12px'
  },
  label: {
    display: 'block',
    fontSize: '12px',
    marginBottom: '5px'
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none'
  },
  tableSection: {
    padding: '30px 40px',
    margin: '20px 40px',
    borderRadius: '16px',
    boxShadow: '0 2px 15px rgba(0,0,0,0.08)'
  },
  tableHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '15px'
  },
  tableActions: {
    display: 'flex',
    gap: '10px'
  },
  addButton: {
    padding: '10px 20px',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px'
  },
  resetButton: {
    padding: '10px 20px',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px'
  },
  tableWrapper: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '900px'
  },
  headerRow: {},
  th: {
    padding: '14px 10px',
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  row: {
    transition: 'background-color 0.2s'
  },
  td: {
    padding: '12px 10px'
  },
  inputText: {
    width: '100%',
    padding: '8px 10px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500'
  },
  inputNumber: {
    width: '70px',
    padding: '8px',
    borderRadius: '6px',
    fontSize: '13px',
    textAlign: 'right'
  },
  calculated: {
    textAlign: 'right',
    fontWeight: '700',
    fontSize: '14px'
  },
  finalPrice: {
    textAlign: 'right',
    fontWeight: '700',
    fontSize: '15px'
  },
  footerRow: {},
  tdFooter: {
    padding: '15px 10px',
    textAlign: 'right',
    fontSize: '14px'
  },
  deleteButton: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '5px 10px',
    borderRadius: '4px',
    fontWeight: 'bold'
  },
  footer: {
    textAlign: 'center',
    padding: '20px',
    fontSize: '13px'
  }
}
