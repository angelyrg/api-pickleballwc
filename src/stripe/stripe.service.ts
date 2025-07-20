import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;
  constructor(private readonly configService: ConfigService) {
    this.stripe = new Stripe(configService.get('stripe.secret'));
  }
  async paymentIntents(
    amount: number,
    currency: string,
    description: string,
  ): Promise<string> {
    try {
      if (amount > 0) {
        const paymentIntent = await this.stripe.paymentIntents.create({
          amount: amount,
          currency: currency,
          description: description,
          //confirm: true
        });
        return paymentIntent.client_secret;
      }
    } catch (error) {
      console.log(error);
    }
  }
}
