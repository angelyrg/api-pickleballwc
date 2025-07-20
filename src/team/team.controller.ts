import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  NotFoundException,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  Res,
} from '@nestjs/common';
import { TeamService } from './team.service';
import { Team } from '@prisma/client';
import { Auth } from 'src/auth/decorators';
import { UserRoles } from 'src/user/enums/roles.enums';
import { LoggerService } from 'src/logger/logger.service';
import { SendMailDto } from './dto/send-mail';
import { Response } from 'express';
import {
  createImagesZip,
  PASSPORTS_URL,
} from 'src/common/helpers/file-filter.helper';
import { createReadStream, unlink } from 'fs';

@Controller('teams')
export class TeamController {
  constructor(
    private readonly teamService: TeamService,
    private readonly loggerService: LoggerService,
  ) {}
  @Auth(UserRoles.user, UserRoles.admin)
  @Get()
  async getAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Query('search') search?: string,
  ) {
    const filter: any = {};
    try {
      if (search) {
        filter.OR = [
          { country: { contains: search } },
          {
            coordinator: {
              is: { user: { is: { first_name: { contains: search } } } },
            },
          },
          {
            coordinator: {
              is: { user: { is: { last_name: { contains: search } } } },
            },
          },
          {
            coordinator: {
              is: { user: { is: { email: { contains: search } } } },
            },
          },
          { tournament: { is: { name: { contains: search } } } },
        ];
      }
      return await this.teamService.getAll(filter, page, limit);
    } catch (error) {
      this.loggerService.log({
        error,
        path: 'src/team/team.controller.ts',
        function: 'getAll',
        tags: ['team', 'getAll'],
        extra: { filter, page, limit },
      });
      throw new NotFoundException('Teams not found');
    }
  }
  @Auth(UserRoles.user, UserRoles.admin)
  @Get(':id')
  async getById(@Param('id') id: string) {
    try {
      const found = await this.teamService.getById(Number(id));
      if (!found) throw new NotFoundException('Team does not exists');
      return found;
    } catch (error) {
      this.loggerService.log({
        error,
        path: 'src/team/team.controller.ts',
        function: 'getById',
        tags: ['team', 'getById'],
        extra: { teamId: id },
      });
      throw new NotFoundException('Team does not exists');
    }
  }
  @Auth(UserRoles.user, UserRoles.admin)
  @Post()
  async create(@Body() data: Team) {
    try {
      return await this.teamService.create(data);
    } catch (error) {
      this.loggerService.log({
        error,
        path: 'src/team/team.controller.ts',
        function: 'create',
        tags: ['team', 'create'],
        extra: { teamData: data },
      });
      throw new NotFoundException('Error creating team');
    }
  }
  @Auth(UserRoles.user, UserRoles.admin)
  @Put(':id')
  async update(@Body() data: Team, @Param('id') id: string) {
    try {
      return this.teamService.update(Number(id), data);
    } catch (error) {
      this.loggerService.log({
        error,
        path: 'src/team/team.controller.ts',
        function: 'update',
        tags: ['team', 'update'],
        extra: { teamId: id, updateData: data },
      });
      throw new NotFoundException('Team does not exists');
    }
  }
  @Auth(UserRoles.user, UserRoles.admin)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    try {
      return await this.teamService.delete(Number(id));
    } catch (error) {
      this.loggerService.log({
        error,
        path: 'src/team/team.controller.ts',
        function: 'delete',
        tags: ['team', 'delete'],
        extra: { teamId: id },
      });
      throw new NotFoundException('Team does not exists');
    }
  }

  @Auth(UserRoles.user, UserRoles.admin)
  @Get('member/:id')
  async myTeams(@Param('id') id: string) {
    try {
      const coordinated = await this.teamService.getCoordinatedTeams(
        Number(id),
      );
      const played = await this.teamService.getPlayedTeams(Number(id));

      const response = {
        coordinated: coordinated,
        played: played,
      };
      return response;
    } catch (error) {
      this.loggerService.log({
        error,
        path: 'src/team/team.controller.ts',
        function: 'myTeams',
        tags: ['team', 'myTeams'],
        extra: { memberId: id },
      });
      throw new NotFoundException('Teams not found');
    }
  }

  @Auth(UserRoles.user, UserRoles.admin)
  @Get(':id/detail')
  async detail(@Param('id') id: string) {
    try {
      return await this.teamService.detail(Number(id));
    } catch (error) {
      this.loggerService.log({
        error,
        path: 'src/team/team.controller.ts',
        function: 'detail',
        tags: ['team', 'detail'],
        extra: { teamId: id },
      });
      throw new NotFoundException('Team does not exists');
    }
  }
  @Auth(UserRoles.admin)
  @Get('export/excel')
  async exportToExcel() {
    try {
      return await this.teamService.exportToExcel();
    } catch (error) {
      this.loggerService.log({
        error,
        path: 'src/team/team.controller.ts',
        function: 'exportToExcel',
        tags: ['team', 'export', 'excel'],
      });
      throw new NotFoundException('Error exporting teams to excel');
    }
  }
  @Auth(UserRoles.user, UserRoles.admin)
  @Post('send-to')
  async sendTo(@Body() body: SendMailDto) {
    try {
      return await this.teamService.sendTo(body);
    } catch (error) {
      this.loggerService.log({
        error,
        path: 'src/team/team.controller.ts',
        function: 'sendTo',
        tags: ['team', 'sendTo'],
        extra: { sendToData: body },
      });
      throw new NotFoundException('Error sending email');
    }
  }

  @Auth(UserRoles.user, UserRoles.admin)
  @Get('passports/:teamId')
  async findPassportImage(
    @Res() res: Response,
    @Param('teamId') teamId: string,
  ) {
    try {
      const files = await this.teamService.getPassports(teamId);

      if (!files || files.size === 0) {
        throw new NotFoundException('No files found');
      }

      const { zip } = await createImagesZip(PASSPORTS_URL, files);

      res.setHeader('Content-Type', 'application/zip');
      // res.setHeader('Content-Disposition', `attachment; filename=${name}`);

      const fileStream = createReadStream(zip);
      fileStream.pipe(res);

      fileStream.on('close', () => {
        unlink(zip, (err) => {
          if (err) {
            this.loggerService.log({
              error: err,
              path: 'src/team/team.controller.ts',
              function: 'findPassportImage',
              tags: ['team', 'passport', 'file'],
              extra: { teamId },
            });
            console.error('Error deleting temporary zip file:', err);
          }
        });
      });
    } catch (error) {
      this.loggerService.log({
        error,
        path: 'src/team/team.controller.ts',
        function: 'findPassportImage',
        tags: ['member', 'passport', 'file', 'path'],
        extra: { teamId },
      });
      throw new NotFoundException('File not found');
    }
  }
}
