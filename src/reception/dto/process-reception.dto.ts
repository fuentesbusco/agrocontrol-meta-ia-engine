import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ProcessReceptionDto {
  @ApiProperty({
    example: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1200&q=80',
    description: 'Image URL or Base64 string of the arriving loaded truck in the reception yard',
  })
  @IsString()
  @IsNotEmpty()
  truckImage: string;

  @ApiProperty({
    example: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=1200&q=80',
    description: 'Image URL or Base64 string of the handwritten field dispatch guide (Guía de Despacho)',
  })
  @IsString()
  @IsNotEmpty()
  dispatchGuideImage: string;

  @ApiPropertyOptional({
    example: 'YARD-CURICO-01',
    description: 'Unique identifier of the receiving plant or reception yard',
    default: 'YARD-CURICO-01',
  })
  @IsString()
  @IsOptional()
  yardId?: string = 'YARD-CURICO-01';

  @ApiPropertyOptional({
    example: 'JD-8941',
    description: 'Truck license plate for traceability',
  })
  @IsString()
  @IsOptional()
  truckLicensePlate?: string;

  @ApiPropertyOptional({
    example: '76.492.103-8',
    description: 'Supplier Tax ID (RUT) if pre-scanned from RFID or gate QR code',
  })
  @IsString()
  @IsOptional()
  supplierRut?: string;

  @ApiPropertyOptional({
    example: 'FULL_RECONCILIATION',
    description: 'Operation mode: FULL_RECONCILIATION, VALIDATE_FRUIT, or VALIDATE_QUANTITY',
    enum: ['FULL_RECONCILIATION', 'VALIDATE_FRUIT', 'VALIDATE_QUANTITY'],
    default: 'FULL_RECONCILIATION',
  })
  @IsString()
  @IsOptional()
  validationMode?: 'FULL_RECONCILIATION' | 'VALIDATE_FRUIT' | 'VALIDATE_QUANTITY' = 'FULL_RECONCILIATION';
}
