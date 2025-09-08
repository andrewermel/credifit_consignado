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
      
      const response: AxiosResponse<PaymentResponse> = await axios.post(this.paymentApiUrl, paymentData, {
        timeout: 30000, // 30 segundos para pagamentos
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const status = response.data.status.toLowerCase();
      
      if (status === 'aprovado' || status === 'approved') {
        this.logger.log(`Pagamento aprovado para empréstimo ${paymentData.loanId}`);
        return {
          success: true,
          status: 'aprovado',
          message: 'Pagamento processado com sucesso'
        };
      } else {
        this.logger.warn(`Pagamento rejeitado para empréstimo ${paymentData.loanId}: ${status}`);
        return {
          success: false,
          status: status,
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
