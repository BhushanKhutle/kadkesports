import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  const config = app.get(ConfigService);

  const apiPrefix = config.get<string>('API_PREFIX', 'api');
  app.setGlobalPrefix(apiPrefix);

  // ─── Security ──────────────────────────────────────
  app.use(
    helmet({
      contentSecurityPolicy: false, // configure per env
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.use(compression());
  app.use(cookieParser());

  app.enableCors({
    origin: config.get<string>('CORS_ORIGIN', 'http://localhost:3000').split(','),
    credentials: true,
  });

  // ─── Pipes / Filters / Interceptors ────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  // ─── Graceful Shutdown ─────────────────────────────
  app.enableShutdownHooks();

  // ─── Swagger ───────────────────────────────────────
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Kadke Sports API')
    .setDescription('Enterprise ecommerce platform API documentation')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('Auth')
    .addTag('Users')
    .addTag('Products')
    .addTag('Categories')
    .addTag('Cart')
    .addTag('Orders')
    .addTag('Payments')
    .addTag('Reviews')
    .addTag('Wishlist')
    .addTag('Coupons')
    .addTag('Admin')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document);

  const port = config.get<number>('PORT', 4000);
  await app.listen(port, '0.0.0.0');
  logger.log(`🚀 Kadke Sports API → http://localhost:${port}/${apiPrefix}`);
  logger.log(`📘 Swagger docs    → http://localhost:${port}/${apiPrefix}/docs`);
}
bootstrap();
