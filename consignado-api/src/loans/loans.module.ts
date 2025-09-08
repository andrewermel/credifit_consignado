import { Module } from '@nestjs/common';
import { LoansService } from './loans.service';
import { LoansController } from './loans.controller';
import { ExternalServicesModule } from '../external-services/external-services.module';

@Module({
  imports: [ExternalServicesModule],
  controllers: [LoansController],
  providers: [LoansService],
})
export class LoansModule {}
