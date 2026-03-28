import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // Permite que web (Next.js) acceda al API sin bloqueos de navegador
  
  // Forzamos 127.0.0.1 para que el navegador lo encuentre siempre por IPv4
  await app.listen(3001, '127.0.0.1');
  console.log('🚀 Backend ERP corriendo en: http://127.0.0.1:3001');
}
bootstrap();
