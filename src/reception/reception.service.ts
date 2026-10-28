import { Injectable, Logger } from '@nestjs/common';
import { VisionService } from '../ai/services/vision.service';
import { OcrService } from '../ai/services/ocr.service';
import { MockDbService } from '../database/mock-db.service';
import { ReceptionStatus } from '../common/enums/ai-provider.enum';
import { ProcessReceptionDto } from './dto/process-reception.dto';
import { ProcessReceptionResponseDto } from './dto/reception-response.dto';

@Injectable()
export class ReceptionService {
  private readonly logger = new Logger(ReceptionService.name);

  constructor(
    private readonly visionService: VisionService,
    private readonly ocrService: OcrService,
    private readonly mockDbService: MockDbService,
  ) {}

  async processIncomingReception(
    dto: ProcessReceptionDto,
  ): Promise<ProcessReceptionResponseDto> {
    const startTime = Date.now();
    this.logger.log(
      `Starting concurrent multimodal processing for yard reception. Truck license: ${dto.truckLicensePlate ?? 'N/A'}`,
    );

    // Concurrent execution of SAM 3 Vision and Muse Glimmer OCR
    const [visionResult, ocrResult] = await Promise.all([
      this.visionService.analyzeTruckImage({
        image: dto.truckImage,
        truckLicensePlate: dto.truckLicensePlate,
      }),
      this.ocrService.parseDispatchGuide({
        image: dto.dispatchGuideImage,
        expectedSupplierRut: dto.supplierRut,
      }),
    ]);

    const differenceBins = visionResult.totalBins - ocrResult.declaredBins;
    const isMatched = differenceBins === 0;

    const status = isMatched
      ? ReceptionStatus.APPROVED
      : ReceptionStatus.FLAGGED_FOR_REVIEW;

    const receptionId = `REC-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(
      1000 + Math.random() * 9000,
    )}`;

    const reason = isMatched
      ? `Exact match: ${visionResult.totalBins} physical bins counted by SAM 3 == ${ocrResult.declaredBins} declared in guide ${ocrResult.documentId}.`
      : `Discrepancy detected: ${visionResult.totalBins} physical bins counted by SAM 3 != ${ocrResult.declaredBins} declared in guide ${ocrResult.documentId} (Difference: ${differenceBins > 0 ? '+' : ''}${differenceBins} bins).`;

    const summary = isMatched
      ? 'Physical truck bins match declared dispatch guide perfectly. Automatic intake approved for ERP.'
      : 'Discrepancy detected between physical truck tally and declared guide. Flagged for supervisor manual review.';

    // Register transaction into the in-memory ERP database for immediate RAG availability
    this.mockDbService.recordNewDelivery(ocrResult.supplierRut, {
      receptionId,
      deliveryDate: new Date().toISOString().slice(0, 10),
      dispatchGuideNumber: ocrResult.documentId,
      cropType: ocrResult.cropType,
      declaredBins: ocrResult.declaredBins,
      countedBins: visionResult.totalBins,
      declaredKilos: ocrResult.declaredKilos,
      status: isMatched ? 'APPROVED' : 'FLAGGED_FOR_REVIEW',
      isLiquidated: false,
    });

    const totalProcessingTimeMs = Date.now() - startTime;
    this.logger.log(
      `Reception [${receptionId}] processed in ${totalProcessingTimeMs}ms with outcome [${status}]. Reason: ${reason}`,
    );

    return {
      receptionId,
      timestamp: new Date().toISOString(),
      status,
      summary,
      visionAnalysis: {
        totalBins: visionResult.totalBins,
        totalPallets: visionResult.totalPallets,
        confidenceScore: visionResult.confidenceScore,
        processingTimeMs: visionResult.processingTimeMs,
        provider: visionResult.provider,
      },
      ocrExtraction: {
        documentId: ocrResult.documentId,
        supplierRut: ocrResult.supplierRut,
        supplierName: ocrResult.supplierName,
        declaredBins: ocrResult.declaredBins,
        declaredKilos: ocrResult.declaredKilos,
        cropType: ocrResult.cropType,
        isLegible: ocrResult.isLegible,
        confidenceScore: ocrResult.confidenceScore,
        processingTimeMs: ocrResult.processingTimeMs,
        provider: ocrResult.provider,
      },
      reconciliation: {
        isMatched,
        differenceBins,
        reason,
      },
      totalProcessingTimeMs,
    };
  }
}
