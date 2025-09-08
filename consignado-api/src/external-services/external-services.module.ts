import { Module } from '@nestjs/common';
import { ScoreService } from './score/score.service';
import { PaymentService } from './payment/payment.service';

@Module({
  providers: [ScoreService, PaymentService]
})
export class ExternalServicesModule {}
