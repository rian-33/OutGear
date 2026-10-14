import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { ACCESS_COOKIE, REFRESH_COOKIE } from './common/auth/cookies';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.setGlobalPrefix('api');
  app.use(helmet());
  app.use(cookieParser());

  const origin = config
    .get<string>('CORS_ORIGIN')
    ?.split(',')
    .map((o) => o.trim()) ?? ['http://localhost:3001'];
  app.enableCors({
    origin,
    credentials: true,
    exposedHeaders: ['Content-Disposition'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
      forbidNonWhitelisted: true,
    })
  );
  app.useGlobalFilters(new AllExceptionsFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Savana Villa API')
    .setDescription('API reservasi kamar, ketersediaan, dan pengelolaan villa.')
    .setVersion('1.0.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
    .addCookieAuth(ACCESS_COOKIE)
    .addCookieAuth(REFRESH_COOKIE)
    .addTag('Auth', 'Registrasi, login, rotasi token, logout, ganti password')
    .addTag('Kamar', 'Inventaris dan fasilitas kamar villa')
    .addTag('Reservasi Villa', 'Cek ketersediaan, booking, dan pengelolaan reservasi')
    .build();

  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, swaggerConfig));

  const port = Number(config.get<string>('PORT') ?? 3000);
  await app.listen(port, '0.0.0.0');

  console.log(`Savana Villa API berjalan di http://localhost:${port}/api — Swagger: /api/docs`);
}

void bootstrap();
