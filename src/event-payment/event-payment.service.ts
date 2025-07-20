import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EventPayment, PaymentStatus } from '@prisma/client';
import {
  PaginatedResult,
  PaginateFunction,
  paginator,
} from 'src/paginator/paginator';
import * as ExcelJS from 'exceljs';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class EventPaymentService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async getAll(): Promise<EventPayment[]> {
    return this.prisma.eventPayment.findMany();
  }
  async findMany(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResult<EventPayment>> {
    const paginate: PaginateFunction = paginator({ limit: limit });
    return paginate(
      this.prisma.event,
      {
        where: {
          status: PaymentStatus.APPROVED,
        },
      },
      {
        page,
      },
    );
  }
  async getById(id: number): Promise<EventPayment> {
    return this.prisma.eventPayment.findUnique({
      where: {
        id: id,
      },
    });
  }
  async create(data: EventPayment): Promise<EventPayment> {
    return this.prisma.eventPayment.create({
      data: data,
    });
  }
  async update(id: number, data: EventPayment): Promise<EventPayment> {
    return this.prisma.eventPayment.update({
      where: {
        id: id,
      },
      data: data,
    });
  }
  async delete(id: number): Promise<EventPayment> {
    try {
      return this.prisma.eventPayment.delete({
        where: {
          id: id,
        },
      });
    } catch (error) {
      throw new NotFoundException('EventPayment not found');
    }
  }

  async getByEvent(
    id: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResult<EventPayment>> {
    const paginate: PaginateFunction = paginator({ limit: limit });
    return paginate(
      this.prisma.eventPayment,
      {
        where: {
          event: {
            id: id,
          },
          status: PaymentStatus.APPROVED,
        },
        include: {
          event: true,
        },
        orderBy: {
          country: 'asc',
        },
      },
      {
        page,
      },
    );
  }
  async countByEvent(id: number): Promise<number> {
    return await this.prisma.eventPayment.count({
      where: {
        event: {
          id: id,
        },
        status: PaymentStatus.APPROVED,
      },
    });
  }
  async token_validate(id: number, token: string): Promise<boolean> {
    const eventPayment = await this.prisma.eventPayment.findUnique({
      where: {
        id: id,
      },
    });

    return eventPayment.payment_intent == token;
  }
  async finish(
    id: number,
    payment_status: PaymentStatus,
  ): Promise<EventPayment> {
    const event_payment = await this.prisma.eventPayment.update({
      where: {
        id: id,
      },
      data: {
        status: payment_status,
      },
    });
    const payment = await this.prisma.eventPayment.findUnique({
      where: {
        id: id,
      },
      include: {
        event: true,
      },
    });
    if (payment_status == PaymentStatus.APPROVED) {
      //SEND CONFIRMATION EMAIL
      const email_response = await this.mailService.event_confirmation(
        payment.event.code,
        payment.name,
        payment.email,
      );
      console.log(email_response);
    }

    return event_payment;
  }
  async exportToExcel(event_id: number) {
    const event_payments = await this.prisma.eventPayment.findMany({
      where: {
        event: {
          id: event_id,
        },
      },
      include: {
        event: true,
      },
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Teams Data');

    sheet.columns = [
      { header: 'N', key: 'number', width: 10 },
      { header: 'Evento', key: 'event_name', width: 20 },
      { header: 'monto', key: 'amount', width: 20 },
      { header: 'Nombre', key: 'name', width: 30 },
      { header: 'Apellido', key: 'lastname', width: 30 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'pais', key: 'country', width: 30 },
      { header: 'Cod. pais', key: 'country_code', width: 30 },
      { header: 'Telefono', key: 'phone', width: 30 },
      { header: 'pasaporte', key: 'passport', width: 30 },
      { header: 'payment_intent', key: 'payment_intent', width: 30 },
      { header: 'Concepto', key: 'concept', width: 30 },
      { header: 'status', key: 'status', width: 30 },
    ];
    let i = 0;
    event_payments.forEach((event_payment) => {
      i++;
      const data = {
        number: i,
        event_name: event_payment.event.name,
        amount: event_payment.amount,
        name: event_payment.name,
        lastname: event_payment.lastname,
        email: event_payment.email,
        country: event_payment.country,
        country_code: event_payment.country_code,
        phone: event_payment.phone,
        passport: event_payment.passport,
        payment_intent: event_payment.payment_intent,
        concept: event_payment.concept,
        status: event_payment.status,
      };
      sheet.addRow(data);
    });
    const buffer = await workbook.xlsx.writeBuffer();

    return buffer;
  }
}
