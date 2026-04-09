-- SCRIPT INCREMENTAL 011: AJUSTE DE VILLAS Y ÁREAS PARA PLANILLA DIARIA
-- Este script realiza cambios incrementales sobre la tabla creada en el script 010
-- Sin destruir datos, solo renombrando y añadiendo columnas necesarias.

-- 1. Renombrar columna 'villa' a 'villa_desde' para mayor claridad
ALTER TABLE public.avances_diarios 
RENAME COLUMN villa TO villa_desde;

-- 2. Añadir columna 'villa_hasta'
ALTER TABLE public.avances_diarios 
ADD COLUMN villa_hasta VARCHAR(50);

-- 3. Añadir columna 'area_dia' para el cálculo intermedio (L * A)
ALTER TABLE public.avances_diarios 
ADD COLUMN area_dia DECIMAL(10,2);

-- 4. Actualizar comentarios de la tabla
COMMENT ON TABLE public.avances_diarios IS 'Planillas Diarias del Contratista con geo-auditoría de alta precisión, desglose de villas y áreas.';

-- 5. Asegurar que las nuevas columnas tengan valores si es necesario (opcional para desarrollo)
UPDATE public.avances_diarios SET villa_hasta = villa_desde WHERE villa_hasta IS NULL;
ALTER TABLE public.avances_diarios ALTER COLUMN villa_hasta SET NOT NULL;
