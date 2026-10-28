import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ReceptionService } from './reception/reception.service';
import { ChatService } from './chat/chat.service';
import { ReceptionStatus } from './common/enums/ai-provider.enum';

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

  const mockReceptionService = {
    processIncomingReception: jest.fn().mockResolvedValue({
      receptionId: 'REC-20261028-1234',
      timestamp: '2026-10-28T03:00:00.000Z',
      status: ReceptionStatus.APPROVED,
      summary: 'Physical truck bins match declared dispatch guide perfectly.',
      visionAnalysis: { totalBins: 18, totalPallets: 2, confidenceScore: 0.98, processingTimeMs: 120, provider: 'mock-sam3' },
      ocrExtraction: { documentId: 'GD-89412', supplierRut: '76.492.103-8', declaredBins: 18, declaredKilos: 7200, cropType: 'Cherries', isLegible: true, confidenceScore: 0.97, processingTimeMs: 140, provider: 'mock-muse-glimmer' },
      reconciliation: { isMatched: true, differenceBins: 0, reason: 'Exact match: 18 physical bins == 18 declared bins.' },
      totalProcessingTimeMs: 150,
    }),
  };

  const mockChatService = {
    handleFarmerMessage: jest.fn().mockResolvedValue({
      response: 'Estimado Don Carlos, su entrega del martes fue aprobada y liquidada.',
      intent: 'PAYMENT_STATUS',
      groundedDeliveriesCount: 3,
      provider: 'mock-muse-spark',
      referencedDeliveries: [],
      timestamp: '2026-10-28T03:00:00.000Z',
    }),
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: ReceptionService, useValue: mockReceptionService },
        { provide: ChatService, useValue: mockChatService },
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

  describe('master orchestration endpoints', () => {
    it('should orchestrate reception via POST /api/reception/process', async () => {
      const res = await appController.processReception({
        truckImage: 'mockTruck',
        dispatchGuideImage: 'mockGuide',
      });
      expect(res.status).toBe(ReceptionStatus.APPROVED);
      expect(res.reconciliation.isMatched).toBe(true);
    });

    it('should handle farmer chat via POST /api/chat', async () => {
      const res = await appController.chat({
        message: '¿Me liquidaron los 18 bins del martes?',
        farmerId: 'FARMER-76492',
      });
      expect(res.intent).toBe('PAYMENT_STATUS');
      expect(res.response).toContain('Don Carlos');
    });
  });
});
