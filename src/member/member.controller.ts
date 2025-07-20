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
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  UseInterceptors,
  Res,
  UseFilters,
} from '@nestjs/common';
import { MemberService } from './member.service';
import { Member, User } from '@prisma/client';
import { Auth } from 'src/auth/decorators';
import { LoggerService } from 'src/logger/logger.service';
import { UserRoles } from 'src/user/enums/roles.enums';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  getStaticFilePath,
  multerOptions,
  PASSPORTS_URL,
  removeStaticFile,
} from 'src/common/helpers/file-filter.helper';
import { Response } from 'express';
import { transformNestedFormDataBody } from 'src/common/helpers/form-data.helper';
import { HttpExceptionFilter } from 'src/common/filters/http-exception.filter';

@Controller('members')
export class MemberController {
  constructor(
    private readonly memberService: MemberService,
    private readonly loggerService: LoggerService,
  ) {}

  @Auth(UserRoles.user, UserRoles.admin)
  @Get()
  async getAll() {
    try {
      return await this.memberService.getAll();
    } catch (error) {
      this.loggerService.log({
        error,
        path: 'src/member/member.controller.ts',
        function: 'getAll',
        tags: ['member', 'getAll'],
      });
      throw new NotFoundException('Error fetching members');
    }
  }

  @Auth(UserRoles.user, UserRoles.admin)
  @Get('filter')
  async filter(
    @Query('is_coordinator') is_coordinator?: any,
    //@Query('order_by') order_by?: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Query('search') search?: string,
  ) {
    let filter: any = {};
    try {
      if (is_coordinator !== undefined) {
        filter = { ...filter, is_coordinator: is_coordinator === 'true' };
      }
      if (search) {
        filter.OR = [
          { country: { contains: search } },
          { user: { is: { first_name: { contains: search } } } },
          { user: { is: { last_name: { contains: search } } } },
          { user: { is: { email: { contains: search } } } },
        ];
      }

      return await this.memberService.findMany(filter, page, limit);
    } catch (error) {
      this.loggerService.log({
        error,
        path: 'src/member/member.controller.ts',
        function: 'filter',
        tags: ['member', 'filter'],
        extra: { is_coordinator, page, limit, search },
      });
      throw new NotFoundException('Error fetching members');
    }
  }

  @Auth(UserRoles.user, UserRoles.admin)
  @Get(':id')
  async getById(@Param('id') id: string) {
    try {
      const found = await this.memberService.getById(Number(id));
      if (!found) throw new NotFoundException('Member does not exists');
      return found;
    } catch (error) {
      this.loggerService.log({
        error,
        path: 'src/member/member.controller.ts',
        function: 'getById',
        tags: ['member', 'getById'],
        extra: { memberId: id },
      });
      throw new NotFoundException('Member does not exists');
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
      tournaments?: number[];
      remove?: { file?: string };
    },
    @UploadedFile()
    file?: Express.Multer.File,
  ) {
    try {
      const data = transformNestedFormDataBody(body, '', [
        'password',
        'phone_code',
        'phone_number',
        'dupr_alphanumeric',
        'flight',
        'position',
      ]);
      if (data.remove?.file) {
        removeStaticFile(PASSPORTS_URL, data.remove.file);
        data.member.passport_image = null;
      }
      if (file) {
        data.member.passport_image = file.filename;
      }
      const member = await this.memberService.create(data);
      return member;
    } catch (error) {
      this.loggerService.log({
        error,
        path: 'src/member/member.controller.ts',
        function: 'create',
        tags: ['member', 'create'],
        extra: { hasFile: !!file, body },
      });
      throw new NotFoundException(error.message || 'Error creating member');
    }
  }

  @Auth(UserRoles.user, UserRoles.admin)
  @Put(':id')
  @UseFilters(HttpExceptionFilter)
  @UseInterceptors(FileInterceptor('passportImage', multerOptions))
  async update(
    @Body()
    body: {
      user: User;
      member: Member;
      tournaments?: number[];
      remove?: { file?: string };
    },
    @Param('id') id: string,
    @UploadedFile()
    file?: Express.Multer.File,
  ) {
    try {
      const data = transformNestedFormDataBody(body, '', [
        'password',
        'phone_code',
        'phone_number',
        'dupr_alphanumeric',
        'flight',
        'position',
      ]);
      if (data.remove?.file) {
        removeStaticFile(PASSPORTS_URL, data.remove.file);
        data.member.passport_image = null;
      }
      if (file) {
        data.member.passport_image = file.filename;
      }
      return await this.memberService.update(Number(id), data);
    } catch (error) {
      this.loggerService.log({
        error,
        path: 'src/member/member.controller.ts',
        function: 'update',
        tags: ['member', 'update'],
        extra: { memberId: id, hasFile: !!file, body },
      });
      throw new NotFoundException(error.message || 'Member does not exists');
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    try {
      return await this.memberService.delete(Number(id));
    } catch (error) {
      this.loggerService.log({
        error,
        path: 'src/member/member.controller.ts',
        function: 'delete',
        tags: ['member', 'delete'],
        extra: { memberId: id },
      });
      throw new NotFoundException('Member does not exists');
    }
  }

  @Auth(UserRoles.user, UserRoles.admin)
  @Get('passport/:imageName')
  async findPassportImage(
    @Res() res: Response,
    @Param('imageName') imageName: string,
  ) {
    try {
      const path = getStaticFilePath(PASSPORTS_URL, imageName);

      res.sendFile(path, (err) => {
        if (err) {
          this.loggerService.log({
            error: err,
            path: 'src/member/member.controller.ts',
            function: 'findPassportImage',
            tags: ['member', 'passport', 'file'],
            extra: { imageName },
          });
          res.status(404).send('File not found');
        }
      });
    } catch (error) {
      this.loggerService.log({
        error,
        path: 'src/member/member.controller.ts',
        function: 'findPassportImage',
        tags: ['member', 'passport', 'file', 'path'],
        extra: { imageName },
      });
      throw new NotFoundException('File not found');
    }
  }
}
