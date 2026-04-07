-- SCRIPT INCREMENTAL 009: ASIGNACIÓN DE CONTRATISTAS A PRESUPUESTO
-- Requerimiento: Permitir que un rubro del presupuesto tenga un responsable (contratista).

-- 1. Añadir la llave foránea contratista_id
ALTER TABLE public.proyecto_presupuesto
ADD COLUMN contratista_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL;

-- Comentario para la columna
COMMENT ON COLUMN public.proyecto_presupuesto.contratista_id IS 'Usuario con rol de contratista asignado a ejecutar esta línea de presupuesto.';

-- 2. Asegurar que las políticas RLS de lectura y escritura cubran este campo
-- Automáticamente con la política existente "Fiscalizadores pueden gestionar presupuestos",
-- los fiscalizadores tienen permisos ALL, lo que significa que pueden hacer UPDATE a contratista_id.

-- Podríamos añadir una política opcional para que los contratistas MISMOS puedan ver sus rubros:
CREATE POLICY "Contratistas pueden ver sus rubros asignados"
ON public.proyecto_presupuesto FOR SELECT USING (
  contratista_id = auth.uid() OR auth.role() = 'authenticated'
);
