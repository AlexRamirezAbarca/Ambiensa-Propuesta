-- SCRIPT MAESTRO DE BASE DE DATOS (Ambiensa ERP) - VERSIÓN AUDITADA
-- Instrucciones: Ejecuta este código en tu SQL Editor de Supabase.

----------------------------------------------
-- 0. FUNCIONES GENÉRICAS DE AUDITORÍA
----------------------------------------------
-- Automatiza que la fecha 'updated_at' cambie sola cada vez que alguien edite un registro.
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

----------------------------------------------
-- 1. TABLA CATÁLOGO: ROLES
----------------------------------------------
CREATE TABLE public.roles (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  descripcion TEXT,
  
  -- Campos de Auditoría Estándar
  estado BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Disparador de Auditoría para Roles
CREATE TRIGGER trg_roles_updated_at
BEFORE UPDATE ON public.roles
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Insertar roles iniciales de la estructura jerárquica
INSERT INTO public.roles (nombre, descripcion) VALUES
  ('admin', 'Administrador Global o Creador Maestro del ERP'),
  ('fiscalizador', 'Auditor técnico de obras residenciales'),
  ('contraloria', 'Entidad de control financiero y monetario'),
  ('supervisor', 'Coordinador responsable por urbanizaciones');

----------------------------------------------
-- 2. TABLA DE NEGOCIO: USUARIOS Y PERFILES
----------------------------------------------
CREATE TABLE public.usuarios (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nombres VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  cedula VARCHAR(20),
  telefono VARCHAR(20),
  sexo CHAR(1),
  edad INT,
  role_id INT REFERENCES public.roles(id) ON DELETE SET NULL,
  
  -- Campos de Auditoría Estándar
  estado BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Disparador de Auditoría para Usuarios
CREATE TRIGGER trg_usuarios_updated_at
BEFORE UPDATE ON public.usuarios
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

----------------------------------------------
-- 3. SEGURIDAD (Row Level Security)
----------------------------------------------
-- Activar RLS por buena práctica
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Servidor Maestro y Usuarios pueden leer roles" ON public.roles FOR SELECT USING (true);
CREATE POLICY "Usuarios pueden leer a otros usuarios" ON public.usuarios FOR SELECT USING (auth.role() = 'authenticated');

----------------------------------------------
-- 4. AUTOMATIZACIÓN (TRIGGER SEGURO + AUDITOR DE QUIÉN LO CREÓ)
----------------------------------------------
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
  -- Si el admin se rutea a sí mismo por primera vez, será nulo o él mismo.
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
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger disparador atado a la tabla de contraseñas de Supabase
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
