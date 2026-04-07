-- SCRIPT INCREMENTAL 004: GESTIÓN DE PROYECTOS Y LOTES (1:N)
-- Instrucciones: Ejecuta este código en tu SQL Editor de Supabase después de los scripts 001, 002 y 003.

----------------------------------------------
-- 1. TABLA DE PROYECTOS (URBANIZACIONES)
----------------------------------------------
CREATE TABLE IF NOT EXISTS public.proyectos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  ubicacion TEXT,
  estado BOOLEAN DEFAULT true NOT NULL,
  
  -- Auditoría
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Disparador de Auditoría para Proyectos
CREATE TRIGGER trg_proyectos_updated_at
BEFORE UPDATE ON public.proyectos
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

----------------------------------------------
-- 2. TABLA DE LOTES/UNIDADES (HIJOS)
----------------------------------------------
CREATE TABLE IF NOT EXISTS public.lotes_unidades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  proyecto_id UUID REFERENCES public.proyectos(id) ON DELETE CASCADE NOT NULL,
  calle VARCHAR(255),
  mz VARCHAR(50),
  villa VARCHAR(50),
  id_fiscalizador UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  absica_inicio DECIMAL(10,3) DEFAULT 0.000 NOT NULL, 
  estado_avance DECIMAL(5,2) DEFAULT 0.00 NOT NULL, -- Rango 0.00 a 100.00
  detalles JSONB DEFAULT '{}'::jsonb, -- Para campos dinámicos como 'abs inicio'
  
  -- Auditoría
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Disparador de Auditoría para Lotes
CREATE TRIGGER trg_lotes_unidades_updated_at
BEFORE UPDATE ON public.lotes_unidades
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

----------------------------------------------
-- 3. SEGURIDAD (Row Level Security)
----------------------------------------------
ALTER TABLE public.proyectos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lotes_unidades ENABLE ROW LEVEL SECURITY;

-- Políticas para Proyectos
CREATE POLICY "Usuarios autenticados pueden ver proyectos" 
ON public.proyectos FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins y Supervisores pueden gestionar proyectos" 
ON public.proyectos FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.usuarios u
    JOIN public.roles r ON u.role_id = r.id
    WHERE u.id = auth.uid() AND r.nombre IN ('admin', 'administrador', 'supervisor')
  )
);

-- Políticas para Lotes
CREATE POLICY "Usuarios autenticados pueden ver lotes" 
ON public.lotes_unidades FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins y Supervisores pueden gestionar lotes" 
ON public.lotes_unidades FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.usuarios u
    JOIN public.roles r ON u.role_id = r.id
    WHERE u.id = auth.uid() AND r.nombre IN ('admin', 'supervisor')
  )
);

CREATE POLICY "Fiscalizadores pueden actualizar sus lotes asignados" 
ON public.lotes_unidades FOR UPDATE USING (
  auth.uid() = id_fiscalizador
);

----------------------------------------------
-- 4. COMENTARIOS DE TABLA (Metadatos)
----------------------------------------------
COMMENT ON TABLE public.proyectos IS 'Tabla maestra de Urbanizaciones y Proyectos inmobiliarios.';
COMMENT ON TABLE public.lotes_unidades IS 'Tabla de unidades individuales (villas/lotes) que pertenecen a un proyecto. Cada una tiene su propio fiscalizador responsable.';
