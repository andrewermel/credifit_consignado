import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';

interface ScoreResponse {
  score: number;
}

@Injectable()
export class ScoreService {
  private readonly logger = new Logger(ScoreService.name);
  private readonly scoreApiUrl: string;

  constructor(private configService: ConfigService) {
    this.scoreApiUrl = this.configService.get<string>('SCORE_API_URL') || 'https://mocki.io/v1/f7b3627c-444a-4d65-b76b-d94a6c63bdcf';
  }

  async consultarScore(cpf: string): Promise<number> {
    try {
      this.logger.log(`Consultando score para CPF: ${cpf.substring(0, 3)}***`);
      
      const response: AxiosResponse<ScoreResponse> = await axios.get(this.scoreApiUrl, {
        timeout: 10000, // 10 segundos
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const score = response.data.score;
      this.logger.log(`Score consultado com sucesso: ${score}`);
      
      return score;
    } catch (error) {
      this.logger.error(`Erro ao consultar score: ${error.message}`);
      
      // Em caso de erro, retorna um score padrão baixo
      // Em produção, você pode implementar uma estratégia diferente
      return 300;
    }
  }

  /**
   * Valida se o score é suficiente para a faixa salarial
   * @param score Score de crédito
   * @param salario Salário do funcionário
   * @returns Se o score é suficiente
   */
  validarScorePorSalario(score: number, salario: number): boolean {
    const scoreMinimo = this.getScoreMinimo(salario);
    return score >= scoreMinimo;
  }

  /**
   * Retorna o score mínimo necessário baseado no salário
   * @param salario Salário do funcionário
   * @returns Score mínimo necessário
   */
  getScoreMinimo(salario: number): number {
    if (salario <= 2000) return 400;
    if (salario <= 4000) return 500;
    if (salario <= 8000) return 600;
    if (salario <= 12000) return 700;
    return 800; // Para salários acima de R$ 12.000
  }

  /**
   * Retorna informações sobre a política de score
   * @param salario Salário do funcionário
   * @returns Informações da política
   */
  getPoliticaScore(salario: number): { scoreMinimo: number; faixaSalarial: string } {
    if (salario <= 2000) {
      return { scoreMinimo: 400, faixaSalarial: 'Até R$ 2.000,00' };
    }
    if (salario <= 4000) {
      return { scoreMinimo: 500, faixaSalarial: 'De R$ 2.001,00 até R$ 4.000,00' };
    }
    if (salario <= 8000) {
      return { scoreMinimo: 600, faixaSalarial: 'De R$ 4.001,00 até R$ 8.000,00' };
    }
    if (salario <= 12000) {
      return { scoreMinimo: 700, faixaSalarial: 'De R$ 8.001,00 até R$ 12.000,00' };
    }
    return { scoreMinimo: 800, faixaSalarial: 'Acima de R$ 12.000,00' };
  }
}
