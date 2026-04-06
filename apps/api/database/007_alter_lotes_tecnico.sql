-- SCRIPT INCREMENTAL 007: VOLUMEN ACUMULADO TÉCNICO
-- Ejecutar en el SQL Editor de Supabase

ALTER TABLE public.lotes_unidades 
ADD COLUMN IF NOT EXISTS volumen_acumulado DECIMAL(10,2) DEFAULT 0.00 NOT NULL;

COMMENT ON COLUMN public.lotes_unidades.volumen_acumulado IS 'Suma total de m3 reportados en avances diarios para esta unidad.';
