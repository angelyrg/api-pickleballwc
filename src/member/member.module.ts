import { Module } from '@nestjs/common';
import { MemberController } from './member.controller';
import { MemberService } from './member.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TeamService } from 'src/team/team.service';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter } from 'src/common/filters/http-exception.filter';

@Module({
  controllers: [MemberController],
  providers: [MemberService, TeamService, ConfigService, HttpExceptionFilter],
  imports: [PrismaModule],
  exports: [MemberService],
})
export class MemberModule {}
