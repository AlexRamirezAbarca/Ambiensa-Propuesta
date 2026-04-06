-- SCRIPT INCREMENTAL 005: CATÁLOGO DE RUBROS TÉCNICOS
-- Instrucciones: Ejecuta este código en tu SQL Editor de Supabase.

----------------------------------------------
-- 1. TABLA DE RUBROS (CATÁLOGO MAESTRO)
----------------------------------------------
CREATE TABLE IF NOT EXISTS public.rubros (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL UNIQUE,
  descripcion TEXT,
  categoria VARCHAR(100), -- Ej: Movimiento de Tierras, Obra Gris, etc.
  unidad_medida VARCHAR(50) DEFAULT 'GLB', -- Ej: m2, m3, Un, GLB
  estado BOOLEAN DEFAULT true NOT NULL,
  
  -- Auditoría
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Disparador de Auditoría para Rubros
CREATE TRIGGER trg_rubros_updated_at
BEFORE UPDATE ON public.rubros
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

----------------------------------------------
-- 2. SEGURIDAD (Row Level Security)
----------------------------------------------
ALTER TABLE public.rubros ENABLE ROW LEVEL SECURITY;

-- Lectura para todos los autenticados (Fiscalizadores necesitan ver los rubros para reportar)
CREATE POLICY "Usuarios autenticados pueden ver rubros" 
ON public.rubros FOR SELECT USING (auth.role() = 'authenticated');

-- Gestión exclusiva para Supervisores y Admins
CREATE POLICY "Supervisores y Admins pueden gestionar rubros" 
ON public.rubros FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.usuarios u
    JOIN public.roles r ON u.role_id = r.id
    WHERE u.id = auth.uid() AND r.nombre IN ('admin', 'supervisor')
  )
);

----------------------------------------------
-- 3. REGISTRO INICIAL (DEMO)
----------------------------------------------
INSERT INTO public.rubros (nombre, descripcion, categoria, unidad_medida)
VALUES (
  'Excavación',
  'Remoción de tierra para cimentación y bases estructurales.',
  'Movimiento de Tierras',
  'm3'
) ON CONFLICT (nombre) DO NOTHING;

----------------------------------------------
-- 4. COMENTARIOS DE TABLA
----------------------------------------------
COMMENT ON TABLE public.rubros IS 'Catálogo maestro de actividades técnicas (Rubros) para el control de obra.';
