import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ReserveService } from 'src/reserve/reserve.service';
import { TeamService } from 'src/team/team.service';
import { StripeService } from 'src/stripe/stripe.service';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [PaymentController],
  providers: [
    PaymentService,
    ReserveService,
    TeamService,
    StripeService,
    ConfigService,
  ],
  imports: [PrismaModule],
})
export class PaymentModule {}
