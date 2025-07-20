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
import { PaymentService } from './payment.service';
import { Payment, TeamStatus } from '@prisma/client';
import { Auth } from 'src/auth/decorators';
import { UserRoles } from 'src/user/enums/roles.enums';
import { TeamService } from 'src/team/team.service';
import { StripeService } from 'src/stripe/stripe.service';
import { PaymentConcept, PaymentStatus } from '@prisma/client';
import { ReserveService } from 'src/reserve/reserve.service';
import { Prisma } from '@prisma/client';
@Controller('payments')
export class PaymentController {
  constructor(
    private readonly PaymentService: PaymentService,
    private readonly TeamService: TeamService,
    private readonly StripeService: StripeService,
    private readonly ReserveService: ReserveService,
  ) {}
  @Auth(UserRoles.admin)
  @Get()
  async getAll() {
    return this.PaymentService.getAll();
  }
  @Auth(UserRoles.admin)
  @Get(':id')
  async getById(@Param('id') id: string) {
    const found = await this.PaymentService.getById(Number(id));
    if (!found) throw new NotFoundException('Payment does not exists');
    return found;
  }
  @Auth(UserRoles.user, UserRoles.admin)
  @Post()
  async create(@Body() data: Payment) {
    return this.PaymentService.create(data);
  }
  @Auth(UserRoles.admin)
  @Put(':id')
  async update(@Body() data: Payment, @Param('id') id: string) {
    try {
      return this.PaymentService.update(Number(id), data);
    } catch (error) {
      throw new NotFoundException('Payment does not exists');
    }
  }
  @Auth(UserRoles.admin)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    try {
      return await this.PaymentService.delete(Number(id));
    } catch (error) {
      throw new NotFoundException('Payment does not exists');
    }
  }
  @Auth(UserRoles.user, UserRoles.admin)
  @Get('team/:id')
  async myPayments(@Param('id') id: string) {
    return await this.PaymentService.getTeamPayments(Number(id));
  }
  @Auth(UserRoles.user, UserRoles.admin)
  @Post('stripe/generate')
  async generateStripe(
    @Body() data: { amount: number; team_id: number; concept: string },
  ) {
    try {
      const final_amount = parseInt(String(data.amount * 100));
      const secret = await this.StripeService.paymentIntents(
        final_amount,
        'USD',
        data.concept,
      );
      //register secret token to team
      const team = await this.TeamService.token_update(
        Number(data.team_id),
        secret,
      );
      if (team) {
        return {
          secret: secret,
        };
      } else
        throw new InternalServerErrorException('secret token cant set on team');
    } catch (error) {
      throw new NotFoundException('Can not generate stripe token');
    }
  }
  @Auth(UserRoles.user, UserRoles.admin)
  @Post('stripe/register')
  async register(@Body() data: { payment_response: string; team_id: number }) {
    try {
      //process PAYMENT
      const payment = this.setPayment(
        data.payment_response,
        PaymentConcept.REGISTER,
        data.team_id,
      );
      if (payment) {
        //set team status
        this.TeamService.status_update(data.team_id, TeamStatus.PAID);
        return payment;
      } else {
        throw new InternalServerErrorException('Invalid Token');
      }
    } catch (error) {
      throw new NotFoundException('Cant generate stripe token');
    }
  }
  @Auth(UserRoles.user, UserRoles.admin)
  @Post('stripe/reserve')
  async reserve(
    @Body()
    data: {
      payment_response: string;
      team_id: number;
      start: Date;
      end: Date;
      qty: number;
    },
  ) {
    try {
      //process PAYMENT
      const payment = await this.setPayment(
        data.payment_response,
        PaymentConcept.RESERVE,
        data.team_id,
      );
      if (payment) {
        //set reserve
        const reserve_data: Prisma.ReserveUncheckedCreateInput = {
          team_id: data.team_id,
          payment_id: payment.id,
          start: data.start,
          end: data.end,
          qty: data.qty,
        };
        const reserve = await this.ReserveService.create(reserve_data);

        const response = {
          reserve: reserve,
          payment: payment,
        };
        return response;
      } else {
        throw new InternalServerErrorException('Invalid Token');
      }
    } catch (error) {
      throw new NotFoundException('Cant generate stripe token' + error);
    }
  }

  async setPayment(
    payment_response: string,
    concept: PaymentConcept,
    team_id?: number,
  ) {
    const payment_data = JSON.parse(payment_response);
    const secret = payment_data.client_secret;
    let is_valid = true;
    if (team_id) {
      is_valid = await this.TeamService.token_validate(team_id, secret);
    }
    let status: PaymentStatus = PaymentStatus.PENDING;
    if (is_valid) {
      //register PAYMENT
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
      const data: Prisma.PaymentUncheckedCreateInput = {
        team_id: team_id,
        concept: concept,
        amount: payment_data.amount,
        response: payment_response,
        payment_intent: secret,
        status: status,
      };
      const payment = await this.PaymentService.create(data);
      return payment;
    }
  }
}
