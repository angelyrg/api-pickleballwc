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
import { EventService } from './event.service';
import { Event } from '@prisma/client';
import { Auth } from 'src/auth/decorators';
import { UserRoles } from 'src/user/enums/roles.enums';
import { Query, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
//@Auth(UserRoles.user, UserRoles.admin)

@Controller('events')
export class EventController {
  constructor(private readonly EventService: EventService) {}
  // @Auth(UserRoles.user, UserRoles.admin)
  @Get()
  async getAll() {
    return this.EventService.getAll();
  }
  @Auth(UserRoles.user, UserRoles.admin)
  @Get('filter')
  async filter(
    @Query('is_active') is_active?: any,
    //@Query('order_by') order_by?: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ) {
    let filter = {};

    if (is_active !== undefined) {
      filter = { ...filter, is_active: is_active === 'true' };
    }

    return this.EventService.findMany(filter, page, limit);
  }
  @Auth(UserRoles.user, UserRoles.admin)
  @Get(':id')
  async getById(@Param('id') id: string) {
    const found = await this.EventService.getById(Number(id));
    if (!found) throw new NotFoundException('Event does not exists');
    return found;
  }
  @Auth(UserRoles.user, UserRoles.admin)
  @Post()
  async create(@Body() data: Event) {
    return this.EventService.create(data);
  }
  @Auth(UserRoles.user, UserRoles.admin)
  @Put(':id')
  async update(@Body() data: Event, @Param('id') id: string) {
    try {
      return this.EventService.update(Number(id), data);
    } catch (error) {
      throw new NotFoundException('Event does not exists');
    }
  }
  @Auth(UserRoles.user, UserRoles.admin)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    try {
      return await this.EventService.delete(Number(id));
    } catch (error) {
      throw new NotFoundException('Event does not exists');
    }
  }
}
