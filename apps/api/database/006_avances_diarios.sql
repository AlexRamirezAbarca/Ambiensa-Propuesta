-- SCRIPT INCREMENTAL 006: REGISTRO DE AVANCES DIARIOS (CAMPO)
-- Este script habilita la trazabilidad matemática y geográfica de las obras.

----------------------------------------------
-- 1. TABLA DE AVANCES DIARIOS
----------------------------------------------
CREATE TABLE IF NOT EXISTS public.avances_diarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lote_id UUID REFERENCES public.lotes_unidades(id) ON DELETE CASCADE NOT NULL,
  rubro_id UUID REFERENCES public.rubros(id) ON DELETE RESTRICT NOT NULL,
  fiscalizador_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  
  fecha DATE DEFAULT CURRENT_DATE NOT NULL,
  
  -- Abscisas e Ingeniería (Valores del día)
  abs_inicio DECIMAL(10,3) NOT NULL,
  abs_fin DECIMAL(10,3),
  longitud DECIMAL(10,2),
  ancho DECIMAL(10,2),
  area DECIMAL(10,2),
  altura_promedio DECIMAL(10,2),
  volumen_dia DECIMAL(10,2), -- m3
  
  -- Evidencia Fotográfica (URLs a Supabase Storage)
  foto_inicio_url TEXT,
  foto_fin_url TEXT,
  
  -- Geolocalización (Auditoría de Contraloría)
  gps_inicio JSONB DEFAULT NULL, -- {lat: 0.0, lng: 0.0, timestamp: ''}
  gps_fin JSONB DEFAULT NULL,
  
  -- Estado de la jornada
  estado VARCHAR(20) DEFAULT 'iniciado' NOT NULL, -- 'iniciado', 'finalizado'
  
  -- Auditoría de Servidor
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Disparador de Auditoría
CREATE TRIGGER trg_avances_diarios_updated_at
BEFORE UPDATE ON public.avances_diarios
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

----------------------------------------------
-- 2. SEGURIDAD (Row Level Security)
----------------------------------------------
ALTER TABLE public.avances_diarios ENABLE ROW LEVEL SECURITY;

-- Fiscalizadores pueden ver y crear sus propios avances
CREATE POLICY "Fiscalizadores gestionan sus avances" 
ON public.avances_diarios FOR ALL USING (
  auth.uid() = fiscalizador_id
);

-- Supervisores y Contraloría pueden ver todo (Lectura)
CREATE POLICY "Staff puede ver todos los avances" 
ON public.avances_diarios FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.usuarios u
    JOIN public.roles r ON u.role_id = r.id
    WHERE u.id = auth.uid() AND r.nombre IN ('admin', 'administrador', 'supervisor', 'contraloria')
  )
);

----------------------------------------------
-- 3. COMENTARIOS
----------------------------------------------
COMMENT ON TABLE public.avances_diarios IS 'Registro detallado del avance de obra por día/rubro con evidencia GPS y fotográfica.';
