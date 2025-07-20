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
import { UserService } from './user.service';
import { User } from '@prisma/client';
import { Auth } from 'src/auth/decorators';
import { LoggerService } from 'src/logger/logger.service';
import { UserRoles } from './enums/roles.enums';
import { Query, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
//@Auth(UserRoles.user, UserRoles.admin)

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly loggerService: LoggerService,
  ) {}
  @Auth(UserRoles.user, UserRoles.admin)
  @Get()
  async getAll() {
    try {
      return await this.userService.getAll();
    } catch (error) {
      this.loggerService.log({
        error,
        path: 'src/user/user.controller.ts',
        function: 'getAll',
        tags: ['user', 'getAll'],
      });
      throw new NotFoundException('Error fetching users');
    }
  }

  @Auth(UserRoles.user, UserRoles.admin)
  @Get('filter')
  async filter(
    @Query('is_admin') is_admin?: any,
    @Query('rol') rol?: any,
    //@Query('order_by') order_by?: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ) {
    let filter = {};

    if (is_admin !== undefined) {
      filter = { ...filter, is_admin: is_admin === 'true' };
    }
    if (rol !== undefined) {
      filter = { ...filter, rol: rol };
    }
    try {
      return await this.userService.findMany(filter, page, limit);
    } catch (error) {
      this.loggerService.log({
        error,
        path: 'src/user/user.controller.ts',
        function: 'filter',
        tags: ['user', 'filter'],
        extra: { filter, page, limit },
      });
      throw new NotFoundException('Error filtering users');
    }
  }

  @Auth(UserRoles.user, UserRoles.admin)
  @Get(':id')
  async getById(@Param('id') id: string) {
    try {
      const found = await this.userService.getById(Number(id));
      if (!found) throw new NotFoundException('User does not exists');
      return found;
    } catch (error) {
      this.loggerService.log({
        error,
        path: 'src/user/user.controller.ts',
        function: 'getById',
        tags: ['user', 'getById'],
        extra: { userId: id },
      });
      throw new NotFoundException('User does not exists');
    }
  }

  @Auth(UserRoles.user, UserRoles.admin)
  @Post()
  async create(@Body() data: User) {
    try {
      return await this.userService.create(data);
    } catch (error) {
      this.loggerService.log({
        error,
        path: 'src/user/user.controller.ts',
        function: 'create',
        tags: ['user', 'create'],
      });
      throw new NotFoundException('Error creating user');
    }
  }

  @Auth(UserRoles.user, UserRoles.admin)
  @Put(':id')
  async update(@Body() data: User, @Param('id') id: string) {
    try {
      return this.userService.update(Number(id), data);
    } catch (error) {
      this.loggerService.log({
        error,
        path: 'src/user/user.controller.ts',
        function: 'update',
        tags: ['user', 'update'],
        extra: { userId: id, updateData: data },
      });
      throw new NotFoundException('User does not exists');
    }
  }
  @Auth(UserRoles.user, UserRoles.admin)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    try {
      return await this.userService.delete(Number(id));
    } catch (error) {
      this.loggerService.log({
        error,
        path: 'src/user/user.controller.ts',
        function: 'delete',
        tags: ['user', 'delete'],
        extra: { userId: id },
      });
      throw new NotFoundException('User does not exists');
    }
  }

  @Post('token/generate')
  async token_generate(@Body() data: { email: string }) {
    try {
      return await this.userService.token_generate(data.email);
    } catch (error) {
      this.loggerService.log({
        error,
        path: 'src/user/user.controller.ts',
        function: 'token_generate',
        tags: ['user', 'token', 'generate'],
        extra: { email: data.email },
      });
      throw new NotFoundException('User does not exists');
    }
  }

  @Post('token/validate')
  async token_validate(@Body() data: { token: string }) {
    try {
      return await this.userService.token_validate(data.token);
    } catch (error) {
      this.loggerService.log({
        error,
        path: 'src/user/user.controller.ts',
        function: 'token_validate',
        tags: ['user', 'token', 'validate'],
      });
      throw new NotFoundException('User does not exists');
    }
  }
  @Post('password/reset')
  async password_reset(
    @Body() data: { email: string; token: string; password: string },
  ) {
    try {
      return await this.userService.password_reset(
        data.email,
        data.token,
        data.password,
      );
    } catch (error) {
      this.loggerService.log({
        error,
        path: 'src/user/user.controller.ts',
        function: 'password_reset',
        tags: ['user', 'password', 'reset'],
        extra: { email: data.email },
      });
      throw new NotFoundException('User does not exists');
    }
  }
  @Auth(UserRoles.admin)
  @Post('/password/oneshot')
  async new_password_oneshot() {
    try {
      return await this.userService.new_password_oneshot();
    } catch (error) {
      this.loggerService.log({
        error,
        path: 'src/user/user.controller.ts',
        function: 'new_password_oneshot',
        tags: ['user', 'password', 'oneshot'],
      });
      throw new NotFoundException('User does not exists');
    }
  }
}
