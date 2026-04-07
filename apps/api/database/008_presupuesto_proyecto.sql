-- SCRIPT INCREMENTAL 008: GESTIÓN DE PRESUPUESTOS (VÍA EXCEL)
-- Requerimiento: Catálogo por proyecto con (rubro, descripcion, unidad, cantidad, precio_unitario, dias).

----------------------------------------------
-- 1. TABLA DE PRESUPUESTO DEL PROYECTO
----------------------------------------------
CREATE TABLE IF NOT EXISTS public.proyecto_presupuesto (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  proyecto_id UUID REFERENCES public.proyectos(id) ON DELETE CASCADE NOT NULL,
  
  -- Campos provenientes del Excel
  rubro VARCHAR(255) NOT NULL,
  descripcion TEXT,
  unidad VARCHAR(50) DEFAULT 'GLB',
  cantidad DECIMAL(15,2) DEFAULT 0.00,
  precio_unitario DECIMAL(15,2) DEFAULT 0.00,
  tiempo_dias INT DEFAULT 0,
  
  -- Auditoría
  estado BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Disparador de Auditoría para Presupuesto
CREATE TRIGGER trg_proyecto_presupuesto_updated_at
BEFORE UPDATE ON public.proyecto_presupuesto
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

----------------------------------------------
-- 2. SEGURIDAD (Row Level Security)
----------------------------------------------
ALTER TABLE public.proyecto_presupuesto ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios autenticados pueden ver presupuestos" 
ON public.proyecto_presupuesto FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Fiscalizadores pueden gestionar presupuestos" 
ON public.proyecto_presupuesto FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.usuarios u
    JOIN public.roles r ON u.role_id = r.id
    WHERE u.id = auth.uid() AND r.nombre = 'fiscalizador'
  )
);

----------------------------------------------
-- 3. COMENTARIOS DE TABLA
----------------------------------------------
COMMENT ON TABLE public.proyecto_presupuesto IS 'Tabla para asignar presupuesto y rúbricas dinámicas a cada proyecto cargado vía Excel.';
