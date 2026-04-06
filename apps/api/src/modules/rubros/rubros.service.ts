import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../../infrastructure/supabase/supabase.service';

@Injectable()
export class RubrosService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll() {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('rubros')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async create(payload: any) {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('rubros')
      .insert(payload)
      .select()
      .single();

    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async update(id: string, payload: any) {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('rubros')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }
}
