import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'nodeEnv') return 'test';
      if (key === 'port') return 3000;
      if (key === 'ai') {
        return {
          primaryProvider: 'meta',
          fallbackProviders: ['modal', 'fireworks', 'mock'],
          resilience: {
            timeoutMs: 15000,
            maxRetries: 2,
          },
          meta: { apiKey: 'test-meta' },
          modal: { apiKey: 'test-modal' },
          fireworks: { apiKey: 'test-fireworks' },
        };
      }
      return null;
    }),
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    appController = moduleRef.get<AppController>(AppController);
  });

  describe('root and health checks', () => {
    it('should return operational status', () => {
      const result = appController.getRootStatus();
      expect(result.status).toBe('OPERATIONAL');
      expect(result.aiOrchestration.primaryProvider).toBe('meta');
      expect(result.aiOrchestration.fallbackProviders).toContain('modal');
    });

    it('should return health diagnostic', () => {
      const result = appController.getHealth();
      expect(result.name).toBe('AgroControl Multimodal Engine');
      expect(result.environment).toBe('test');
    });
  });
});
