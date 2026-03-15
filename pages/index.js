import { useState, useEffect } from 'react'
import { calcularCosto } from '../lib/calculos'

export default function Home() {
  const [dolar, setDolar] = useState(null)
  const [inflacion, setInflacion] = useState(null)
  const [loading, setLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(null)

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

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>🖨️ Calculadora de Costos</h1>
          <p style={styles.subtitle}>Impresión 3D - Gestión Profesional</p>
        </div>
        <div style={styles.headerStats}>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Costo Total</span>
            <span style={styles.statValue}>${Math.round(costoTotalGeneral).toLocaleString()}</span>
          </div>
          <div style={{...styles.statCard, ...styles.statCardHighlight}}>
            <span style={styles.statLabel}>Ingreso Potential</span>
            <span style={styles.statValueGreen}>${Math.round(precioTotalGeneral).toLocaleString()}</span>
          </div>
        </div>
      </header>

      <div style={styles.dataSection}>
        <div style={styles.dataInfo}>
          <button onClick={actualizarDatos} disabled={loading} style={styles.refreshButton}>
            {loading ? '⏳ Actualizando...' : '🔄 Actualizar Datos'}
          </button>
          <div style={styles.dataDisplay}>
            {dolar && (
              <div style={styles.dataChip}>
                <span style={styles.dataIcon}>💵</span>
                <span style={styles.dataText}>Dólar: <strong>${dolar}</strong></span>
              </div>
            )}
            {inflacion && (
              <div style={styles.dataChip}>
                <span style={styles.dataIcon}>📈</span>
                <span style={styles.dataText}>Inflación: <strong>{inflacion}%</strong></span>
              </div>
            )}
            {lastUpdate && (
              <span style={styles.lastUpdate}>Actualizado: {lastUpdate.toLocaleTimeString()}</span>
            )}
          </div>
        </div>
      </div>

      <section style={styles.configSection}>
        <h2 style={styles.sectionTitle}>⚙️ Configuración Global</h2>
        <div style={styles.configGrid}>
          <div style={styles.configCard}>
            <h3 style={styles.configCardTitle}>🎨 Material</h3>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Precio filamento/kg ($)</label>
              <input type="number" value={config.precioFilamentoKg} onChange={e => setConfig({...config, precioFilamentoKg: parseFloat(e.target.value)})} style={styles.input} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Mant. por hora ($)</label>
              <input type="number" value={config.mantPorHora} onChange={e => setConfig({...config, mantPorHora: parseFloat(e.target.value)})} style={styles.input} />
            </div>
          </div>
          <div style={styles.configCard}>
            <h3 style={styles.configCardTitle}>⚡ Electricidad</h3>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Precio kWh ($)</label>
              <input type="number" value={config.precioKwh} onChange={e => setConfig({...config, precioKwh: parseFloat(e.target.value)})} style={styles.input} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Potencia (W)</label>
              <input type="number" value={config.potenciaW} onChange={e => setConfig({...config, potenciaW: parseFloat(e.target.value)})} style={styles.input} />
            </div>
          </div>
          <div style={styles.configCard}>
            <h3 style={styles.configCardTitle}>🖨️ Impresora</h3>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Precio ($)</label>
              <input type="number" value={config.precioImpresora} onChange={e => setConfig({...config, precioImpresora: parseFloat(e.target.value)})} style={styles.input} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Vida útil (horas)</label>
              <input type="number" value={config.vidaUtilHoras} onChange={e => setConfig({...config, vidaUtilHoras: parseFloat(e.target.value)})} style={styles.input} />
            </div>
          </div>
          <div style={styles.configCard}>
            <h3 style={styles.configCardTitle}>📅 Producción</h3>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Horas/día</label>
              <input type="number" value={config.horasDia} onChange={e => setConfig({...config, horasDia: parseFloat(e.target.value)})} style={styles.input} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Días/mes</label>
              <input type="number" value={config.diasMes} onChange={e => setConfig({...config, diasMes: parseFloat(e.target.value)})} style={styles.input} />
            </div>
          </div>
          <div style={styles.configCard}>
            <h3 style={styles.configCardTitle}>🏢 Costos Fijos</h3>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Alquiler ($)</label>
              <input type="number" value={config.alquiler} onChange={e => setConfig({...config, alquiler: parseFloat(e.target.value)})} style={styles.input} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Ads + Otros ($)</label>
              <input type="number" value={config.ads + config.monotributo + config.gasolina} onChange={e => setConfig({...config, ads: parseFloat(e.target.value) - config.monotributo - config.gasolina})} style={styles.input} />
            </div>
          </div>
          <div style={styles.configCard}>
            <h3 style={styles.configCardTitle}>👨‍💼 Trabajo</h3>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Valor hora ($)</label>
              <input type="number" value={config.valorHoraTrabajo} onChange={e => setConfig({...config, valorHoraTrabajo: parseFloat(e.target.value)})} style={styles.input} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Overhead/hora ($)</label>
              <input type="number" value={config.overheadPorHora} onChange={e => setConfig({...config, overheadPorHora: parseFloat(e.target.value)})} style={styles.input} />
            </div>
          </div>
        </div>
      </section>

      <section style={styles.tableSection}>
        <div style={styles.tableHeader}>
          <h2 style={styles.sectionTitle}>📦 Productos ({productos.length})</h2>
          <div style={styles.tableActions}>
            <button onClick={agregarProducto} style={styles.addButton}>➕ Agregar</button>
            <button onClick={resetProductos} style={styles.resetButton}>🗑️ Reset</button>
          </div>
        </div>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.headerRow}>
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
                  <tr key={producto.id} style={styles.row}>
                    <td style={styles.td}>
                      <input type="text" value={producto.nombre} onChange={e => handleNombreChange(index, e.target.value)} style={styles.inputText} />
                    </td>
                    <td style={styles.td}>
                      <input type="number" value={producto.materialG} onChange={e => handleInputChange(index, 'materialG', e.target.value)} style={styles.inputNumber} />
                    </td>
                    <td style={styles.td}>
                      <input type="number" value={producto.horas} onChange={e => handleInputChange(index, 'horas', e.target.value)} style={styles.inputNumber} />
                    </td>
                    <td style={styles.td}>
                      <input type="number" value={producto.minTrabajo} onChange={e => handleInputChange(index, 'minTrabajo', e.target.value)} style={styles.inputNumber} />
                    </td>
                    <td style={styles.td}>
                      <input type="number" value={producto.packaging} onChange={e => handleInputChange(index, 'packaging', e.target.value)} style={styles.inputNumber} />
                    </td>
                    <td style={styles.td}>
                      <input type="number" value={Math.round(producto.tasaFallos * 100)} onChange={e => handleInputChange(index, 'tasaFallos', e.target.value / 100)} style={styles.inputNumber} />
                    </td>
                    <td style={styles.td}>
                      <input type="number" value={Math.round(producto.ganancia * 100)} onChange={e => handleInputChange(index, 'ganancia', e.target.value / 100)} style={styles.inputNumber} />
                    </td>
                    <td style={{...styles.td, ...styles.calculated}}>${Math.round(resultado.costoTotal).toLocaleString()}</td>
                    <td style={{...styles.td, ...styles.finalPrice}}>${Math.round(resultado.precioFinal).toLocaleString()}</td>
                    <td style={styles.td}>
                      <button onClick={() => eliminarProducto(producto.id)} style={styles.deleteButton}>×</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr style={styles.footerRow}>
                <td style={styles.tdFooter} colSpan={7}><strong>TOTALES</strong></td>
                <td style={{...styles.tdFooter, ...styles.calculated}}><strong>${Math.round(costoTotalGeneral).toLocaleString()}</strong></td>
                <td style={{...styles.tdFooter, ...styles.finalPrice}}><strong>${Math.round(precioTotalGeneral).toLocaleString()}</strong></td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <footer style={styles.footer}>
        <p>💡 Los cálculos se actualizan automáticamente cuando modificas cualquier valor</p>
      </footer>
    </div>
  )
}

const styles = {
  container: { 
    minHeight: '100vh', 
    backgroundColor: '#f8fafc',
    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif"
  },
  header: {
    background: 'linear-gradient(135deg, #1a2332 0%, #2d4a5e 100%)',
    color: '#f1faee',
    padding: '30px 40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '20px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
  },
  headerContent: {},
  title: {
    fontSize: '32px',
    fontWeight: '700',
    margin: 0,
    letterSpacing: '-0.5px'
  },
  subtitle: {
    fontSize: '14px',
    margin: '5px 0 0 0',
    opacity: 0.8
  },
  headerStats: {
    display: 'flex',
    gap: '15px'
  },
  statCard: {
    background: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
    padding: '15px 25px',
    borderRadius: '12px',
    textAlign: 'center',
    border: '1px solid rgba(255,255,255,0.2)'
  },
  statCardHighlight: {
    background: 'rgba(45, 139, 139, 0.3)',
  },
  statLabel: {
    display: 'block',
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    opacity: 0.8,
    marginBottom: '5px'
  },
  statValue: {
    fontSize: '24px',
    fontWeight: '700'
  },
  statValueGreen: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#4ade80'
  },
  dataSection: {
    background: '#1a2332',
    padding: '15px 40px',
    borderBottom: '3px solid #2d8b8b'
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
    backgroundColor: '#2d8b8b',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s'
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
    background: 'rgba(255,255,255,0.1)',
    padding: '8px 15px',
    borderRadius: '20px',
    fontSize: '14px'
  },
  dataIcon: {
    fontSize: '16px'
  },
  dataText: {
    color: '#f1faee'
  },
  lastUpdate: {
    color: 'rgba(241, 250, 238, 0.6)',
    fontSize: '12px'
  },
  configSection: {
    padding: '30px 40px',
    backgroundColor: 'white',
    margin: '20px 40px',
    borderRadius: '16px',
    boxShadow: '0 2px 15px rgba(0,0,0,0.08)'
  },
  sectionTitle: {
    color: '#1a2332',
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
    background: '#f8fafc',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0'
  },
  configCardTitle: {
    color: '#2d8b8b',
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
    color: '#64748b',
    marginBottom: '5px'
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    outline: 'none'
  },
  tableSection: {
    backgroundColor: 'white',
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
    backgroundColor: '#2d8b8b',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px'
  },
  resetButton: {
    padding: '10px 20px',
    backgroundColor: '#ef4444',
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
  headerRow: {
    backgroundColor: '#1a2332'
  },
  th: {
    padding: '14px 10px',
    textAlign: 'left',
    color: '#f1faee',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  row: {
    borderBottom: '1px solid #e2e8f0',
    transition: 'background-color 0.2s'
  },
  td: {
    padding: '12px 10px'
  },
  inputText: {
    width: '100%',
    padding: '8px 10px',
    border: '1px solid #2d8b8b',
    borderRadius: '6px',
    color: '#1a2332',
    fontSize: '13px',
    fontWeight: '500'
  },
  inputNumber: {
    width: '70px',
    padding: '8px',
    border: '1px solid #2d8b8b',
    borderRadius: '6px',
    color: '#1a2332',
    fontSize: '13px',
    textAlign: 'right'
  },
  calculated: {
    backgroundColor: '#e8f5e9',
    textAlign: 'right',
    fontWeight: '700',
    fontSize: '14px',
    color: '#1a2332'
  },
  finalPrice: {
    backgroundColor: '#f0fdf4',
    textAlign: 'right',
    fontWeight: '700',
    fontSize: '15px',
    color: '#166534'
  },
  footerRow: {
    backgroundColor: '#f1f5f9'
  },
  tdFooter: {
    padding: '15px 10px',
    textAlign: 'right',
    fontSize: '14px',
    color: '#1a2332'
  },
  deleteButton: {
    background: 'none',
    border: 'none',
    color: '#ef4444',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '5px 10px',
    borderRadius: '4px',
    fontWeight: 'bold'
  },
  footer: {
    textAlign: 'center',
    padding: '20px',
    color: '#64748b',
    fontSize: '13px'
  }
}
