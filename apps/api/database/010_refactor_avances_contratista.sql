-- SCRIPT INCREMENTAL 010: REFACTOR DE AVANCES PARA PLANILLA DIARIA DE CONTRATISTAS
-- Este script destruye el esquema antiguo centrado en fiscalizador/lote 
-- Y despliega un esquema dinámico atado al presupuesto del contratista

-- 1. Eliminar la tabla antigua si existía
DROP TABLE IF EXISTS public.avances_diarios;

-- 2. Crear nueva y poderosa tabla para Planillas Diarias
CREATE TABLE public.avances_diarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  proyecto_presupuesto_id UUID REFERENCES public.proyecto_presupuesto(id) ON DELETE CASCADE NOT NULL,
  contratista_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  
  fecha DATE DEFAULT CURRENT_DATE NOT NULL,
  
  -- Campos dinámicos de Ubicación tipeables
  mz VARCHAR(50) NOT NULL,
  villa VARCHAR(50) NOT NULL,
  calle VARCHAR(100) NOT NULL,
  
  -- Abscisas e Ingeniería (Cálculo del día)
  abs_inicio DECIMAL(10,3) NOT NULL,
  abs_fin DECIMAL(10,3),
  longitud DECIMAL(10,2),
  ancho DECIMAL(10,2),
  altura DECIMAL(10,2),
  volumen_dia DECIMAL(10,2), -- m3 o unidades calculadas
  
  -- Evidencias Base64 Temporal (MVPs y Operabilidad sin Storage)
  foto_inicio_b64 TEXT,
  foto_fin_b64 TEXT,
  
  -- Auditoría Geomática
  gps_inicio JSONB DEFAULT NULL, -- {lat: 0.0, lng: 0.0, timestamp: ''}
  gps_fin JSONB DEFAULT NULL,
  
  -- 'iniciado' (en curso), 'finalizado' (dia cerrado)
  estado VARCHAR(20) DEFAULT 'iniciado' NOT NULL, 
  
  -- Trazabilidad
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Disparador de Auditoría
CREATE TRIGGER trg_avances_diarios_updated_at
BEFORE UPDATE ON public.avances_diarios
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- 3. Habilitar Seguridad Perimetral RLS
ALTER TABLE public.avances_diarios ENABLE ROW LEVEL SECURITY;

-- Política 1: Contratistas pueden Insertar/Seleccionar/Actualizar SUS PROPIAS planillas
CREATE POLICY "Contratistas gestionan sus planillas" 
ON public.avances_diarios FOR ALL USING (
  auth.uid() = contratista_id
) WITH CHECK (
  auth.uid() = contratista_id
);

-- Política 2: La Gerencia y Fiscalizadores pueden LEER las planillas
CREATE POLICY "Supervisores pueden leer planillas" 
ON public.avances_diarios FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.usuarios u
    JOIN public.roles r ON u.role_id = r.id
    WHERE u.id = auth.uid() AND r.nombre IN ('administrador', 'admin', 'supervisor', 'fiscalizador', 'contraloria')
  )
);

COMMENT ON TABLE public.avances_diarios IS 'Nuevas Planillas Diarias del Contratista con geo-auditoría automática.';
