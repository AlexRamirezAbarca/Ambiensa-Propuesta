-- SCRIPT INCREMENTAL 002: LÓGICA DE PERSONAL Y PERMISOS GRANULARES
-- Instrucciones: Ejecuta este código DESPUÉS de haber ejecutado el 001.

----------------------------------------------
-- 1. TABLA DE PERMISOS GRANULARES
----------------------------------------------
CREATE TABLE IF NOT EXISTS public.permisos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE UNIQUE,
  visualizacion BOOLEAN DEFAULT true NOT NULL,
  lectura BOOLEAN DEFAULT true NOT NULL,
  escritura BOOLEAN DEFAULT false NOT NULL,
  
  -- Auditoría
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Disparador de Auditoría para Permisos
CREATE TRIGGER trg_permisos_updated_at
BEFORE UPDATE ON public.permisos
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Activar RLS para la nueva tabla
ALTER TABLE public.permisos ENABLE ROW LEVEL SECURITY;

-- Políticas de Seguridad para Permisos
CREATE POLICY "Usuarios pueden leer sus propios permisos" 
ON public.permisos FOR SELECT 
USING (auth.uid() = usuario_id OR auth.role() = 'authenticated');

----------------------------------------------
-- 2. ACTUALIZACIÓN DE LÓGICA DE AUTOMATIZACIÓN
----------------------------------------------
-- Reemplazamos la función original para que ahora incluya la creación de permisos.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_role_id INT;
  v_role_name VARCHAR;
  v_creator_id UUID;
BEGIN
  -- Extraer rol que NestJS pasará en el json 'app_metadata', sino 'supervisor'
  v_role_name := coalesce(new.raw_app_meta_data->>'role', new.raw_user_meta_data->>'role', 'supervisor');
  
  -- Extraer quién autoriza la creación (el ID del Administrador que lo empuja desde NestJS)
  IF new.raw_user_meta_data->>'created_by_admin' IS NOT NULL THEN
     v_creator_id := (new.raw_user_meta_data->>'created_by_admin')::UUID;
  ELSE
     v_creator_id := new.id; -- Fue auto-registro base inicial.
  END IF;

  -- Obtener llave primaria del catálogo de roles
  SELECT id INTO v_role_id FROM public.roles WHERE nombre = v_role_name LIMIT 1;
  IF v_role_id IS NULL THEN
     v_role_id := 4; -- supervisor fallback
  END IF;

  -- 1. Insertar en Usuarios
  INSERT INTO public.usuarios (id, email, nombres, cedula, telefono, sexo, edad, role_id, created_by, updated_by)
  VALUES (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', 'Usuario Nuevo'),
    new.raw_user_meta_data->>'cedula',
    new.raw_user_meta_data->>'telefono',
    new.raw_user_meta_data->>'sexo',
    (new.raw_user_meta_data->>'edad')::INT,
    v_role_id,
    v_creator_id,
    v_creator_id
  );

  -- 2. Insertar Permisos por Defecto
  INSERT INTO public.permisos (usuario_id, visualizacion, lectura, escritura)
  VALUES (new.id, true, true, false);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Nota: No es necesario recrear el TRIGGER 'on_auth_user_created' ya que 
-- simplemente llamará a la versión actualizada de la función que acabamos de reemplazar.
