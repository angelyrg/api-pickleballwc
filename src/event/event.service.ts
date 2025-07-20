import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Event } from '@prisma/client';
import {
  PaginatedResult,
  PaginateFunction,
  paginator,
} from 'src/paginator/paginator';

@Injectable()
export class EventService {
  constructor(private prisma: PrismaService) {}

  async getAll(): Promise<Event[]> {
    return this.prisma.event.findMany();
  }
  async findMany(
    filter: any,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResult<Event>> {
    const paginate: PaginateFunction = paginator({ limit: limit });
    return paginate(
      this.prisma.event,
      {
        where: filter,
      },
      {
        page,
      },
    );
  }
  async getById(id: number): Promise<Event> {
    return this.prisma.event.findUnique({
      where: {
        id: id,
      },
    });
  }
  async create(data: Event): Promise<Event> {
    return this.prisma.event.create({
      data: data,
    });
  }
  async update(id: number, data: Event): Promise<Event> {
    return this.prisma.event.update({
      where: {
        id: id,
      },
      data: data,
    });
  }
  async delete(id: number): Promise<Event> {
    try {
      return this.prisma.event.delete({
        where: {
          id: id,
        },
      });
    } catch (error) {
      throw new NotFoundException('Event not found');
    }
  }
}
