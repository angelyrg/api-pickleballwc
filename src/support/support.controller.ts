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
import { SupportService } from './support.service';
import { Support, Member, User } from '@prisma/client';
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

@Controller('supports')
export class SupportController {
  constructor(
    private readonly supportService: SupportService,
    private readonly loggerService: LoggerService,
  ) {}

  @Auth(UserRoles.user, UserRoles.admin)
  @Get()
  async getAll() {
    try {
      return await this.supportService.getAll();
    } catch (error) {
      this.loggerService.log({
        error,
        path: 'src/support/support.controller.ts',
        function: 'getAll',
        tags: ['support', 'getAll'],
      });
      throw new NotFoundException('Error fetching supports');
    }
  }

  @Auth(UserRoles.user, UserRoles.admin)
  @Get(':id')
  async getById(@Param('id') id: string) {
    try {
      const found = await this.supportService.getById(Number(id));
      if (!found) throw new NotFoundException('Support does not exists');
      return found;
    } catch (error) {
      this.loggerService.log({
        error,
        path: 'src/support/support.controller.ts',
        function: 'getById',
        tags: ['support', 'getById'],
        extra: { supportId: id },
      });
      throw new NotFoundException('Support does not exists');
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
      support: Support;
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
      return this.supportService.create(data);
    } catch (error) {
      this.loggerService.log({
        error,
        path: 'src/support/support.controller.ts',
        function: 'create',
        tags: ['support', 'create'],
        extra: { hasFile: !!file },
      });
      throw new NotFoundException('Error creating support');
    }
  }

  @Auth(UserRoles.user, UserRoles.admin)
  @Put(':id')
  async update(@Body() data: Support, @Param('id') id: string) {
    try {
      return await this.supportService.update(Number(id), data);
    } catch (error) {
      this.loggerService.log({
        error,
        path: 'src/support/support.controller.ts',
        function: 'update',
        tags: ['support', 'update'],
        extra: { supportId: id },
      });
      throw new NotFoundException('Support does not exists');
    }
  }

  @Auth(UserRoles.user, UserRoles.admin)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    try {
      return await this.supportService.delete(Number(id));
    } catch (error) {
      this.loggerService.log({
        error,
        path: 'src/support/support.controller.ts',
        function: 'delete',
        tags: ['support', 'delete'],
        extra: { supportId: id },
      });
      throw new NotFoundException('Support does not exists');
    }
  }
}
