import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../../infrastructure/supabase/supabase.service';

@Injectable()
export class ProjectsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async createProject(payload: any) {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('proyectos')
      .insert({
        nombre: payload.nombre,
        descripcion: payload.descripcion,
        ubicacion: payload.ubicacion,
      })
      .select()
      .single();

    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async findAllProjects() {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('proyectos')
      .select(`
        *,
        lotes_unidades(count)
      `)
      .order('created_at', { ascending: false });

    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async addLotesToProject(projectId: string, lotes: any[]) {
    const supabase = this.supabaseService.getClient();
    
    const lotesWithProject = lotes.map(lote => ({
      ...lote,
      proyecto_id: projectId
    }));

    const { data, error } = await supabase
      .from('lotes_unidades')
      .insert(lotesWithProject)
      .select();

    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async findProjectDetails(id: string) {
    const supabase = this.supabaseService.getClient();
    
    // Traer proyecto, lotes y sus fiscalizadores asociados
    const { data, error } = await supabase
      .from('proyectos')
      .select(`
        *,
        lotes_unidades (
          *,
          usuarios (
            nombres,
            email
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async findFiscalizadoresActivos() {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('usuarios')
      .select(`
        id,
        nombres,
        email,
        role_id
      `)
      .eq('estado', true);
      // Nota: Filtrado por rol 'fiscalizador' se puede hacer en la query o por el role_id
      // Para esta demo traemos todos los posibles usuarios asignables

    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }
}
