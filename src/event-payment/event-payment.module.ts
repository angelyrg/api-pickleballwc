import { Module } from '@nestjs/common';
import { EventPaymentController } from './event-payment.controller';
import { EventPaymentService } from './event-payment.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { StripeService } from 'src/stripe/stripe.service';
import { ConfigService } from '@nestjs/config';
import { EventService } from 'src/event/event.service';
import { MailService } from 'src/mail/mail.service';

@Module({
  controllers: [EventPaymentController],
  providers: [
    EventPaymentService,
    StripeService,
    ConfigService,
    EventService,
    MailService,
  ],
  imports: [PrismaModule],
})
export class EventPaymentModule {}
