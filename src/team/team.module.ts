import { Module } from '@nestjs/common';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [TeamController],
  providers: [TeamService, ConfigService],
  imports: [PrismaModule],
  exports: [TeamService],
})
export class TeamModule {}
