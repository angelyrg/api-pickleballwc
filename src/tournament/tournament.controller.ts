import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { TournamentService } from './tournament.service';
import { Tournament } from '@prisma/client';
import { UserRoles } from 'src/user/enums/roles.enums';
import { Auth } from 'src/auth/decorators';
import { LoggerService } from 'src/logger/logger.service';

@Controller('tournaments')
export class TournamentController {
  constructor(
    private readonly tournamentService: TournamentService,
    private readonly loggerService: LoggerService,
  ) {}
  @Auth(UserRoles.user, UserRoles.admin)
  @Get()
  async getAll() {
    try {
      return await this.tournamentService.getAll();
    } catch (error) {
      this.loggerService.log({
        error,
        path: 'src/tournament/tournament.controller.ts',
        function: 'getAll',
        tags: ['tournament', 'getAll'],
      });
      throw new NotFoundException('Error fetching tournaments');
    }
  }

  @Auth(UserRoles.user, UserRoles.admin)
  @Get(':id')
  async getById(@Param('id') id: string) {
    try {
      const found = await this.tournamentService.getById(Number(id));
      if (!found) throw new NotFoundException('Tournament does not exists');
      return found;
    } catch (error) {
      this.loggerService.log({
        error,
        path: 'src/tournament/tournament.controller.ts',
        function: 'getById',
        tags: ['tournament', 'getById'],
        extra: { tournamentId: id },
      });
      throw new NotFoundException('Tournament does not exists');
    }
  }

  @Auth(UserRoles.user, UserRoles.admin)
  @Post()
  async create(@Body() data: Tournament) {
    try {
      return await this.tournamentService.create(data);
    } catch (error) {
      this.loggerService.log({
        error,
        path: 'src/tournament/tournament.controller.ts',
        function: 'create',
        tags: ['tournament', 'create'],
        extra: { tournamentData: data },
      });
      throw new NotFoundException('Error creating tournament');
    }
  }

  @Auth(UserRoles.user, UserRoles.admin)
  @Put(':id')
  async update(@Body() data: Tournament, @Param('id') id: string) {
    try {
      return this.tournamentService.update(Number(id), data);
    } catch (error) {
      this.loggerService.log({
        error,
        path: 'src/tournament/tournament.controller.ts',
        function: 'update',
        tags: ['tournament', 'update'],
        extra: { tournamentId: id, updateData: data },
      });
      throw new NotFoundException('Tournament does not exists');
    }
  }
  @Auth(UserRoles.user, UserRoles.admin)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    try {
      return await this.tournamentService.delete(Number(id));
    } catch (error) {
      this.loggerService.log({
        error,
        path: 'src/tournament/tournament.controller.ts',
        function: 'delete',
        tags: ['tournament', 'delete'],
        extra: { tournamentId: id },
      });
      throw new NotFoundException('Tournament does not exists');
    }
  }
  @Auth(UserRoles.user, UserRoles.admin)
  @Get('coordinator/:id')
  async availableByCoordinator(@Param('id') id: string) {
    try {
      const tournaments = await this.tournamentService.availableByCoordinator(
        Number(id),
      );

      if (!tournaments)
        throw new NotFoundException('Tournaments not found for coordinator');
      return tournaments;
    } catch (error) {
      this.loggerService.log({
        error,
        path: 'src/tournament/tournament.controller.ts',
        function: 'availableByCoordinator',
        tags: ['tournament', 'coordinator', 'available'],
        extra: { coordinatorId: id },
      });

      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException('Error fetching available tournaments');
    }
  }
}
