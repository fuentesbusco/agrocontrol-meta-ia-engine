import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReceptionStatus } from '../../common/enums/ai-provider.enum';

export class VisionAnalysisDto {
  @ApiProperty({ example: 18, description: 'Total wooden fruit bins segmented by SAM 3' })
  totalBins: number;

  @ApiProperty({ example: 2, description: 'Total wooden pallets detected' })
  totalPallets: number;

  @ApiPropertyOptional({
    example: 'Cerezas Lapins de Exportación',
    description: 'Fruit species visually detected by computer vision',
  })
  cropDetected?: string;

  @ApiProperty({ example: 0.98, description: 'Computer vision confidence score' })
  confidenceScore: number;

  @ApiProperty({ example: 125, description: 'Processing time in milliseconds' })
  processingTimeMs: number;

  @ApiProperty({ example: 'meta-sam3', description: 'Provider that resolved the vision request' })
  provider: string;
}

export class OcrExtractionDto {
  @ApiProperty({ example: 'GD-89412', description: 'Extracted field guide folio / number' })
  documentId: string;

  @ApiProperty({ example: '76.492.103-8', description: 'Chilean Supplier RUT' })
  supplierRut: string;

  @ApiProperty({ example: 'Agrícola Los Nogales SpA', description: 'Identified supplier or grower name' })
  supplierName: string;

  @ApiProperty({ example: 18, description: 'Bins declared by farmer in handwritten guide' })
  declaredBins: number;

  @ApiProperty({ example: 7200, description: 'Total declared weight in kilograms' })
  declaredKilos: number;

  @ApiProperty({ example: 'Royal Dawn Cherries', description: 'Extracted fruit or crop variety' })
  cropType: string;

  @ApiProperty({ example: true, description: 'Whether handwritten document was decipherable' })
  isLegible: boolean;

  @ApiProperty({ example: 0.96, description: 'Extraction confidence score' })
  confidenceScore: number;

  @ApiProperty({ example: 180, description: 'Extraction latency in milliseconds' })
  processingTimeMs: number;

  @ApiProperty({ example: 'meta-muse-glimmer', description: 'Provider resolving OCR extraction' })
  provider: string;
}

export class ReconciliationDiscrepancyDto {
  @ApiProperty({ example: true, description: 'Whether physical count matches declared guide' })
  isMatched: boolean;

  @ApiProperty({ example: 0, description: 'Difference between counted bins and declared bins' })
  differenceBins: number;

  @ApiProperty({
    example: 'Exact match: 18 counted bins == 18 declared bins.',
    description: 'Executive explanation of the reconciliation outcome',
  })
  reason: string;
}

export class ProcessReceptionResponseDto {
  @ApiProperty({ example: 'REC-2026-1028-0914', description: 'Generated transaction reception ID' })
  receptionId: string;

  @ApiProperty({ example: '2026-10-28T03:00:00.000Z', description: 'ISO timestamp of reconciliation' })
  timestamp: string;

  @ApiProperty({
    enum: ReceptionStatus,
    example: ReceptionStatus.APPROVED,
    description: 'Outcome status for ERP automated intake',
  })
  status: ReceptionStatus;

  @ApiProperty({
    example: 'Physical truck bins match declared dispatch guide perfectly. Automatic intake approved for ERP.',
    description: 'Human-readable summary of the reconciliation result',
  })
  summary: string;

  @ApiProperty({ type: () => VisionAnalysisDto })
  visionAnalysis: VisionAnalysisDto;

  @ApiProperty({ type: () => OcrExtractionDto })
  ocrExtraction: OcrExtractionDto;

  @ApiProperty({ type: () => ReconciliationDiscrepancyDto })
  reconciliation: ReconciliationDiscrepancyDto;

  @ApiProperty({ example: 215, description: 'Total end-to-end processing latency in milliseconds' })
  totalProcessingTimeMs: number;

  @ApiPropertyOptional({ example: false, description: 'Whether the response was served from cache' })
  fromCache?: boolean;

  @ApiPropertyOptional({ example: 'FULL_RECONCILIATION', description: 'Executed validation mode' })
  validationMode?: string;
}
