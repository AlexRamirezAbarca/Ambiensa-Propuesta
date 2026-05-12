-- SCRIPT INCREMENTAL 017: POLÍTICA DE ACTUALIZACIÓN PARA AUDITORÍA
-- Objetivo: Permitir que los roles de Contraloría y Administrador puedan modificar el estado de auditoría.

-- 1. Eliminar política antigua si existe
DROP POLICY IF EXISTS "Contraloría puede auditar jornadas" ON public.jornadas_diarias;

-- 2. Crear la política de actualización (UPDATE)
CREATE POLICY "Contraloría puede auditar jornadas" 
ON public.jornadas_diarias 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios u
    JOIN public.roles r ON u.role_id = r.id
    WHERE u.id = auth.uid() AND r.nombre IN ('administrador', 'contraloria', 'supervisor')
  )
)
WITH CHECK (true);

-- Nota: Sin esta política, Supabase devuelve 204 pero no modifica ninguna fila 
-- debido a la seguridad por omisión (RLS).
