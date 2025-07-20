import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  NotFoundException,
  UploadedFile,
  UseInterceptors,
  UseFilters,
} from '@nestjs/common';
import { PlayerService } from './player.service';
import { Player, Member, User } from '@prisma/client';
import { Auth } from 'src/auth/decorators';
import { LoggerService } from 'src/logger/logger.service';
import { UserRoles } from 'src/user/enums/roles.enums';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  multerOptions,
  PASSPORTS_URL,
  removeStaticFile,
} from 'src/common/helpers/file-filter.helper';
import { transformNestedFormDataBody } from 'src/common/helpers/form-data.helper';
import { HttpExceptionFilter } from 'src/common/filters/http-exception.filter';

@Controller('players')
export class PlayerController {
  constructor(
    private readonly playerService: PlayerService,
    private readonly loggerService: LoggerService,
  ) {}

  @Auth(UserRoles.user, UserRoles.admin)
  @Get()
  async getAll() {
    try {
      return await this.playerService.getAll();
    } catch (error) {
      this.loggerService.log({
        error,
        path: 'src/player/player.controller.ts',
        function: 'getAll',
        tags: ['player', 'getAll'],
      });
      throw new NotFoundException('Error fetching players');
    }
  }

  @Auth(UserRoles.user, UserRoles.admin)
  @Get(':id')
  async getById(@Param('id') id: string) {
    try {
      const found = await this.playerService.getById(Number(id));
      if (!found) throw new NotFoundException('Player does not exists');
      return found;
    } catch (error) {
      this.loggerService.log({
        error,
        path: 'src/player/player.controller.ts',
        function: 'getById',
        tags: ['player', 'getById'],
        extra: { playerId: id },
      });
      throw new NotFoundException('Player does not exists');
    }
  }

  @Auth(UserRoles.user, UserRoles.admin)
  @Post()
  @UseFilters(HttpExceptionFilter)
  @UseInterceptors(FileInterceptor('passportImage', multerOptions))
  async create(
    @Body()
    body: {
      user: User;
      member: Member;
      player: Player;
      remove?: { file?: string };
    },
    @UploadedFile()
    file?: Express.Multer.File,
  ) {
    try {
      const data = transformNestedFormDataBody(body, '', [
        'phone_code',
        'phone_number',
      ]);
      if (data.remove?.file) {
        removeStaticFile(PASSPORTS_URL, data.remove.file);
        data.member.passport_image = null;
      }
      if (file) {
        data.member.passport_image = file.filename;
      }
      return this.playerService.create(data);
    } catch (error) {
      this.loggerService.log({
        error,
        path: 'src/player/player.controller.ts',
        function: 'create',
        tags: ['player', 'create'],
        extra: { hasFile: !!file },
      });
      throw new NotFoundException('Error creating player');
    }
  }

  @Auth(UserRoles.user, UserRoles.admin)
  @Put(':id')
  async update(@Body() data: Player, @Param('id') id: string) {
    try {
      return this.playerService.update(Number(id), data);
    } catch (error) {
      this.loggerService.log({
        error,
        path: 'src/player/player.controller.ts',
        function: 'update',
        tags: ['player', 'update'],
        extra: { playerId: id },
      });
      throw new NotFoundException('Player does not exists');
    }
  }

  @Auth(UserRoles.user, UserRoles.admin)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    try {
      return await this.playerService.delete(Number(id));
    } catch (error) {
      this.loggerService.log({
        error,
        path: 'src/player/player.controller.ts',
        function: 'delete',
        tags: ['player', 'delete'],
        extra: { playerId: id },
      });
      throw new NotFoundException('Player does not exists');
    }
  }

  @Auth(UserRoles.user, UserRoles.admin)
  @Post('assign')
  async assign(
    @Body()
    body: {
      member_id: number;
      team_id: number;
    },
  ) {
    try {
      return await this.playerService.assign(body);
    } catch (error) {
      this.loggerService.log({
        error,
        path: 'src/player/player.controller.ts',
        function: 'assign',
        tags: ['player', 'assign'],
        extra: { playerData: body },
      });
      throw new NotFoundException('Error assigning player');
    }
  }
}
