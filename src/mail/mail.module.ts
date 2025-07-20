import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  controllers: [],
  providers: [MailService, ConfigService],
  imports: [ConfigModule],
  exports: [MailService],
})
export class MailModule {}
