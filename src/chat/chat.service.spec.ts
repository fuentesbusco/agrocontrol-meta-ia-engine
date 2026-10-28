import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { AgentService } from '../ai/services/agent.service';
import { MockDbService } from '../database/mock-db.service';

describe('ChatService', () => {
  let chatService: ChatService;
  let mockAgentService: Partial<AgentService>;
  let mockDbService: Partial<MockDbService>;

  beforeEach(async () => {
    mockAgentService = {
      processFarmerQuery: jest.fn().mockResolvedValue({
        agentResponse:
          'Estimado Don Carlos, su entrega del martes (18 bins) fue APROBADA y ya está liquidada.',
        intent: 'PAYMENT_STATUS',
        groundedDeliveriesCount: 3,
        provider: 'mock-muse-spark',
        referencedDeliveries: [
          {
            receptionId: 'REC-2026-1020',
            deliveryDate: '2026-10-20',
            dispatchGuideNumber: 'GD-89412',
            cropType: 'Royal Dawn Cherries',
            declaredBins: 18,
            countedBins: 18,
            declaredKilos: 7200,
            status: 'APPROVED',
            isLiquidated: true,
            paymentAmountClp: 18450000,
          },
        ],
      }),
    };

    mockDbService = {
      getFarmerContext: jest.fn().mockReturnValue({
        farmerId: 'FARMER-76492',
        farmerName: 'Agrícola Los Nogales SpA',
      }),
      getAllFarmers: jest.fn().mockReturnValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        { provide: AgentService, useValue: mockAgentService },
        { provide: MockDbService, useValue: mockDbService },
      ],
    }).compile();

    chatService = module.get<ChatService>(ChatService);
  });

  it('should process farmer inquiry and return grounded response', async () => {
    const result = await chatService.handleFarmerMessage({
      farmerId: 'FARMER-76492',
      message: '¿Me liquidaron los 18 bins de la entrega del martes?',
    });

    expect(result.response).toContain('Don Carlos');
    expect(result.intent).toBe('PAYMENT_STATUS');
    expect(result.groundedDeliveriesCount).toBe(3);
    expect(result.referencedDeliveries.length).toBe(1);
    expect(result.referencedDeliveries[0].isLiquidated).toBe(true);
  });
});
