import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
// import { UserModule } from './user/user.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { UserModule } from './user/user.module';
import { PaystackService } from './paystack/paystack.service';
import { ConfigModule } from '@nestjs/config';


@Module({
  imports: [ 
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/',
      exclude: ['/api*'],
      serveStaticOptions: {
        index: false,
        extensions: ['html']
      }
    }),
    DatabaseModule, UserModule],
  controllers: [AppController],
  providers: [AppService, PaystackService],
})
export class AppModule {}
