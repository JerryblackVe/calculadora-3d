# Fantastic Plastik - Calculadora de Costos 3D

## Descripcion General

**Fantastic Plastik** es una aplicacion web de calculadora de costos para negocios de impresion 3D. Permite a los usuarios calcular el costo de produccion y el precio de venta de productos impresos en 3D, considerando materiales, energia, desgaste de equipos, mano de obra, costos fijos del negocio y margen de ganancia.

La aplicacion esta desarrollada con **Next.js** (Pages Router), utiliza **Supabase** como base de datos en la nube para persistencia de datos, y esta desplegada en **Vercel**.

---

## Descripcion Tecnica

### Stack Tecnologico

| Tecnologia | Version | Uso |
|------------|---------|-----|
| Next.js | 16.1.6 | Framework React - Pages Router |
| React | 19.2.4 | Libreria de interfaz de usuario |
| Supabase | 2.99.1 | Base de datos cloud (PostgreSQL) |
| Vercel | - | Plataforma de alojamiento y deployment |
| axios | 1.6.0 | Cliente HTTP (API dolar/inflacion) |

### Estructura de Archivos

```
calculadora-3d/
├── .env.local                  # Variables de entorno locales
├── .gitignore                  # Archivos ignorados por Git
├── package.json                # Dependencias del proyecto
├── package-lock.json           # Lock de dependencias
├── supabase-schema.sql         # Schema de base de datos
│
├── pages/                      # Rutas de la aplicacion (Pages Router)
│   ├── _app.js                 # Componente raiz de Next.js
│   ├── index.js                # Pagina principal - Calculadora
│   ├── config.js               # Pagina de configuracion
│   │
│   └── api/                    # API Routes de Next.js
│       ├── dolar.js            # API - Cotizacion dolar oficial
│       └── inflacion.js        # API - Indice de inflacion Argentina
│
├── lib/                        # Utilidades y logica de negocio
│   ├── supabase.js             # Cliente Supabase y funciones CRUD
│   └── calculos.js             # Logica de calculo de costos
│
├── styles/
│   └── globals.css             # Estilos globales
│
└── .next/                      # Build de produccion (generado)
```

---

## Rutas

### Rutas Locales (Desarrollo)

| Ruta | Descripcion |
|------|-------------|
| `http://localhost:3000` | Pagina principal - Calculadora de costos |
| `http://localhost:3000/config` | Pagina de configuracion de parametros |
| `http://localhost:3000/api/dolar` | API - Obtener cotizacion del dolar |
| `http://localhost:3000/api/inflacion` | API - Obtener indice de inflacion |

### Rutas en Produccion (Vercel)

| Ruta | Descripcion |
|------|-------------|
| `https://calculadora-3d-ten.vercel.app` | Pagina principal - Calculadora |
| `https://calculadora-3d-ten.vercel.app/config` | Configuracion |
| `https://calculadora-3d-ten.vercel.app/api/dolar` | API Dolar |
| `https://calculadora-3d-ten.vercel.app/api/inflacion` | API Inflacion |

---

## Funcionalidades

### Pagina Principal (index.js)

1. **Calculadora de Costos**
   - Tabla de productos con parametros editables:
     - Nombre del producto
     - Material (gramos)
     - Horas de impresion
     - Minutos de trabajo manual
     - Costo de packaging
     - Tasa de fallos (%)
     - Porcentaje de ganancia (%)
   - Calculo automatico de:
     - **COSTO**: Costo total de produccion
     - **PRECIO FINAL**: Precio de venta sugerido

2. **Gestion de Productos**
   - Agregar nuevos productos
   - Eliminar productos existentes
   - Resetear productos a valores por defecto
   - Persistencia en Supabase

3. **Datos Economicos**
   - Boton para actualizar datos economicos desde APIs externas:
     - Dolar oficial (Argentina)
     - Inflacion anual (Argentina)
   - Factor de inflacion aplicado automaticamente

4. **Tema Visual**
   - Modo claro / oscuro
   - Persistencia del tema en localStorage
   - Transiciones suaves entre temas

5. **Guardado**
   - Boton para guardar configuracion y productos
   - Persistencia en Supabase

### Pagina de Configuracion (config.js)

Paramros configurables del negocio:

1. **Materiales**
   - Precio del filamento por kg ($)

2. **Energia**
   - Precio por kWh ($)
   - Potencia de la impresora (W)

3. **Equipo**
   - Precio de la impresora ($)
   - Vida util (horas)

4. **Operaciones**
   - Horas por dia
   - Dias por mes

5. **Costos Fijos**
   - Alquiler mensual ($)
   - Proporcion del espacio (%) - cuanto usa el negocio
   - Gastos en Facebook Ads ($)
   - Monotributo ($)
   - Gastos de gasolina ($)

6. **Mano de Obra**
   - Mantenimiento por hora ($)
   - Valor de hora de trabajo ($)

7. **Resumen Calculado**
   - Horas/mes
   - Desgaste por hora
   - Alquiler del espacio de negocio
   - Total de costos fijos/mes
   - **Overhead por hora** (valor clave para calculos)

---

## Logica de Calculo (calculos.js)

### Formula de Calculo de Costo

```javascript
// 1. Costo de material
costoMaterial = (gramos / 1000) * precioPorKg * factorInflacion

// 2. Costo de electricidad
costoElect = horasImpresion * (potenciaW / 1000) * precioKwh

// 3. Costo de desgaste de impresora
desgaste = horasImpresion * (precioImpresora / vidaUtilHoras)

// 4. Costo de mantenimiento
mantenimiento = horasImpresion * mantPorHora

// 5. Costo de mano de obra
manoObra = (minutosTrabajo / 60) * valorHoraTrabajo

// 6. Costo base
costoBase = costoMaterial + costoElect + desgaste + mantenimiento + manoObra + packaging

// 7. Costo con fallos (recupera perdidas por fallos)
costoFallos = costoBase / (1 - tasaFallos)

// 8. Overhead (costos fijos distribuidos)
overhead = horasImpresion * overheadPorHora

// 9. Costo total
costoTotal = costoFallos + overhead

// 10. Precio final (con ganancia)
precioFinal = costoTotal * (1 + porcentajeGanancia)
```

### Parametros de Calculo

| Parametro | Descripcion | Origen |
|-----------|-------------|--------|
| `materialG` | Gramos de material | Producto |
| `horasImpresion` | Horas de impresion | Producto |
| `minTrabajo` | Minutos de trabajo manual | Producto |
| `packaging` | Costo de empaque | Producto |
| `tasaFallos` | Porcentaje de fallos esperados | Producto |
| `ganancia` | Margen de ganancia (%) | Producto |
| `precioFilamentoKg` | Precio filamento/kg | Configuracion |
| `factorInflacion` | Multiplicador por inflacion | API externa |
| `precioKwh` | Costo energia | Configuracion |
| `potenciaW` | Potencia impresora | Configuracion |
| `precioImpresora` | Costo equipo | Configuracion |
| `vidaUtilHoras` | Horas de vida util | Configuracion |
| `mantPorHora` | Mantenimiento/hora | Configuracion |
| `valorHoraTrabajo` | Costo hora trabajo | Configuracion |
| `overheadPorHora` | Costos fijos/hora | Calculado desde config |

---

## Base de Datos (Supabase)

### Tablas

#### Tabla: `config`
Almacena la configuracion del negocio (una sola fila con id=1).

| Columna | Tipo | Descripcion |
|---------|------|-------------|
| `id` | integer | Identificador (PK) |
| `precio_filamento_kg` | numeric | Precio filamento/kg |
| `precio_kwh` | numeric | Precio kWh |
| `potencia_w` | numeric | Potencia impresora (W) |
| `precio_impresora` | numeric | Precio impresora |
| `vida_util_horas` | numeric | Vida util (horas) |
| `horas_dia` | numeric | Horas operacion/dia |
| `dias_mes` | numeric | Dias operacion/mes |
| `alquiler_mensual` | numeric | Alquiler mensual |
| `proporcion_espacio` | numeric | % espacio usado |
| `facebook_ads` | numeric | Gasto mensual en ads |
| `monotributo` | numeric | Monotributo mensual |
| `gasolina` | numeric | Gastos movilidad |
| `mant_por_hora` | numeric | Mantenimiento/hora |
| `valor_hora_trabajo` | numeric | Valor hora trabajo |
| `dolar_oficial` | numeric | Ultimo valor dolar |
| `inflacion_anual` | numeric | Ultimo % inflacion |

#### Tabla: `productos`
Almacena los productos del usuario (hasta 10 productos).

| Columna | Tipo | Descripcion |
|---------|------|-------------|
| `id` | integer | Identificador (PK, 1-10) |
| `nombre` | text | Nombre del producto |
| `material_g` | numeric | Material en gramos |
| `horas_impresion` | numeric | Horas de impresion |
| `min_trabajo` | numeric | Minutos de trabajo |
| `packaging` | numeric | Costo packaging |
| `tasa_fallos` | numeric | Tasa de fallos (0-1) |
| `porcentaje_ganancia` | numeric | Ganancia (0-1) |
| `orden` | integer | Orden de visualizacion |

---

## APIs Externas

### API Dolar (dolarapi.com)

```javascript
// Endpoint
GET https://dolarapi.com/v1/dolares/oficial

// Respuesta
{
  "venta": 1050.00,
  "compra": 1000.00
}
```

### API Inflacion (argentinadatos.com)

```javascript
// Endpoint
GET https://api.argentinadatos.com/v1/finanzas/indices/inflacion

// Respuesta (calculado)
// Ultimos 12 meses acumulados
{
  "anual": 52.35  // Porcentaje
}
```

---

## Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Build de produccion
npm run build

# Iniciar servidor de produccion
npm start

# Verificar codigo (lint)
npm run lint
```

---

## Variables de Entorno

### Desarrollo (.env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=https://bzdrxvsrpgpugizrmkap.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Produccion (Vercel)

Configurar en el dashboard de Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Características Adicionales

1. **Interfaz en Español** - Toda la aplicacion esta en español
2. **Diseño Responsivo** - Se adapta a dispositivos moviles y escritorio
3. **Modo Oscuro** - Soporte para tema oscuro/claro con persistencia
4. **Persistencia en la Nube** - Datos guardados en Supabase
5. **Calculos en Tiempo Real** - Los costos se actualizan al instante
6. **APIs de Economia Argentina** - Dolar oficial e inflacion automatica

---

## Historial de Commits (Recientes)

- `bc5590b` - Fix React error #418 - remove duplicate useEffects for dark mode
- `199e74b` - Fix: reuse Supabase client instance to prevent multiple instances

---

## Licencia

Proyecto privado para Fantastic Plastik.
