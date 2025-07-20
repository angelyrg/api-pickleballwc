import { Module } from '@nestjs/common';
import { SupportController } from './support.controller';
import { SupportService } from './support.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MailService } from 'src/mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter } from 'src/common/filters/http-exception.filter';

@Module({
  controllers: [SupportController],
  providers: [SupportService, MailService, ConfigService, HttpExceptionFilter],
  imports: [PrismaModule],
})
export class SupportModule {}
