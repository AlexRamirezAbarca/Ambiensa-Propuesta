-- Política de Seguridad (RLS) para permitir la eliminación de usuarios
-- Objetivo: Permitir que solo Administradores y Supervisores puedan eliminar perfiles de la tabla public.usuarios

-- 1. Asegurar que RLS esté activo
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar política previa si existe para evitar duplicados
DROP POLICY IF EXISTS "Permitir borrado a administradores" ON public.usuarios;

-- 3. Crear la política de eliminación basada en roles jerárquicos
CREATE POLICY "Permitir borrado a administradores" 
ON public.usuarios 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios AS auth_user
    JOIN public.roles AS r ON auth_user.role_id = r.id
    WHERE auth_user.id = auth.uid() 
    AND r.nombre IN ('administrador', 'supervisor')
  )
);

-- Nota: Esta política permite que cualquier usuario con rol 'administrador' o 'supervisor' 
-- elimine registros de la tabla public.usuarios. Para eliminar el usuario de Auth (login),
-- se requiere el uso de la Service Role Key o un Trigger/Edge Function, pero este script
-- habilita la eliminación del perfil administrativo que es lo que maneja el mantenedor.
