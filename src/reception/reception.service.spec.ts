import { Test, TestingModule } from '@nestjs/testing';
import { ReceptionService } from './reception.service';
import { VisionService } from '../ai/services/vision.service';
import { OcrService } from '../ai/services/ocr.service';
import { MockDbService } from '../database/mock-db.service';
import { ReceptionStatus } from '../common/enums/ai-provider.enum';

describe('ReceptionService', () => {
  let receptionService: ReceptionService;
  let mockVisionService: Partial<VisionService>;
  let mockOcrService: Partial<OcrService>;
  let mockDbService: Partial<MockDbService>;

  beforeEach(async () => {
    mockVisionService = {
      analyzeTruckImage: jest.fn().mockResolvedValue({
        totalBins: 18,
        totalPallets: 2,
        confidenceScore: 0.98,
        processingTimeMs: 120,
        provider: 'mock-sam3',
      }),
    };

    mockOcrService = {
      parseDispatchGuide: jest.fn().mockResolvedValue({
        documentId: 'GD-89412',
        supplierRut: '76.492.103-8',
        supplierName: 'Agrícola Los Nogales SpA',
        declaredKilos: 7200,
        declaredBins: 18,
        cropType: 'Royal Dawn Cherries',
        isLegible: true,
        confidenceScore: 0.97,
        processingTimeMs: 140,
        provider: 'mock-muse-glimmer',
      }),
    };

    mockDbService = {
      recordNewDelivery: jest.fn().mockImplementation((rut, rec) => rec),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReceptionService,
        { provide: VisionService, useValue: mockVisionService },
        { provide: OcrService, useValue: mockOcrService },
        { provide: MockDbService, useValue: mockDbService },
      ],
    }).compile();

    receptionService = module.get<ReceptionService>(ReceptionService);
  });

  it('should approve reception when physical bins match declared bins', async () => {
    const result = await receptionService.processIncomingReception({
      truckImage: 'data:image/jpeg;base64,mockTruck',
      dispatchGuideImage: 'data:image/jpeg;base64,mockGuide',
      yardId: 'YARD-CURICO-01',
    });

    expect(result.status).toBe(ReceptionStatus.APPROVED);
    expect(result.reconciliation.isMatched).toBe(true);
    expect(result.reconciliation.differenceBins).toBe(0);
    expect(result.visionAnalysis.totalBins).toBe(18);
    expect(result.ocrExtraction.declaredBins).toBe(18);
    expect(mockDbService.recordNewDelivery).toHaveBeenCalled();
  });

  it('should flag reception for review when physical count mismatches declared count', async () => {
    (mockVisionService.analyzeTruckImage as jest.Mock).mockResolvedValueOnce({
      totalBins: 16,
      totalPallets: 2,
      confidenceScore: 0.92,
      processingTimeMs: 110,
      provider: 'mock-sam3',
    });

    const result = await receptionService.processIncomingReception({
      truckImage: 'data:image/jpeg;base64,mockMismatchTruck',
      dispatchGuideImage: 'data:image/jpeg;base64,mockGuide',
      yardId: 'YARD-CURICO-01',
    });

    expect(result.status).toBe(ReceptionStatus.FLAGGED_FOR_REVIEW);
    expect(result.reconciliation.isMatched).toBe(false);
    expect(result.reconciliation.differenceBins).toBe(-2);
  });
});
