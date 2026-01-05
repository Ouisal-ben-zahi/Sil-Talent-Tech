import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: process.env.NODE_ENV === 'production' 
      ? ['error', 'warn'] 
      : ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  // Security: Helmet avec configuration optimisée
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"], // Tailwind nécessite unsafe-inline
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
          connectSrc: ["'self'", process.env.FRONTEND_URL || 'http://localhost:3000'],
          fontSrc: ["'self'", 'data:'],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false, // Désactivé pour compatibilité
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    }),
  );

  // CORS: Configuration stricte
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  app.enableCors({
    origin: (origin, callback) => {
      // En développement, autoriser toutes les origines localhost
      if (process.env.NODE_ENV !== 'production') {
        if (!origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
          return callback(null, true);
        }
      }
      
      // En production, vérifier strictement l'origine
      const allowedOrigins = frontendUrl.split(',').map(url => url.trim());
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn(`CORS: Origine non autorisée: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Length', 'X-Request-Id'],
    maxAge: 86400, // 24 heures
  });

  // Global validation pipe avec options strictes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Retirer les propriétés non définies dans le DTO
      forbidNonWhitelisted: true, // Rejeter les propriétés non définies
      transform: true, // Transformer automatiquement les types
      transformOptions: {
        enableImplicitConversion: true,
      },
      // Validation stricte
      stopAtFirstError: true, // Arrêter à la première erreur
      disableErrorMessages: process.env.NODE_ENV === 'production', // Masquer les messages d'erreur en production
      validationError: {
        target: false, // Ne pas exposer l'objet cible
        value: false, // Ne pas exposer les valeurs
      },
    }),
  );

  // Global interceptors
  app.useGlobalInterceptors(new TransformInterceptor());

  // Global exception filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global prefix
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  logger.log(`🚀 Application is running on: http://localhost:${port}/api`);
  logger.log(`📋 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Ne logger les routes OAuth qu'en développement
  if (process.env.NODE_ENV !== 'production') {
    logger.debug(`📋 Routes OAuth disponibles:`);
    logger.debug(`   - GET /api/auth/google`);
    logger.debug(`   - GET /api/auth/google/callback`);
    logger.debug(`   - GET /api/auth/facebook`);
    logger.debug(`   - GET /api/auth/facebook/callback`);
    logger.debug(`   - GET /api/auth/linkedin`);
    logger.debug(`   - GET /api/auth/linkedin/callback`);
  }
}

bootstrap();

