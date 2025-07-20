import { Module, Global } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { LoggerService } from './logger.service';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
