import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { RubrosModule } from './modules/rubros/rubros.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UsersModule,
    ProjectsModule,
    RubrosModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
