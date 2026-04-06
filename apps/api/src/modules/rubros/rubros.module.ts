import { Module } from '@nestjs/common';
import { RubrosController } from './rubros.controller';
import { RubrosService } from './rubros.service';
import { SupabaseService } from '../../infrastructure/supabase/supabase.service';

@Module({
  controllers: [RubrosController],
  providers: [RubrosService, SupabaseService],
  exports: [RubrosService],
})
export class RubrosModule {}
