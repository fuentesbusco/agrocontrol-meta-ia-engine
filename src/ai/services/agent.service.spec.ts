import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { AgentService } from './agent.service';
import { MockDbService } from '../../database/mock-db.service';
import { AiProvider } from '../../common/enums/ai-provider.enum';

describe('AgentService', () => {
  let agentService: AgentService;
  let mockDbService: MockDbService;

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'ai') {
          return {
            routing: { agentProvider: AiProvider.MOCK },
            fallbackProviders: [AiProvider.MOCK],
            fireworks: {
              apiKey: 'test-key',
              baseUrl: 'https://api.fireworks.ai/inference/v1',
              agentModel: 'accounts/fireworks/models/llama-v3p1-8b-instruct',
            },
          };
        }
        return null;
      }),
    };

    const mockHttpService = {
      post: jest.fn().mockReturnValue(
        of({
          data: {
            choices: [
              {
                message: {
                  content:
                    'Estimado Don Carlos: sí, su entrega del martes fue APROBADA y ya se encuentra LIQUIDADA.',
                },
              },
            ],
          },
        }),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentService,
        MockDbService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: HttpService, useValue: mockHttpService },
      ],
    }).compile();

    agentService = module.get<AgentService>(AgentService);
    mockDbService = module.get<MockDbService>(MockDbService);
  });

  it('should be defined', () => {
    expect(agentService).toBeDefined();
  });

  it('should accurately respond to payment inquiry for Tuesday delivery', async () => {
    const result = await agentService.processFarmerQuery({
      farmerId: 'FARMER-76492',
      userMessage: '¿Me liquidaron los 18 bins de la entrega del martes?',
    });

    expect(result.intent).toBe('PAYMENT_STATUS');
    expect(result.agentResponse).toContain('Don Carlos');
    expect(result.agentResponse).toContain('GD-89412');
    expect(result.agentResponse).toContain('18.450.000');
    expect(result.agentResponse).toContain('LIQUIDADA');
  });

  it('should handle follow-up dissatisfaction empathetically with grounded data', async () => {
    const result = await agentService.processFarmerQuery({
      farmerId: 'FARMER-76492',
      userMessage: 'No me respondiste la pregunta.',
    });

    expect(result.agentResponse).toContain('Disculpe la molestia');
    expect(result.agentResponse).toContain('GD-89412');
    expect(result.agentResponse).toContain('18.450.000');
  });

  it('should handle meta assistant inquiries with clarity', async () => {
    const result = await agentService.processFarmerQuery({
      farmerId: 'FARMER-76492',
      userMessage: 'Pero esta no es una IA conversacional de ayuda? no me respondes nada.',
    });

    expect(result.agentResponse).toContain('Don Carlos');
    expect(result.agentResponse).toContain('18.450.000');
  });
});

