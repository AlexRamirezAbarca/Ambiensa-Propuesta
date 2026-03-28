import { Controller, Post, Body, Get, Patch, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('create')
  async createEmployee(@Body() body: any) {
    const result = await this.usersService.createUserAdmin(body);
    
    return {
      success: true,
      message: 'Empleado invitado y configurado exitosamente.',
      userId: result.user.id,
      tempPassword: result.tempPassword // El admin puede verla una vez
    };
  }

  @Get()
  async getAllUsers() {
    const users = await this.usersService.findAllUsers();
    return { success: true, data: users };
  }

  @Patch(':id/status')
  async toggleStatus(@Param('id') id: string, @Body('estado') estado: boolean) {
    await this.usersService.updateUserStatus(id, estado);
    return { success: true, message: 'Estado del usuario actualizado.' };
  }

  @Patch(':id/permissions')
  async updatePermissions(@Param('id') id: string, @Body() permissions: any) {
    await this.usersService.updateUserPermissions(id, permissions);
    return { success: true, message: 'Permisos del usuario actualizados.' };
  }
}
