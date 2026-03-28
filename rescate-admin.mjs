import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Cargar las credenciales exactamente igual que NestJS
const envPath = resolve(process.cwd(), 'apps', 'api', '.env');
const envContent = readFileSync(envPath, 'utf-8');
const SUPABASE_URL = envContent.match(/SUPABASE_URL=(.*)/)[1].trim();
const SUPABASE_SERVICE_ROLE_KEY = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1].trim();

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function rescatarAdmin() {
  console.log('Iniciando creación segura a través del API Maestra de Supabase...');

  // ¡Crea AL USUARIO BYPASSEANDO LAS RESTRICCIONES DE EMAIL Y RATELIMITS!
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'alexraab08@gmail.com', // TU CORREO AQUÍ (Puedes cambiarlo)
    password: 'PasswordSeguro2026', // TU CLAVE AQUÍ (Puedes cambiarla)
    email_confirm: true, // VERIFICADO DE GOLPE
    user_metadata: {
      full_name: 'Alex Ramirez Abarca (Admin)',
      role: 'admin',
      cedula: '0999999999',
      telefono: '0999999999',
      sexo: 'M',
      edad: 30
    }
  });

  if (error) {
    console.error('❌ Error de Supabase API:', error.message);
  } else {
    console.log('✅ Administrador creado magistralmente:', data.user.email);
    console.log('✅ Ya cuenta con identidad y confirmación. Ahora puedes hacer Login.');
  }
}

rescatarAdmin();
