import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../infrastructure/supabase/supabase.service';

@Injectable()
export class UsersService {
  constructor(private readonly supabaseService: SupabaseService) {}

  // Generador de clave aleatoria: 7 letras + 1 número
  private generateTempPassword(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const nums = '0123456789';
    let pass = '';
    for (let i = 0; i < 7; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    pass += nums.charAt(Math.floor(Math.random() * nums.length));
    return pass;
  }

  async createUserAdmin(payload: any) {
    const supabase = this.supabaseService.getClient();
    const tempPassword = this.generateTempPassword();

    const { data, error } = await supabase.auth.admin.createUser({
      email: payload.email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: payload.nombres,
        cedula: payload.cedula,
        telefono: payload.telefono,
        sexo: payload.sexo,
        edad: payload.edad,
        role: payload.role,
        created_by_admin: payload.adminId, // Para auditoría en el Trigger SQL
      },
    });

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    // Nota: El Trigger SQL se encarga de insertar en public.usuarios y public.permisos
    return { user: data.user, tempPassword };
  }

  async findAllUsers() {
    const supabase = this.supabaseService.getClient();
    
    // Traemos usuarios con su rol y permisos mediante joins
    const { data, error } = await supabase
      .from('usuarios')
      .select(`
        *,
        roles(nombre),
        permisos(visualizacion, lectura, escritura)
      `)
      .order('created_at', { ascending: false });

    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async updateUserStatus(id: string, estado: boolean) {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('usuarios')
      .update({ estado })
      .eq('id', id)
      .select();

    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async updateUserPermissions(usuarioId: string, permissions: any) {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('permisos')
      .update({
        visualizacion: permissions.visualizacion,
        lectura: permissions.lectura,
        escritura: permissions.escritura,
      })
      .eq('usuario_id', usuarioId)
      .select();

    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }
}
