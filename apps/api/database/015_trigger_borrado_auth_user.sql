-- Automatización de eliminación en cascada: public.usuarios -> auth.users
-- Objetivo: Al eliminar un perfil en 'public.usuarios', eliminar automáticamente su cuenta de acceso en 'auth.users'

-- 1. Crear la función que ejecutará el borrado en la tabla interna de Supabase Auth
-- Se usa 'security definer' para que la función tenga permisos de sistema (bypass RLS)
CREATE OR REPLACE FUNCTION public.borrar_usuario_auth()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM auth.users WHERE id = OLD.id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Crear el trigger que se dispara DESPUÉS de borrar en la tabla pública
DROP TRIGGER IF EXISTS tr_borrar_usuario_auth_despues ON public.usuarios;
CREATE TRIGGER tr_borrar_usuario_auth_despues
    AFTER DELETE ON public.usuarios
    FOR EACH ROW
    EXECUTE FUNCTION public.borrar_usuario_auth();

-- Nota: Con esto, al hacer clic en "Eliminar" desde tu sistema, el usuario desaparece 
-- por completo (Perfil + Login), permitiendo volver a registrar el mismo correo si se desea.
