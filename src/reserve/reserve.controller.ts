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
import { ReserveService } from './reserve.service';
import { Reserve } from '@prisma/client';
import { Auth } from 'src/auth/decorators';
import { UserRoles } from 'src/user/enums/roles.enums';
@Controller('reserves')
export class ReserveController {
  constructor(private readonly ReserveService: ReserveService) {}
  @Auth(UserRoles.admin)
  @Get()
  async getAll() {
    return this.ReserveService.getAll();
  }
  @Auth(UserRoles.admin)
  @Get(':id')
  async getById(@Param('id') id: string) {
    const found = await this.ReserveService.getById(Number(id));
    if (!found) throw new NotFoundException('Reserve does not exists');
    return found;
  }
  @Auth(UserRoles.user, UserRoles.admin)
  @Post()
  async create(@Body() data: Reserve) {
    return this.ReserveService.create(data);
  }
  @Auth(UserRoles.admin)
  @Put(':id')
  async update(@Body() data: Reserve, @Param('id') id: string) {
    try {
      return this.ReserveService.update(Number(id), data);
    } catch (error) {
      throw new NotFoundException('Reserve does not exists');
    }
  }
  @Auth(UserRoles.admin)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    try {
      return await this.ReserveService.delete(Number(id));
    } catch (error) {
      throw new NotFoundException('Reserve does not exists');
    }
  }
  @Auth(UserRoles.user, UserRoles.admin)
  @Get('team/:id')
  async myReserves(@Param('id') id: string) {
    return await this.ReserveService.getTeamReserves(Number(id));
  }
}
