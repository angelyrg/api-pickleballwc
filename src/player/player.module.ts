import { Module } from '@nestjs/common';
import { PlayerController } from './player.controller';
import { PlayerService } from './player.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MailService } from 'src/mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter } from 'src/common/filters/http-exception.filter';

@Module({
  controllers: [PlayerController],
  providers: [PlayerService, MailService, ConfigService, HttpExceptionFilter],
  imports: [PrismaModule],
})
export class PlayerModule {}
