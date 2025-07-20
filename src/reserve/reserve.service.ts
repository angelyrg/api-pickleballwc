import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Reserve, Prisma } from '@prisma/client';

@Injectable()
export class ReserveService {
  constructor(private prisma: PrismaService) {}

  async getAll(): Promise<Reserve[]> {
    return this.prisma.reserve.findMany({
      include: {
        team: true,
      },
    });
  }
  async getById(id: number): Promise<Reserve> {
    return this.prisma.reserve.findUnique({
      where: {
        id: id,
      },
      include: {
        team: true,
      },
    });
  }
  async create(data: Prisma.ReserveUncheckedCreateInput): Promise<Reserve> {
    return this.prisma.reserve.create({
      data: data,
    });
  }
  async update(id: number, data: Reserve): Promise<Reserve> {
    return this.prisma.reserve.update({
      where: {
        id: id,
      },
      data: data,
    });
  }
  async delete(id: number): Promise<Reserve> {
    return this.prisma.reserve.delete({
      where: {
        id: id,
      },
    });
  }

  async getTeamReserves(team_id: number): Promise<Reserve[]> {
    return this.prisma.reserve.findMany({
      where: {
        team_id: team_id,
      },
      include: {
        team: true,
        payment: true,
      },
    });
  }
}
