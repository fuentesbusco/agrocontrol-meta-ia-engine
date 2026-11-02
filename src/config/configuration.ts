import { AiProvider } from '../common/enums/ai-provider.enum';

export interface ProviderEndpointConfig {
  apiKey: string;
  baseUrl: string;
  visionEndpoint: string;
  ocrEndpoint: string;
  agentEndpoint: string;
}

export interface ModalProviderConfig {
  apiKey: string;
  visionUrl: string;
  ocrUrl: string;
  agentUrl: string;
}

export interface FireworksProviderConfig {
  apiKey: string;
  baseUrl: string;
  visionModel: string;
  ocrModel: string;
  agentModel: string;
}

export interface ImageOptimizationConfig {
  maxWidthPx: number;
  jpegQuality: number;
}

export interface AiResilienceConfig {
  timeoutMs: number;
  maxRetries: number;
  retryDelayMs: number;
}

export interface AppConfiguration {
  port: number;
  nodeEnv: string;
  ai: {
    primaryProvider: AiProvider;
    fallbackProviders: AiProvider[];
    routing: {
      visionProvider: AiProvider;
      ocrProvider: AiProvider;
      agentProvider: AiProvider;
    };
    imageOptimization: ImageOptimizationConfig;
    resilience: AiResilienceConfig;
    meta: ProviderEndpointConfig;
    modal: ModalProviderConfig;
    fireworks: FireworksProviderConfig;
  };
}

export default (): AppConfiguration => {
  const fallbackStr = process.env.AI_PROVIDER_FALLBACKS || 'fireworks,mock';
  const fallbackProviders = fallbackStr
    .split(',')
    .map((item) => item.trim() as AiProvider)
    .filter((provider) => Object.values(AiProvider).includes(provider));

  return {
    port: parseInt(process.env.PORT ?? '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    ai: {
      primaryProvider: (process.env.AI_PROVIDER_PRIMARY as AiProvider) || AiProvider.MODAL,
      fallbackProviders,
      routing: {
        visionProvider: (process.env.AI_VISION_PROVIDER as AiProvider) || AiProvider.MODAL,
        ocrProvider: (process.env.AI_OCR_PROVIDER as AiProvider) || AiProvider.MODAL,
        agentProvider: (process.env.AI_AGENT_PROVIDER as AiProvider) || AiProvider.FIREWORKS,
      },
      imageOptimization: {
        maxWidthPx: parseInt(process.env.IMAGE_MAX_WIDTH_PX ?? '1280', 10),
        jpegQuality: parseInt(process.env.IMAGE_JPEG_QUALITY ?? '80', 10),
      },
      resilience: {
        timeoutMs: parseInt(process.env.AI_REQUEST_TIMEOUT_MS ?? '20000', 10),
        maxRetries: parseInt(process.env.AI_MAX_RETRIES ?? '2', 10),
        retryDelayMs: parseInt(process.env.AI_RETRY_DELAY_MS ?? '1000', 10),
      },
      meta: {
        apiKey: process.env.META_API_KEY || '',
        baseUrl: process.env.META_API_URL || 'https://api.meta.ai/v1',
        visionEndpoint: process.env.META_VISION_ENDPOINT || '/sam3/predict',
        ocrEndpoint: process.env.META_OCR_ENDPOINT || '/glimmer/extract',
        agentEndpoint: process.env.META_AGENT_ENDPOINT || '/spark/chat',
      },
      modal: {
        apiKey: process.env.MODAL_API_KEY || '',
        visionUrl:
          process.env.MODAL_VISION_URL ||
          'https://agrocontrol-meta-ai-engine--agrocontrol-multimodal-sam3-predict.us-east.modal.run',
        ocrUrl:
          process.env.MODAL_OCR_URL ||
          'https://agrocontrol-meta-ai-engine--agrocontrol-multimodal-glimm-66f1ce.us-east.modal.run',
        agentUrl:
          process.env.MODAL_AGENT_URL ||
          'https://agrocontrol-meta-ai-engine--agrocontrol-multimodal-spark-agent.us-east.modal.run',
      },
      fireworks: {
        apiKey: process.env.FIREWORKS_API_KEY || '',
        baseUrl: process.env.FIREWORKS_BASE_URL || 'https://api.fireworks.ai/inference/v1',
        visionModel: process.env.FIREWORKS_VISION_MODEL || 'accounts/fireworks/models/sam-3-vision',
        ocrModel: process.env.FIREWORKS_OCR_MODEL || 'accounts/fireworks/models/muse-glimmer-v1',
        agentModel:
          process.env.FIREWORKS_AGENT_MODEL ||
          'accounts/fireworks/models/llama-v3p1-8b-instruct',
      },
    },
  };
};
