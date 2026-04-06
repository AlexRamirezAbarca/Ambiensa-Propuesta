-- SCRIPT DE MIGRACIÓN: 007_ALTER_LOTES_ABSICA.SQL
-- Úsalo si ya ejecutaste el script 004 anteriormente.

ALTER TABLE public.lotes_unidades 
ADD COLUMN IF NOT EXISTS absica_inicio DECIMAL(10,3) DEFAULT 0.000 NOT NULL;

COMMENT ON COLUMN public.lotes_unidades.absica_inicio IS 'Punto métrico de arranque (Km 0) para el cálculo de avances de excavación.';
