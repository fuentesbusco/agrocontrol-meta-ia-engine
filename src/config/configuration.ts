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
    resilience: AiResilienceConfig;
    meta: ProviderEndpointConfig;
    modal: ModalProviderConfig;
    fireworks: FireworksProviderConfig;
  };
}

export default (): AppConfiguration => {
  const fallbackStr = process.env.AI_PROVIDER_FALLBACKS || 'modal,fireworks,mock';
  const fallbackProviders = fallbackStr
    .split(',')
    .map((item) => item.trim() as AiProvider)
    .filter((provider) => Object.values(AiProvider).includes(provider));

  return {
    port: parseInt(process.env.PORT ?? '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    ai: {
      primaryProvider: (process.env.AI_PROVIDER_PRIMARY as AiProvider) || AiProvider.META,
      fallbackProviders,
      resilience: {
        timeoutMs: parseInt(process.env.AI_REQUEST_TIMEOUT_MS ?? '15000', 10),
        maxRetries: parseInt(process.env.AI_MAX_RETRIES ?? '2', 10),
        retryDelayMs: parseInt(process.env.AI_RETRY_DELAY_MS ?? '1000', 10),
      },
      meta: {
        apiKey: process.env.META_API_KEY || '',
        baseUrl: process.env.META_API_URL || 'https://graph.facebook.com/v21.0',
        visionEndpoint: process.env.META_VISION_ENDPOINT || '/sam3/predict',
        ocrEndpoint: process.env.META_OCR_ENDPOINT || '/glimmer/extract',
        agentEndpoint: process.env.META_AGENT_ENDPOINT || '/spark/chat',
      },
      modal: {
        apiKey: process.env.MODAL_API_KEY || '',
        visionUrl:
          process.env.MODAL_VISION_URL ||
          'https://atelierbusco--agrocontrol-sam3-predict.modal.run',
        ocrUrl:
          process.env.MODAL_OCR_URL ||
          'https://atelierbusco--agrocontrol-glimmer-extract.modal.run',
        agentUrl:
          process.env.MODAL_AGENT_URL ||
          'https://atelierbusco--agrocontrol-spark-agent.modal.run',
      },
      fireworks: {
        apiKey: process.env.FIREWORKS_API_KEY || '',
        baseUrl:
          process.env.FIREWORKS_BASE_URL ||
          'https://api.fireworks.ai/inference/v1',
        visionModel:
          process.env.FIREWORKS_VISION_MODEL ||
          'accounts/fireworks/models/sam-3-vision',
        ocrModel:
          process.env.FIREWORKS_OCR_MODEL ||
          'accounts/fireworks/models/muse-glimmer-v1',
        agentModel:
          process.env.FIREWORKS_AGENT_MODEL ||
          'accounts/fireworks/models/muse-spark-8b-instruct',
      },
    },
  };
};
