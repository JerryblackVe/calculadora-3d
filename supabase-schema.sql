-- Ejecutar esto en el SQL Editor de Supabase

-- Tabla de configuraciones de usuarios
CREATE TABLE IF NOT EXISTS configs (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  config_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de productos de usuarios
CREATE TABLE IF NOT EXISTS productos (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  productos_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de historial de dólar e inflación
CREATE TABLE IF NOT EXISTS exchange_rates (
  id BIGSERIAL PRIMARY KEY,
  dolar DECIMAL(10,2),
  inflacion DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir acceso público (para simplificar)
CREATE POLICY "Allow public access configs" ON configs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access productos" ON productos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access exchange_rates" ON exchange_rates FOR ALL USING (true) WITH CHECK (true);

-- Función para actualizar timestamp automáticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar timestamps
CREATE TRIGGER update_configs_updated_at BEFORE UPDATE ON configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_productos_updated_at BEFORE UPDATE ON productos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
