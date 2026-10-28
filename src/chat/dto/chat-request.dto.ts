import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ChatRequestDto {
  @ApiProperty({
    example: '¿Me liquidaron los 18 bins de la entrega del martes?',
    description: 'Natural language query from the farmer or producer',
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiPropertyOptional({
    example: 'FARMER-76492',
    description: 'Farmer or supplier ID / RUT to ground context from ERP',
    default: 'FARMER-76492',
  })
  @IsString()
  @IsOptional()
  farmerId?: string = 'FARMER-76492';
}
