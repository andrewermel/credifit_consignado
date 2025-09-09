import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';

interface PaymentResponse {
  status: string;
}

interface PaymentRequest {
  valor: number;
  employeeId: string;
  loanId: string;
  contaBancaria?: {
    banco: string;
    agencia: string;
    conta: string;
  };
}

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private readonly paymentApiUrl: string;

  constructor(private configService: ConfigService) {
    this.paymentApiUrl = this.configService.get<string>('PAYMENT_API_URL') || 'https://mocki.io/v1/386c594b-d42f-4d14-8036-508a0cf1264c';
  }

  async processarPagamento(paymentData: PaymentRequest): Promise<{ success: boolean; status: string; message?: string }> {
    try {
      this.logger.log(`Processando pagamento para empréstimo ${paymentData.loanId}, valor: R$ ${paymentData.valor}`);
      
      // Simula o gateway de pagamento localmente
      // (Já que a URL do mocki.io fornecida retorna 404)
      const result = this.simulatePaymentGateway(paymentData);
      
      if (result.status === 'aprovado') {
        this.logger.log(`Pagamento aprovado para empréstimo ${paymentData.loanId}`);
        return {
          success: true,
          status: 'aprovado',
          message: 'Pagamento processado com sucesso'
        };
      } else {
        this.logger.warn(`Pagamento rejeitado para empréstimo ${paymentData.loanId}: ${result.status}`);
        return {
          success: false,
          status: result.status,
          message: 'Pagamento rejeitado pelo gateway'
        };
      }
    } catch (error) {
      this.logger.error(`Erro ao processar pagamento: ${error.message}`);
      
      // Em caso de erro de rede/timeout, consideramos como falha temporária
      return {
        success: false,
        status: 'erro',
        message: 'Serviço de pagamento temporariamente indisponível. Tente novamente em alguns minutos.'
      };
    }
  }

  /**
   * Simula o gateway de pagamento localmente
   * (Como as URLs do mocki.io fornecidas retornam 404)
   */
  private simulatePaymentGateway(paymentData: PaymentRequest): { status: string } {
    // Simula ocasionalmente falhas no gateway (como mencionado no teste)
    const random = Math.random();
    
    if (random < 0.05) { // 5% de chance de falha
      return { status: 'erro_temporario' };
    } else if (random < 0.1) { // 5% de chance de rejeição
      return { status: 'rejeitado' };
    } else {
      return { status: 'aprovado' }; // 90% de sucesso
    }
  }

  /**
   * Simula a verificação de disponibilidade do gateway
   * @returns Status da disponibilidade
   */
  async verificarDisponibilidade(): Promise<boolean> {
    try {
      const response = await axios.get(this.paymentApiUrl, {
        timeout: 5000,
      });
      return response.status === 200;
    } catch (error) {
      this.logger.warn(`Gateway de pagamento indisponível: ${error.message}`);
      return false;
    }
  }

  /**
   * Retorna informações sobre os métodos de pagamento disponíveis
   */
  getMetodosPagamento() {
    return {
      transferenciaBancaria: {
        disponivel: true,
        tempoProcessamento: '1-2 dias úteis',
        taxas: 'Sem taxas adicionais'
      },
      pix: {
        disponivel: true,
        tempoProcessamento: 'Instantâneo',
        taxas: 'Sem taxas adicionais'
      }
    };
  }
}
