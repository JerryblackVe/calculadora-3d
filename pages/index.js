import { useState, useEffect } from 'react'
import { calcularCosto } from '../lib/calculos'

export default function Home() {
  const [dolar, setDolar] = useState(null)
  const [inflacion, setInflacion] = useState(null)
  const [loading, setLoading] = useState(false)

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
    { id: 8, nombre: 'Caja組織', materialG: 100, horas: 3.5, minTrabajo: 20, packaging: 250, tasaFallos: 0.07, ganancia: 0.3 },
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

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Calculadora de Costos — Impresión 3D</h1>

      <div style={styles.dataSection}>
        <button onClick={actualizarDatos} disabled={loading} style={styles.button}>
          {loading ? 'Cargando...' : 'Actualizar Datos'}
        </button>
        <div style={styles.dataDisplay}>
          {dolar && <span style={styles.dataItem}>💵 Dólar: ${dolar}</span>}
          {inflacion && <span style={styles.dataItem}>📈 Inflación: {inflacion}%</span>}
        </div>
      </div>

      <div style={styles.configSection}>
        <h2 style={styles.sectionTitle}>Configuración Global</h2>
        <div style={styles.configGrid}>
          <div style={styles.configGroup}>
            <h3>Material</h3>
            <label>Precio filamento/kg: <input type="number" value={config.precioFilamentoKg} onChange={e => setConfig({...config, precioFilamentoKg: parseFloat(e.target.value)})} style={styles.input} /></label>
            <label>Mant por hora: <input type="number" value={config.mantPorHora} onChange={e => setConfig({...config, mantPorHora: parseFloat(e.target.value)})} style={styles.input} /></label>
          </div>
          <div style={styles.configGroup}>
            <h3>Electricidad</h3>
            <label>Precio kWh: <input type="number" value={config.precioKwh} onChange={e => setConfig({...config, precioKwh: parseFloat(e.target.value)})} style={styles.input} /></label>
            <label>Potencia(W): <input type="number" value={config.potenciaW} onChange={e => setConfig({...config, potenciaW: parseFloat(e.target.value)})} style={styles.input} /></label>
          </div>
          <div style={styles.configGroup}>
            <h3>Impresora</h3>
            <label>Precio: <input type="number" value={config.precioImpresora} onChange={e => setConfig({...config, precioImpresora: parseFloat(e.target.value)})} style={styles.input} /></label>
            <label>Vida útil(horas): <input type="number" value={config.vidaUtilHoras} onChange={e => setConfig({...config, vidaUtilHoras: parseFloat(e.target.value)})} style={styles.input} /></label>
          </div>
          <div style={styles.configGroup}>
            <h3>Producción</h3>
            <label>Horas/día: <input type="number" value={config.horasDia} onChange={e => setConfig({...config, horasDia: parseFloat(e.target.value)})} style={styles.input} /></label>
            <label>Días/mes: <input type="number" value={config.diasMes} onChange={e => setConfig({...config, diasMes: parseFloat(e.target.value)})} style={styles.input} /></label>
          </div>
          <div style={styles.configGroup}>
            <h3>Costos Fijos</h3>
            <label>Alquiler: <input type="number" value={config.alquiler} onChange={e => setConfig({...config, alquiler: parseFloat(e.target.value)})} style={styles.input} /></label>
            <label>Ads: <input type="number" value={config.ads} onChange={e => setConfig({...config, ads: parseFloat(e.target.value)})} style={styles.input} /></label>
            <label>Monotributo: <input type="number" value={config.monotributo} onChange={e => setConfig({...config, monotributo: parseFloat(e.target.value)})} style={styles.input} /></label>
          </div>
          <div style={styles.configGroup}>
            <h3>Trabajo</h3>
            <label>Valor hora: <input type="number" value={config.valorHoraTrabajo} onChange={e => setConfig({...config, valorHoraTrabajo: parseFloat(e.target.value)})} style={styles.input} /></label>
            <label>Overhead/hora: <input type="number" value={config.overheadPorHora} onChange={e => setConfig({...config, overheadPorHora: parseFloat(e.target.value)})} style={styles.input} /></label>
          </div>
        </div>
      </div>

      <div style={styles.tableSection}>
        <div style={styles.tableHeader}>
          <h2 style={styles.sectionTitle}>Productos</h2>
          <div>
            <button onClick={agregarProducto} style={styles.addButton}>+ Agregar</button>
            <button onClick={resetProductos} style={styles.resetButton}>Reset</button>
          </div>
        </div>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.headerRow}>
                <th style={styles.th}>Producto</th>
                <th style={styles.th}>Material(g)</th>
                <th style={styles.th}>Horas</th>
                <th style={styles.th}>Min Trab</th>
                <th style={styles.th}>Packaging</th>
                <th style={styles.th}>Tasa Fallos</th>
                <th style={styles.th}>% Ganancia</th>
                <th style={styles.th}>COSTO TOTAL</th>
                <th style={styles.th}>PRECIO FINAL</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((producto, index) => {
                const resultado = calcularParaProducto(producto)
                return (
                  <tr key={producto.id} style={styles.row}>
                    <td style={styles.td}><input type="text" value={producto.nombre} onChange={e => handleNombreChange(index, e.target.value)} style={styles.inputText} /></td>
                    <td style={styles.td}><input type="number" value={producto.materialG} onChange={e => handleInputChange(index, 'materialG', e.target.value)} style={styles.inputNumber} /></td>
                    <td style={styles.td}><input type="number" value={producto.horas} onChange={e => handleInputChange(index, 'horas', e.target.value)} style={styles.inputNumber} /></td>
                    <td style={styles.td}><input type="number" value={producto.minTrabajo} onChange={e => handleInputChange(index, 'minTrabajo', e.target.value)} style={styles.inputNumber} /></td>
                    <td style={styles.td}><input type="number" value={producto.packaging} onChange={e => handleInputChange(index, 'packaging', e.target.value)} style={styles.inputNumber} /></td>
                    <td style={styles.td}><input type="number" value={producto.tasaFallos * 100} onChange={e => handleInputChange(index, 'tasaFallos', e.target.value / 100)} style={styles.inputNumber} /></td>
                    <td style={styles.td}><input type="number" value={producto.ganancia * 100} onChange={e => handleInputChange(index, 'ganancia', e.target.value / 100)} style={styles.inputNumber} /></td>
                    <td style={{...styles.td, ...styles.calculated}}>${Math.round(resultado.costoTotal).toLocaleString()}</td>
                    <td style={{...styles.td, ...styles.finalPrice}}>${Math.round(resultado.precioFinal).toLocaleString()}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: { maxWidth: '1400px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' },
  title: { textAlign: 'center', color: '#1A2B4A', marginBottom: '20px', fontSize: '28px' },
  dataSection: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '8px' },
  button: { padding: '10px 20px', backgroundColor: '#1A2B4A', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '14px' },
  dataDisplay: { display: 'flex', gap: '20px' },
  dataItem: { fontSize: '18px', fontWeight: 'bold', color: '#1A2B4A' },
  configSection: { marginBottom: '30px', padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
  sectionTitle: { color: '#1A2B4A', marginBottom: '15px', fontSize: '20px' },
  configGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' },
  configGroup: { padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '5px' },
  configGroupH3: { color: '#1A2B4A', fontSize: '14px', marginBottom: '10px' },
  input: { width: '100%', padding: '5px', marginBottom: '5px', border: '1px solid #ccc', borderRadius: '3px' },
  tableSection: { backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
  tableHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
  addButton: { padding: '8px 15px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginRight: '10px' },
  resetButton: { padding: '8px 15px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: '800px' },
  headerRow: { backgroundColor: '#1A2B4A' },
  th: { padding: '12px', textAlign: 'left', color: 'white', fontSize: '12px' },
  row: { borderBottom: '1px solid #ddd' },
  td: { padding: '8px', fontSize: '13px' },
  inputText: { width: '100%', padding: '5px', border: '1px solid #0000FF', borderRadius: '3px', color: '#0000FF' },
  inputNumber: { width: '70px', padding: '5px', border: '1px solid #0000FF', borderRadius: '3px', color: '#0000FF', textAlign: 'right' },
  calculated: { backgroundColor: '#E8F5E9', textAlign: 'right', fontWeight: 'bold' },
  finalPrice: { backgroundColor: '#F5EEFF', textAlign: 'right', fontWeight: 'bold', fontSize: '14px' }
}
