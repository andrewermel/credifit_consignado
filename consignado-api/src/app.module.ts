import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CompaniesModule } from './companies/companies.module';
import { EmployeesModule } from './employees/employees.module';
import { LoansModule } from './loans/loans.module';
import { ExternalServicesModule } from './external-services/external-services.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule, 
    CompaniesModule, 
    EmployeesModule, 
    LoansModule, 
    ExternalServicesModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
