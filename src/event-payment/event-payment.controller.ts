import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { EventPaymentService } from './event-payment.service';
import { EventService } from 'src/event/event.service';
import { EventPayment, PaymentStatus } from '@prisma/client';
import { Auth } from 'src/auth/decorators';
import { UserRoles } from 'src/user/enums/roles.enums';
import { Query, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { StripeService } from 'src/stripe/stripe.service';
//@Auth(UserRoles.user, UserRoles.admin)

@Controller('event-payments')
export class EventPaymentController {
  constructor(
    private readonly EventPaymentService: EventPaymentService,
    private readonly EventService: EventService,
    private readonly StripeService: StripeService,
  ) {}
  // @Auth(UserRoles.user, UserRoles.admin)
  @Get()
  async getAll() {
    return this.EventPaymentService.getAll();
  }
  @Auth(UserRoles.user, UserRoles.admin)
  @Get('filter')
  async filter(
    //@Query('order_by') order_by?: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ) {
    return await this.EventPaymentService.findMany(page, limit);
  }
  @Auth(UserRoles.user, UserRoles.admin)
  @Get(':id')
  async getById(@Param('id') id: string) {
    const found = await this.EventPaymentService.getById(Number(id));
    if (!found) throw new NotFoundException('EventPayment does not exists');
    return found;
  }
  @Post()
  async create(@Body() data: EventPayment) {
    try {
      const event_id = data.event_id;
      const event = await this.EventService.getById(event_id);
      // VALIDATE TOTAL PAYMENTS:
      const current = await this.EventPaymentService.countByEvent(event_id);
      if (current < event.limit) {
        const final_amount = parseInt(String(Number(event.amount) * 100));
        const secret = await this.StripeService.paymentIntents(
          final_amount,
          'USD',
          data.concept,
        );
        data.payment_intent = secret;
        data.status = PaymentStatus.PENDING;
        data.amount = event.amount;
        return await this.EventPaymentService.create(data);
      } else {
        throw new InternalServerErrorException('max limit reached!');
      }
    } catch (error) {
      throw new NotFoundException('Error generate payment intent' + error);
    }
  }
  @Post('validate')
  async validate(@Body() data: { id: number; payment_response: string }) {
    try {
      const payment_data = JSON.parse(data.payment_response);
      const secret = payment_data.client_secret;
      let is_valid = true;
      if (data.id) {
        is_valid = await this.EventPaymentService.token_validate(
          data.id,
          secret,
        );
      }
      let status: PaymentStatus = PaymentStatus.PENDING;
      if (is_valid) {
        //update PAYMENT
        switch (payment_data.status) {
          case 'succeeded':
            status = PaymentStatus.APPROVED;
            break;
          case 'canceled':
            status = PaymentStatus.REJECTED;
            break;
          default:
            status = PaymentStatus.PENDING;
            break;
        }
        return await this.EventPaymentService.finish(data.id, status);
      }
    } catch (error) {
      throw new NotFoundException('Error validate payment intent' + error);
    }
  }
  @Auth(UserRoles.user, UserRoles.admin)
  @Put(':id')
  async update(@Body() data: EventPayment, @Param('id') id: string) {
    try {
      return this.EventPaymentService.update(Number(id), data);
    } catch (error) {
      throw new NotFoundException('EventPayment does not exists');
    }
  }
  @Auth(UserRoles.user, UserRoles.admin)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    try {
      return await this.EventPaymentService.delete(Number(id));
    } catch (error) {
      throw new NotFoundException('EventPayment does not exists');
    }
  }
  @Auth(UserRoles.user, UserRoles.admin)
  @Post('by-event')
  async getByEvent(@Body() data: { event_id: number }) {
    return await this.EventPaymentService.getByEvent(data.event_id);
  }
  @Auth(UserRoles.admin)
  @Get('event/:id/export/excel')
  async exportToExcel(@Param('id') id: string) {
    return this.EventPaymentService.exportToExcel(Number(id));
  }
}
