-- SCRIPT INCREMENTAL 012: ENTIDAD JORNADAS DIARIAS
-- Permite agrupar múltiples reportes de avances bajo un mismo día de trabajo.

-- 1. Crear tabla de Jornadas
CREATE TABLE public.jornadas_diarias (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contratista_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE NOT NULL,
  fecha DATE DEFAULT CURRENT_DATE NOT NULL,
  estado VARCHAR(20) DEFAULT 'abierta' NOT NULL, -- 'abierta', 'cerrada'
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Junction Tabla para Rubros Planeados en la Jornada
CREATE TABLE public.jornada_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  jornada_id UUID REFERENCES public.jornadas_diarias(id) ON DELETE CASCADE NOT NULL,
  proyecto_presupuesto_id UUID REFERENCES public.proyecto_presupuesto(id) ON DELETE CASCADE NOT NULL,
  
  -- Para saber si ya se generó un avance para este item de la jornada
  UNIQUE(jornada_id, proyecto_presupuesto_id)
);

-- 3. Trigger de Auditoría
CREATE TRIGGER trg_jornadas_diarias_updated_at
BEFORE UPDATE ON public.jornadas_diarias
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- 4. Modificar Avances Diarios para referenciar la Jornada
ALTER TABLE public.avances_diarios 
ADD COLUMN jornada_id UUID REFERENCES public.jornadas_diarias(id) ON DELETE SET NULL;

-- 5. RLS para Jornadas e Items
ALTER TABLE public.jornadas_diarias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jornada_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Contratistas ven sus jornadas" 
ON public.jornadas_diarias FOR ALL USING (auth.uid() = contratista_id) WITH CHECK (auth.uid() = contratista_id);

CREATE POLICY "Contratistas ven sus items" 
ON public.jornada_items FOR ALL USING (
  EXISTS (SELECT 1 FROM public.jornadas_diarias j WHERE j.id = jornada_id AND j.contratista_id = auth.uid())
);

CREATE POLICY "Supervisores ven todo" 
ON public.jornadas_diarias FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.usuarios u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.nombre IN ('administrador', 'admin', 'supervisor', 'fiscalizador', 'contraloria'))
);

CREATE POLICY "Supervisores ven items" 
ON public.jornada_items FOR SELECT USING (true);

COMMENT ON TABLE public.jornadas_diarias IS 'Agrupación lógica de avances reportados en un mismo día por el contratista.';
COMMENT ON TABLE public.jornada_items IS 'Rubros específicos planificados para una jornada diaria.';
