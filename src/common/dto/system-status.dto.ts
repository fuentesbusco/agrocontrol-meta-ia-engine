import { ApiProperty } from '@nestjs/swagger';

export class AiOrchestrationStatusDto {
  @ApiProperty({ example: 'meta', description: 'Currently active primary AI provider' })
  primaryProvider: string;

  @ApiProperty({
    example: ['modal', 'fireworks', 'mock'],
    description: 'Ordered list of fallback providers if primary fails',
  })
  fallbackProviders: string[];

  @ApiProperty({ example: 15000, description: 'Request timeout in milliseconds' })
  timeoutMs: number;

  @ApiProperty({ example: 2, description: 'Maximum retry attempts per provider' })
  maxRetries: number;

  @ApiProperty({ example: true, description: 'Indicates if Meta API credentials are set' })
  hasMetaKey: boolean;

  @ApiProperty({ example: true, description: 'Indicates if Modal credentials are set' })
  hasModalKey: boolean;

  @ApiProperty({ example: true, description: 'Indicates if Fireworks credentials are set' })
  hasFireworksKey: boolean;
}

export class SystemStatusDto {
  @ApiProperty({ example: 'AgroControl Multimodal Engine' })
  name: string;

  @ApiProperty({ example: '1.0.0' })
  version: string;

  @ApiProperty({ example: 'OPERATIONAL' })
  status: string;

  @ApiProperty({ example: '2026-10-28T02:50:00.000Z' })
  timestamp: string;

  @ApiProperty({ example: 'development' })
  environment: string;

  @ApiProperty({ type: () => AiOrchestrationStatusDto })
  aiOrchestration: AiOrchestrationStatusDto;
}
