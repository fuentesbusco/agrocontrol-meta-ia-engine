import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  validateSync,
} from 'class-validator';
import { AiProvider } from '../common/enums/ai-provider.enum';

export class EnvironmentVariables {
  @IsNumber()
  @IsOptional()
  PORT: number = 3000;

  @IsString()
  @IsOptional()
  NODE_ENV: string = 'development';

  @IsEnum(AiProvider)
  @IsOptional()
  AI_PROVIDER_PRIMARY: AiProvider = AiProvider.META;

  @IsString()
  @IsOptional()
  AI_PROVIDER_FALLBACKS: string = 'modal,fireworks,mock';

  @IsNumber()
  @IsOptional()
  AI_REQUEST_TIMEOUT_MS: number = 15000;

  @IsNumber()
  @IsOptional()
  AI_MAX_RETRIES: number = 2;

  @IsNumber()
  @IsOptional()
  AI_RETRY_DELAY_MS: number = 1000;

  // Meta Official API
  @IsString()
  @IsOptional()
  META_API_KEY: string = '';

  @IsString()
  @IsOptional()
  META_API_URL: string = 'https://api.meta.ai/v1';

  @IsString()
  @IsOptional()
  META_VISION_ENDPOINT: string = '/responses';

  @IsString()
  @IsOptional()
  META_OCR_ENDPOINT: string = '/responses';

  @IsString()
  @IsOptional()
  META_AGENT_ENDPOINT: string = '/responses';

  // Modal Endpoints
  @IsString()
  @IsOptional()
  MODAL_API_KEY: string = '';

  @IsString()
  @IsOptional()
  MODAL_VISION_URL: string =
    'https://agrocontrol-meta-ai-engine--agrocontrol-multimodal-sam3-predict.us-east.modal.run';

  @IsString()
  @IsOptional()
  MODAL_OCR_URL: string =
    'https://agrocontrol-meta-ai-engine--agrocontrol-multimodal-glimm-66f1ce.us-east.modal.run';

  @IsString()
  @IsOptional()
  MODAL_AGENT_URL: string =
    'https://agrocontrol-meta-ai-engine--agrocontrol-multimodal-spark-agent.us-east.modal.run';

  // Fireworks Serverless Inference
  @IsString()
  @IsOptional()
  FIREWORKS_API_KEY: string = '';

  @IsString()
  @IsOptional()
  FIREWORKS_BASE_URL: string = 'https://api.fireworks.ai/inference/v1';

  @IsString()
  @IsOptional()
  FIREWORKS_VISION_MODEL: string = 'accounts/fireworks/models/sam-3-vision';

  @IsString()
  @IsOptional()
  FIREWORKS_OCR_MODEL: string = 'accounts/fireworks/models/muse-glimmer-v1';

  @IsString()
  @IsOptional()
  FIREWORKS_AGENT_MODEL: string = 'accounts/fireworks/models/muse-spark-open';
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(`Config validation error: ${errors.toString()}`);
  }

  return validatedConfig;
}
