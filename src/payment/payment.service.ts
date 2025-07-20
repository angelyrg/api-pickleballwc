import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Payment, Prisma } from '@prisma/client';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  async getAll(): Promise<Payment[]> {
    return this.prisma.payment.findMany({
      include: {
        team: true,
      },
    });
  }
  async getById(id: number): Promise<Payment> {
    return this.prisma.payment.findUnique({
      where: {
        id: id,
      },
      include: {
        team: true,
      },
    });
  }
  async create(data: Prisma.PaymentUncheckedCreateInput): Promise<Payment> {
    // console.log('data: ' + JSON.stringify(data, null, 2));
    return this.prisma.payment.create({
      data: data,
    });
  }
  async update(id: number, data: Payment): Promise<Payment> {
    return this.prisma.payment.update({
      where: {
        id: id,
      },
      data: data,
    });
  }
  async delete(id: number): Promise<Payment> {
    return this.prisma.payment.delete({
      where: {
        id: id,
      },
    });
  }

  async getTeamPayments(team_id: number): Promise<Payment[]> {
    return this.prisma.payment.findMany({
      where: {
        team_id: team_id,
      },
      include: {
        team: true,
      },
    });
  }
}
