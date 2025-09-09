import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ScoreService } from './score.service';

describe('ScoreService', () => {
  let service: ScoreService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScoreService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('https://mock-api.com/score'),
          },
        },
      ],
    }).compile();

    service = module.get<ScoreService>(ScoreService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('consultarScore', () => {
    it('should generate deterministic score based on CPF', async () => {
      const cpf1 = '123.456.789-01';
      const cpf2 = '123.456.789-01';
      
      const score1 = await service.consultarScore(cpf1);
      const score2 = await service.consultarScore(cpf2);
      
      expect(score1).toBe(score2);
      expect(score1).toBeGreaterThanOrEqual(300);
      expect(score1).toBeLessThanOrEqual(850);
    });

    it('should generate different scores for different CPFs', async () => {
      const cpf1 = '123.456.789-01';
      const cpf2 = '123.456.789-07';
      
      const score1 = await service.consultarScore(cpf1);
      const score2 = await service.consultarScore(cpf2);
      
      expect(score1).not.toBe(score2);
    });

    it('should handle CPF with special characters', async () => {
      const cpfWithMask = '123.456.789-01';
      const cpfWithoutMask = '12345678901';
      
      const score1 = await service.consultarScore(cpfWithMask);
      const score2 = await service.consultarScore(cpfWithoutMask);
      
      expect(score1).toBe(score2);
    });
  });

  describe('validarScorePorSalario', () => {
    it('should approve score 450 for salary 1500 (≤ 2000)', () => {
      const result = service.validarScorePorSalario(450, 1500);
      expect(result).toBe(true);
    });

    it('should reject score 350 for salary 1500 (≤ 2000)', () => {
      const result = service.validarScorePorSalario(350, 1500);
      expect(result).toBe(false);
    });

    it('should approve score 550 for salary 3000 (≤ 4000)', () => {
      const result = service.validarScorePorSalario(550, 3000);
      expect(result).toBe(true);
    });

    it('should reject score 450 for salary 3000 (≤ 4000)', () => {
      const result = service.validarScorePorSalario(450, 3000);
      expect(result).toBe(false);
    });

    it('should approve score 650 for salary 6000 (≤ 8000)', () => {
      const result = service.validarScorePorSalario(650, 6000);
      expect(result).toBe(true);
    });

    it('should reject score 550 for salary 6000 (≤ 8000)', () => {
      const result = service.validarScorePorSalario(550, 6000);
      expect(result).toBe(false);
    });

    it('should approve score 750 for salary 10000 (≤ 12000)', () => {
      const result = service.validarScorePorSalario(750, 10000);
      expect(result).toBe(true);
    });

    it('should reject score 650 for salary 10000 (≤ 12000)', () => {
      const result = service.validarScorePorSalario(650, 10000);
      expect(result).toBe(false);
    });

    it('should approve score 850 for salary 15000 (> 12000)', () => {
      const result = service.validarScorePorSalario(850, 15000);
      expect(result).toBe(true);
    });

    it('should reject score 750 for salary 15000 (> 12000)', () => {
      const result = service.validarScorePorSalario(750, 15000);
      expect(result).toBe(false);
    });
  });

  describe('getScoreMinimo', () => {
    it('should return 400 for salary ≤ 2000', () => {
      expect(service.getScoreMinimo(1000)).toBe(400);
      expect(service.getScoreMinimo(2000)).toBe(400);
    });

    it('should return 500 for salary between 2001 and 4000', () => {
      expect(service.getScoreMinimo(2500)).toBe(500);
      expect(service.getScoreMinimo(4000)).toBe(500);
    });

    it('should return 600 for salary between 4001 and 8000', () => {
      expect(service.getScoreMinimo(5000)).toBe(600);
      expect(service.getScoreMinimo(8000)).toBe(600);
    });

    it('should return 700 for salary between 8001 and 12000', () => {
      expect(service.getScoreMinimo(10000)).toBe(700);
      expect(service.getScoreMinimo(12000)).toBe(700);
    });

    it('should return 800 for salary > 12000', () => {
      expect(service.getScoreMinimo(15000)).toBe(800);
      expect(service.getScoreMinimo(20000)).toBe(800);
    });
  });

  describe('getPoliticaScore', () => {
    it('should return correct policy for salary ≤ 2000', () => {
      const result = service.getPoliticaScore(1500);
      expect(result).toEqual({
        scoreMinimo: 400,
        faixaSalarial: 'Até R$ 2.000,00'
      });
    });

    it('should return correct policy for salary between 2001-4000', () => {
      const result = service.getPoliticaScore(3000);
      expect(result).toEqual({
        scoreMinimo: 500,
        faixaSalarial: 'De R$ 2.001,00 até R$ 4.000,00'
      });
    });

    it('should return correct policy for salary between 4001-8000', () => {
      const result = service.getPoliticaScore(6000);
      expect(result).toEqual({
        scoreMinimo: 600,
        faixaSalarial: 'De R$ 4.001,00 até R$ 8.000,00'
      });
    });

    it('should return correct policy for salary between 8001-12000', () => {
      const result = service.getPoliticaScore(10000);
      expect(result).toEqual({
        scoreMinimo: 700,
        faixaSalarial: 'De R$ 8.001,00 até R$ 12.000,00'
      });
    });

    it('should return correct policy for salary > 12000', () => {
      const result = service.getPoliticaScore(15000);
      expect(result).toEqual({
        scoreMinimo: 800,
        faixaSalarial: 'Acima de R$ 12.000,00'
      });
    });
  });
});
