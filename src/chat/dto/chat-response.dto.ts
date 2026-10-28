import { ApiProperty } from '@nestjs/swagger';

export class DeliverySummaryDto {
  @ApiProperty({ example: 'REC-2026-1020', description: 'Reception ID' })
  receptionId: string;

  @ApiProperty({ example: '2026-10-20', description: 'Delivery date' })
  deliveryDate: string;

  @ApiProperty({ example: 'GD-89412', description: 'Folio of dispatch guide' })
  dispatchGuideNumber: string;

  @ApiProperty({ example: 'Royal Dawn Cherries (Cerezas)', description: 'Crop variety' })
  cropType: string;

  @ApiProperty({ example: 18, description: 'Declared bins' })
  declaredBins: number;

  @ApiProperty({ example: 18, description: 'Physically counted bins' })
  countedBins: number;

  @ApiProperty({ example: 'APPROVED', description: 'Status in yard' })
  status: string;

  @ApiProperty({ example: true, description: 'Whether settlement has occurred' })
  isLiquidated: boolean;

  @ApiProperty({ example: 18450000, description: 'Net amount in Chilean pesos', required: false })
  paymentAmountClp?: number;
}

export class ChatResponseDto {
  @ApiProperty({
    example:
      'Estimado Don Carlos: sí, su entrega del martes (Guía GD-89412, 18 bins de Cerezas Royal Dawn) se encuentra APROBADA y LIQUIDADA por un monto de $18.450.000 CLP.',
    description: 'Empathetic and factual natural language response from Muse Spark',
  })
  response: string;

  @ApiProperty({
    example: 'PAYMENT_STATUS',
    description: 'Detected conversational intent',
  })
  intent: string;

  @ApiProperty({
    example: 3,
    description: 'Number of verified delivery records injected into prompt',
  })
  groundedDeliveriesCount: number;

  @ApiProperty({
    example: 'meta-muse-spark',
    description: 'AI provider that generated the response',
  })
  provider: string;

  @ApiProperty({
    type: [DeliverySummaryDto],
    description: 'Relevant delivery records referenced in the answer',
  })
  referencedDeliveries: DeliverySummaryDto[];

  @ApiProperty({
    example: '2026-10-28T03:00:00.000Z',
    description: 'Response timestamp',
  })
  timestamp: string;
}
