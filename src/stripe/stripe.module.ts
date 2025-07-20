import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
//import { PrismaModule } from "src/prisma/prisma.module";

@Module({
  controllers: [],
  providers: [StripeService],
  imports: [],
})
export class StripeModule {}
