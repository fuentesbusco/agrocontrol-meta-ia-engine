import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { VisionService } from '../ai/services/vision.service';
import { OcrService } from '../ai/services/ocr.service';
import { MockDbService } from '../database/mock-db.service';
import { ReceptionStatus } from '../common/enums/ai-provider.enum';
import { ProcessReceptionDto } from './dto/process-reception.dto';
import { ProcessReceptionResponseDto } from './dto/reception-response.dto';

interface CacheEntry {
  data: ProcessReceptionResponseDto;
  expiresAt: number;
}

@Injectable()
export class ReceptionService {
  private readonly logger = new Logger(ReceptionService.name);

  // In-memory LRU cache to prevent re-calling serverless inference on identical assets
  private readonly memoryCache = new Map<string, CacheEntry>();
  private readonly CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes TTL

  constructor(
    private readonly visionService: VisionService,
    private readonly ocrService: OcrService,
    private readonly mockDbService: MockDbService,
  ) {}

  async processIncomingReception(
    dto: ProcessReceptionDto,
  ): Promise<ProcessReceptionResponseDto> {
    const startTime = Date.now();
    const mode = dto.validationMode || 'FULL_RECONCILIATION';

    // 1. Generate Cache Key from mode and image signatures
    const cacheKey = this.generateCacheKey(dto);
    const cached = this.memoryCache.get(cacheKey);

    if (cached && cached.expiresAt > Date.now()) {
      this.logger.log(`Serving reception from memory cache for mode [${mode}] (Key: ${cacheKey.slice(0, 12)}...)`);
      return {
        ...cached.data,
        fromCache: true,
        totalProcessingTimeMs: Math.max(8, Date.now() - startTime),
      };
    }

    this.logger.log(
      `Starting multimodal validation mode: [${mode}]. Truck license: ${dto.truckLicensePlate ?? 'N/A'}`,
    );

    // 2. Concurrent execution of SAM 3 Vision and Muse Glimmer OCR
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

    // 3. Mode-specific Reconciliation Logic
    const rawDiff = visionResult.totalBins - ocrResult.declaredBins;
    const absDifference = Math.abs(rawDiff);
    let isMatched = false;
    let status = ReceptionStatus.FLAGGED_FOR_REVIEW;
    let reason = '';
    let summary = '';

    const detectedCrop = visionResult.cropDetected || 'Cerezas Lapins (Exportación)';
    const declaredCrop = ocrResult.cropType || 'Cerezas Lapins';

    const isAppleVision =
      detectedCrop.toLowerCase().includes('manzana') ||
      detectedCrop.toLowerCase().includes('apple') ||
      detectedCrop.toLowerCase().includes('incompatible') ||
      detectedCrop.toLowerCase().includes('no corresponde');

    const isCherryVision =
      !isAppleVision &&
      (detectedCrop.toLowerCase().includes('cereza') || detectedCrop.toLowerCase().includes('cherr'));

    const isCherryOcr =
      declaredCrop.toLowerCase().includes('cereza') || declaredCrop.toLowerCase().includes('cherr');
    const fruitSpeciesMatches = isCherryVision && isCherryOcr;

    if (mode === 'VALIDATE_FRUIT') {
      // Compares detected fruit species against declared guide
      isMatched = fruitSpeciesMatches && ocrResult.isLegible;
      status = isMatched ? ReceptionStatus.APPROVED : ReceptionStatus.FLAGGED_FOR_REVIEW;
      reason = isMatched
        ? `Variedad validada exitosamente: Fruta física identificada como [${detectedCrop}] coincidente con guía [${declaredCrop}].`
        : `Discrepancia crítica de especie: Fruta física detectada [${detectedCrop}] no coincide con lo declarado en la guía [${declaredCrop}]. Posible error de huerto o fraude de carga.`;
      summary = isMatched
        ? 'Inspección de especie y calidad de fruta aprobada para recepción.'
        : `Alerta de variedad: Especie física (${detectedCrop}) no coincide con lo declarado en guía de campo (${declaredCrop}).`;
    } else if (mode === 'VALIDATE_QUANTITY') {
      // Compares physical bin tally and estimated weight (approx 400kg/bin)
      // Check species integrity first: if species is incompatible, immediately alert fraud
      if (!fruitSpeciesMatches) {
        isMatched = false;
        status = ReceptionStatus.FLAGGED_FOR_REVIEW;
        reason = `Discrepancia crítica de especie: Fruta física detectada [${detectedCrop}] no coincide con lo declarado en la guía [${declaredCrop}]. Posible error de huerto o fraude de carga.`;
        summary = `Alerta de variedad: Especie física (${detectedCrop}) no coincide con lo declarado en guía de campo (${declaredCrop}).`;
      } else {
        const estimatedWeightKilos = visionResult.totalBins * 400;
        const weightDifference = Math.abs(estimatedWeightKilos - ocrResult.declaredKilos);
        const binsMatch = rawDiff === 0;

        isMatched = binsMatch || weightDifference < 800;
        status = isMatched ? ReceptionStatus.APPROVED : ReceptionStatus.FLAGGED_FOR_REVIEW;
        reason = binsMatch
          ? `Cantidad validada: ${visionResult.totalBins} bins físicos coinciden con ${ocrResult.declaredBins} declarados (Peso est: ${estimatedWeightKilos} kg vs ${ocrResult.declaredKilos} kg).`
          : `Discrepancia en cantidad: ${visionResult.totalBins} bins contados vs ${ocrResult.declaredBins} declarados (Diferencia: ${absDifference} bins).`;
        summary = isMatched
          ? 'Validación física de peso y bins aprobada para báscula.'
          : 'Discrepancia de peso o conteo de bins detectada en patio.';
      }
    } else {
      // FULL_RECONCILIATION: Complete cross-validation (Both bin count AND species must match)
      if (!fruitSpeciesMatches) {
        isMatched = false;
        status = ReceptionStatus.FLAGGED_FOR_REVIEW;
        reason = `Discrepancia crítica de especie: La visión artificial detectó [${detectedCrop}] en el camión, lo cual NO coincide con la guía que declara [${declaredCrop}]. Recepción detenida por inconsistencia de cultivo.`;
        summary = `Alerta de especie o fraude en patio: Fruta física (${detectedCrop}) no coincide con guía (${declaredCrop}).`;
      } else {
        isMatched = rawDiff === 0;
        status = isMatched ? ReceptionStatus.APPROVED : ReceptionStatus.FLAGGED_FOR_REVIEW;
        reason = isMatched
          ? `Exact match: ${visionResult.totalBins} physical bins counted by SAM 3 == ${ocrResult.declaredBins} declared in guide ${ocrResult.documentId} (Especie: ${detectedCrop}).`
          : `Discrepancy detected: ${visionResult.totalBins} physical bins counted by SAM 3 != ${ocrResult.declaredBins} declared in guide ${ocrResult.documentId} (Difference: ${absDifference} bins).`;
        summary = isMatched
          ? `Conteo físico de ${visionResult.totalBins} bins aprobado para báscula. Nota agronómica: Certificación definitiva de variedad (${declaredCrop}) sujeta a muestreo en mesa de calidad.`
          : `Discrepancy detected between physical truck tally and declared guide. Flagged for supervisor manual review.`;
      }
    }

    const receptionId = `REC-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(
      1000 + Math.random() * 9000,
    )}`;

    // Register transaction into in-memory ERP database for immediate RAG grounding
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

    const responseResult: ProcessReceptionResponseDto = {
      receptionId,
      timestamp: new Date().toISOString(),
      status,
      summary,
      visionAnalysis: {
        totalBins: visionResult.totalBins,
        totalPallets: visionResult.totalPallets,
        cropDetected: detectedCrop,
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
        differenceBins: rawDiff,
        reason,
      },
      totalProcessingTimeMs,
      fromCache: false,
      validationMode: mode,
    };

    // Store in cache
    this.memoryCache.set(cacheKey, {
      data: responseResult,
      expiresAt: Date.now() + this.CACHE_TTL_MS,
    });

    return responseResult;
  }

  private generateCacheKey(dto: ProcessReceptionDto): string {
    const hash = crypto.createHash('sha256');
    hash.update(dto.validationMode || 'FULL_RECONCILIATION');
    hash.update(dto.truckLicensePlate || '');
    hash.update(dto.truckImage.slice(0, 256));
    hash.update(dto.dispatchGuideImage.slice(0, 256));
    return hash.digest('hex');
  }
}
