import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Use Pino logger for structured JSON logging
  app.useLogger(app.get(Logger));

  // Configure trust proxy for IP extraction
  // Only trust specific proxy IPs from environment variable
  const trustedProxies =
    process.env.TRUSTED_PROXIES?.split(',')?.map((ip) => ip.trim()) || [];
  if (trustedProxies.length > 0) {
    app.set('trust proxy', trustedProxies);
  } else {
    // Default: trust no proxies (disable x-forwarded-for processing)
    app.set('trust proxy', false);
  }

  // Enable strict validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are present
      transform: true, // Automatically transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true, // Allow implicit type conversion
      },
    }),
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('TruthBounty API')
    .setDescription('## Decentralized News Verification Infrastructure\n\nThis API provides endpoints for managing claims, disputes, identity verification, rewards, and blockchain event indexing.\n\n### API Version\n- **Version**: 1.0\n- **Base Path**: `/`\n\n### Authentication\nMost mutating endpoints (POST, PATCH, PUT, DELETE) require authentication using wallet signature-based JWT tokens.\n\n#### Authentication Flow:\n1. Request a challenge: `POST /auth/challenge` with your wallet address\n2. Sign the challenge message with your wallet\n3. Login: `POST /auth/login` with address, signature, and message\n4. Use the returned JWT token in the `Authorization` header as `Bearer <token>`\n\nRead-only endpoints (GET) remain public unless specifically protected.\n\n### Rate Limiting\nSome endpoints are rate-limited using wallet-based throttling.')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('auth', 'Authentication with wallet signature')
    .addTag('identity', 'User and wallet identity management')
    .addTag('worldcoin', 'Worldcoin ID verification')
    .addTag('claims', 'Claim management and evidence')
    .addTag('evidence', 'Evidence management with flagging')
    .addTag('disputes', 'Dispute creation and resolution')
    .addTag('sybil', 'Sybil resistance scoring')
    .addTag('blockchain', 'Blockchain event indexing and state')
    .addTag('indexer', 'Event indexer management')
    .addTag('rewards', 'Reward management')
    .addTag('leaderboard', 'User leaderboard rankings')
    .addTag('audit', 'Audit log retrieval')
    .addTag('health', 'Health check endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
