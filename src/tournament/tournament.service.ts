import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Tournament } from '@prisma/client';

@Injectable()
export class TournamentService {
  constructor(private prisma: PrismaService) {}

  async getAll(): Promise<Tournament[]> {
    return this.prisma.tournament.findMany({
      where: {
        active: true,
      },
      orderBy: {
        position: 'asc',
      },
    });
  }
  async getById(id: number): Promise<Tournament> {
    return this.prisma.tournament.findUnique({
      where: {
        id: id,
      },
    });
  }
  async create(data: Tournament): Promise<Tournament> {
    return this.prisma.tournament.create({
      data: data,
    });
  }
  async update(id: number, data: Tournament): Promise<Tournament> {
    return this.prisma.tournament.update({
      where: {
        id: id,
      },
      data: data,
    });
  }
  async delete(id: number): Promise<Tournament> {
    return this.prisma.tournament.delete({
      where: {
        id: id,
      },
    });
  }
  async availableByCoordinator(coordinator_id: number): Promise<Tournament[]> {
    return this.prisma.tournament.findMany({
      where: {
        active: true,
      },
      orderBy: {
        position: 'asc',
      },
      include: {
        teams: {
          where: {
            coordinator: {
              id: coordinator_id,
            },
          },
        },
      },
    });
  }
}
