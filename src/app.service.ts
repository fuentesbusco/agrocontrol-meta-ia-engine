import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SystemStatusDto } from './common/dto/system-status.dto';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}

  getSystemStatus(): SystemStatusDto {
    const aiConfig = this.configService.get('ai');
    return {
      name: 'AgroControl Multimodal Engine',
      version: '1.0.0',
      status: 'OPERATIONAL',
      timestamp: new Date().toISOString(),
      environment: this.configService.get<string>('nodeEnv') || 'development',
      aiOrchestration: {
        primaryProvider: aiConfig?.primaryProvider || 'meta',
        fallbackProviders: aiConfig?.fallbackProviders || [],
        timeoutMs: aiConfig?.resilience?.timeoutMs || 15000,
        maxRetries: aiConfig?.resilience?.maxRetries || 2,
        hasMetaKey: Boolean(aiConfig?.meta?.apiKey),
        hasModalKey: Boolean(aiConfig?.modal?.apiKey),
        hasFireworksKey: Boolean(aiConfig?.fireworks?.apiKey),
      },
    };
  }
}
