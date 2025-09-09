import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PaymentService } from './payment.service';

describe('PaymentService', () => {
  let service: PaymentService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('https://mock-api.com/payment'),
          },
        },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processarPagamento', () => {
    const mockPaymentData = {
      valor: 1000,
      employeeId: 'emp-123',
      loanId: 'loan-456',
      contaBancaria: {
        banco: '001',
        agencia: '1234',
        conta: '567890'
      }
    };

    it('should process payment successfully most of the time', async () => {
      // Simula múltiplas tentativas para verificar a taxa de sucesso
      const results: Array<{ success: boolean; status: string; message?: string }> = [];
      for (let i = 0; i < 20; i++) {
        const result = await service.processarPagamento(mockPaymentData);
        results.push(result);
      }

      const successCount = results.filter(r => r.success).length;
      const errorCount = results.filter(r => !r.success).length;

      // Deve ter mais sucessos que falhas (aproximadamente 90% de sucesso)
      expect(successCount).toBeGreaterThan(errorCount);
      expect(successCount).toBeGreaterThanOrEqual(15); // Pelo menos 75% de sucesso
    });

    it('should return success structure for approved payments', async () => {
      // Como há aleatoriedade, vamos testar até conseguir um sucesso
      let result;
      let attempts = 0;
      do {
        result = await service.processarPagamento(mockPaymentData);
        attempts++;
      } while (!result.success && attempts < 50);

      expect(result.success).toBe(true);
      expect(result.status).toBe('aprovado');
      expect(result.message).toBe('Pagamento processado com sucesso');
    });

    it('should return error structure for failed payments', async () => {
      // Como há aleatoriedade, vamos testar até conseguir uma falha
      let result;
      let attempts = 0;
      do {
        result = await service.processarPagamento(mockPaymentData);
        attempts++;
      } while (result.success && attempts < 50);

      expect(result.success).toBe(false);
      expect(['erro_temporario', 'rejeitado']).toContain(result.status);
      expect(result.message).toBeDefined();
    });

    it('should handle payment data correctly', async () => {
      const customPaymentData = {
        valor: 2500.50,
        employeeId: 'emp-789',
        loanId: 'loan-101',
      };

      const result = await service.processarPagamento(customPaymentData);
      
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('message');
      expect(typeof result.success).toBe('boolean');
      expect(typeof result.status).toBe('string');
      expect(typeof result.message).toBe('string');
    });
  });

  describe('verificarDisponibilidade', () => {
    it('should return availability status', async () => {
      const result = await service.verificarDisponibilidade();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('getMetodosPagamento', () => {
    it('should return available payment methods', () => {
      const result = service.getMetodosPagamento();
      
      expect(result).toHaveProperty('transferenciaBancaria');
      expect(result).toHaveProperty('pix');
      
      expect(result.transferenciaBancaria).toHaveProperty('disponivel');
      expect(result.transferenciaBancaria).toHaveProperty('tempoProcessamento');
      expect(result.transferenciaBancaria).toHaveProperty('taxas');
      
      expect(result.pix).toHaveProperty('disponivel');
      expect(result.pix).toHaveProperty('tempoProcessamento');
      expect(result.pix).toHaveProperty('taxas');
      
      expect(result.transferenciaBancaria.disponivel).toBe(true);
      expect(result.pix.disponivel).toBe(true);
    });

    it('should return correct payment method details', () => {
      const result = service.getMetodosPagamento();
      
      expect(result.transferenciaBancaria.tempoProcessamento).toBe('1-2 dias úteis');
      expect(result.transferenciaBancaria.taxas).toBe('Sem taxas adicionais');
      
      expect(result.pix.tempoProcessamento).toBe('Instantâneo');
      expect(result.pix.taxas).toBe('Sem taxas adicionais');
    });
  });
});
