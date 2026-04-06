import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  async create(@Body() payload: any) {
    return await this.projectsService.createProject(payload);
  }

  @Get()
  async findAll() {
    return await this.projectsService.findAllProjects();
  }

  @Get('fiscalizadores')
  async findFiscalizadores() {
    return await this.projectsService.findFiscalizadoresActivos();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.projectsService.findProjectDetails(id);
  }

  @Post(':id/lotes')
  async addLotes(@Param('id') id: string, @Body() payload: any) {
    const lotes = Array.isArray(payload) ? payload : (payload.lotes || []);
    return await this.projectsService.addLotesToProject(id, lotes);
  }
}
