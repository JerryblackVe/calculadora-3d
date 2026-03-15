export function calcularCosto(params) {
  const {
    materialG,
    horasImpresion,
    minTrabajo,
    packaging,
    tasaFallos,
    ganancia,
    precioFilamentoKg,
    factorInflacion,
    precioKwh,
    potenciaW,
    precioImpresora,
    vidaUtilHoras,
    mantPorHora,
    valorHoraTrabajo,
    overheadPorHour
  } = params

  const costoMaterial = (materialG / 1000) * precioFilamentoKg * factorInflacion
  const costoElect = horasImpresion * (potenciaW / 1000) * precioKwh
  const desgaste = horasImpresion * (precioImpresora / vidaUtilHoras)
  const mantenimiento = horasImpresion * mantPorHora
  const mobraObra = (minTrabajo / 60) * valorHoraTrabajo
  const costoBase = costoMaterial + costoElect + desgaste + mantenimiento + mobraObra + packaging
  const costoFallos = costoBase / (1 - tasaFallos)
  const overhead = horasImpresion * overheadPorHour
  const costoTotal = costoFallos + overhead
  const precioFinal = costoTotal * (1 + ganancia)

  return {
    costoMaterial,
    costoElect,
    desgaste,
    mantenimiento,
    mobraObra,
    costoBase,
    costoFallos,
    overhead,
    costoTotal,
    precioFinal
  }
}
