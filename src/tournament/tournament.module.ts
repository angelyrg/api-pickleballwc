import { Module } from '@nestjs/common';
import { TournamentController } from './tournament.controller';
import { TournamentService } from './tournament.service';
import { PrismaModule } from 'src/prisma/prisma.module';
@Module({
  controllers: [TournamentController],
  providers: [TournamentService],
  imports: [PrismaModule],
})
export class TournamentModule {}
