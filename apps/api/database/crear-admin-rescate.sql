-- SCRIPT DE RESCATE: CREAR ADMINISTRADOR SIN ENVIAR CORREOS
-- Ejecutar en el Editor SQL de Supabase.
-- Como excediste el límite gratuito por hora, esto engaña a Supabase y crea el usuario
-- con estatus de "Confirmado" directo en la base de datos sin pasar por los servidores de Email.

-- Aseguramos tener la extensión de encriptación de contraseñas de PostgreSQL
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Generamos un ID único universal
  new_user_id := gen_random_uuid();
  
  -- Insertamos directamente en el corazón blindado de Supabase (auth.users)
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at, -- MAGIA: Correo confirmado automáticamente (Now)
    raw_app_meta_data,
    raw_user_meta_data, -- Estos datos alimentarán el Trigger SQL que programamos
    created_at,
    updated_at,
    role,
    aud
  ) VALUES (
    new_user_id,
    '00000000-0000-0000-0000-000000000000',
    'admin@ambiensa.com', -- 1. PON AQUÍ TU CORREO
    crypt('Ambiensa2026', gen_salt('bf')), -- 2. PON AQUÍ LA CONTRASEÑA QUE QUIERAS
    now(), 
    '{"provider": "email", "providers": ["email"]}',
    -- 3. CAMBIA ESTO CON TUS DATOS PERSONALES
    '{"full_name": "Administrador Principal", "role": "admin", "cedula": "0999999999", "telefono": "0999999999", "sexo": "M", "edad": 35}',
    now(),
    now(),
    'authenticated',
    'authenticated'
  );
  
  -- NOTA TÉCNICA: 
  -- Una vez finalizado el insert aquí, nuestro 'Trigger' maestral (handle_new_user) 
  -- que construimos antes se despertará, leerá esta fila, y te pasará los datos automáticamente
  -- a tu tabla "public.usuarios" oficial. Todo quedará enlazado.
  
END $$;
