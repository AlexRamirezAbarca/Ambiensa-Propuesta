import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { RubrosService } from './rubros.service';

@Controller('rubros')
export class RubrosController {
  constructor(private readonly rubrosService: RubrosService) {}

  @Get()
  async findAll() {
    return this.rubrosService.findAll();
  }

  @Post()
  async create(@Body() payload: any) {
    return this.rubrosService.create(payload);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() payload: any) {
    return this.rubrosService.update(id, payload);
  }
}
