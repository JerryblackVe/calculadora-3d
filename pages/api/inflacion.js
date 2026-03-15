export default async function handler(req, res) {
  try {
    const response = await fetch('https://api.argentinadatos.com/v1/finanzas/indices/inflacion')
    const data = await response.json()
    
    const ultimos12 = data.slice(-12)
    const acum = ultimos12.reduce((a, m) => a * (1 + m.valor / 100), 1)
    const anual = parseFloat(((acum - 1) * 100).toFixed(2))
    
    res.status(200).json({ anual })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
