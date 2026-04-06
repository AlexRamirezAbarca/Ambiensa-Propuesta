-- SCRIPT DE CORRECCIÓN: Asignar permisos a usuarios existentes (creados antes del Script 002)
-- Ejecutar DESPUÉS del 002_mantenimiento_y_permisos.sql

-- Inserta permisos completos para cualquier usuario que NO tenga registro en la tabla permisos
INSERT INTO public.permisos (usuario_id, visualizacion, lectura, escritura)
SELECT u.id, true, true, true
FROM public.usuarios u
LEFT JOIN public.permisos p ON p.usuario_id = u.id
WHERE p.id IS NULL;
