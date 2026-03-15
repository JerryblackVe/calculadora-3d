export default async function handler(req, res) {
  try {
    const response = await fetch('https://dolarapi.com/v1/dolares/oficial')
    const data = await response.json()
    res.status(200).json({ venta: data.venta, compra: data.compra })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
