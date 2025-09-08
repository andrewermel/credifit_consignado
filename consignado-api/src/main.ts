import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configuração do CORS
  app.enableCors();
  
  // Configuração de validação global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('Credifit - API de Crédito Consignado')
    .setDescription('API para gerenciamento de empréstimos consignados')
    .setVersion('1.0')
    .addTag('companies', 'Operações com empresas conveniadas')
    .addTag('employees', 'Operações com funcionários')
    .addTag('loans', 'Operações com empréstimos')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`🚀 Aplicação rodando em: http://localhost:${port}`);
  console.log(`📚 Documentação disponível em: http://localhost:${port}/api/docs`);
}
bootstrap();
