import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as express from 'express';
import * as session from 'express-session';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'public'));
  
  app.use(
    session({
      secret: 'sk_live_3bde0c227c2c81932539c8313b0c7349abcafd80',
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false },
    })
  );

  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
