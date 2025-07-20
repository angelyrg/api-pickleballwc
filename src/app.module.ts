import {
  // MiddlewareConsumer,
  Module,
  // NestModule,
  // RequestMethod,
} from '@nestjs/common';
import { UserModule } from './user/user.module';
import { PlayerModule } from './player/player.module';
import { TeamModule } from './team/team.module';
import { TournamentModule } from './tournament/tournament.module';
import { MemberModule } from './member/member.module';
import { EnvConfiguration } from './config/env.config';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PaymentModule } from './payment/payment.module';
import { ReserveModule } from './reserve/reserve.module';
import { EventModule } from './event/event.module';
import { EventPaymentModule } from './event-payment/event-payment.module';
import { SupportModule } from './support/support.module';
import { LoggerModule } from './logger/logger.module'; // Import LoggerModule
import { MailModule } from './mail/mail.module';
// import { AttachLoggerMiddleware } from './common/middleware/logger.middleware';
// import { MemberController } from './member/member.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [EnvConfiguration],
    }),

    AuthModule,
    UserModule,
    PlayerModule,
    TeamModule,
    TournamentModule,
    MemberModule,
    PaymentModule,
    ReserveModule,
    SupportModule,
    EventModule,
    EventPaymentModule,

    MailModule,
    LoggerModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
// export class AppModule implements NestModule {
// configure(consumer: MiddlewareConsumer) {
//   consumer.apply(AttachLoggerMiddleware).forRoutes(
//     MemberController,
//     { path: 'members/:id', method: RequestMethod.PUT },
//   );
// }
// }
