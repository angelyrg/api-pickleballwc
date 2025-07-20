import { Module } from '@nestjs/common';
import { ReserveController } from './reserve.controller';
import { ReserveService } from './reserve.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [ReserveController],
  providers: [ReserveService],
  imports: [PrismaModule],
})
export class ReserveModule {}
