import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ChatHistoryItemDto {
  @ApiProperty({ example: 'user', enum: ['user', 'assistant'] })
  @IsString()
  role: 'user' | 'assistant';

  @ApiProperty({ example: '¿Me liquidaron los 18 bins?' })
  @IsString()
  content: string;
}

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

  @ApiPropertyOptional({
    description: 'Optional recent chat history for multi-turn conversation context',
    type: [ChatHistoryItemDto],
  })
  @IsArray()
  @IsOptional()
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
}
