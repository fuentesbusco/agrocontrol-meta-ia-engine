import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AiProvider } from '../../common/enums/ai-provider.enum';
import { MockDbService } from '../../database/mock-db.service';
import {
  AgentChatInput,
  AgentChatResult,
  FarmerContext,
} from '../interfaces/ai-contracts.interface';

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly mockDbService: MockDbService,
  ) {}

  async processFarmerQuery(input: AgentChatInput): Promise<AgentChatResult> {
    const aiConfig = this.configService.get('ai');
    const primary = (aiConfig?.primaryProvider as AiProvider) || AiProvider.META;
    const fallbacks: AiProvider[] = aiConfig?.fallbackProviders || [
      AiProvider.MODAL,
      AiProvider.FIREWORKS,
      AiProvider.MOCK,
    ];

    const providerSequence: AiProvider[] = [
      primary,
      ...fallbacks.filter((p) => p !== primary),
    ];

    // Fetch verified context from database
    const context =
      this.mockDbService.getFarmerContext(input.farmerId) ||
      this.mockDbService.getFarmerContext('FARMER-76492'); // Default fallback to primary demo farmer

    const startTime = Date.now();
    let lastError: Error | null = null;

    for (const provider of providerSequence) {
      try {
        this.logger.log(`Attempting Muse Spark conversational agent query via: [${provider}]`);
        const result = await this.executeProviderChat(provider, input, context, startTime);
        if (result) {
          this.logger.log(
            `Agent response generated via [${provider}]. Intent: ${result.intent}, Deliveries referenced: ${result.groundedDeliveriesCount}`,
          );
          return result;
        }
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        this.logger.warn(
          `Provider [${provider}] failed for Muse Spark agent: ${lastError.message}. Escalating to next fallback...`,
        );
      }
    }

    return this.generateMockAgentResult(input, context, startTime, 'mock-emergency');
  }

  private async executeProviderChat(
    provider: AiProvider,
    input: AgentChatInput,
    context: FarmerContext | null,
    startTime: number,
  ): Promise<AgentChatResult | null> {
    const aiConfig = this.configService.get('ai');
    const timeout = aiConfig?.resilience?.timeoutMs || 15000;

    const systemPrompt = this.buildSystemPrompt(context);

    switch (provider) {
      case AiProvider.META: {
        const metaConfig = aiConfig?.meta;
        if (!metaConfig?.apiKey) {
          throw new Error('Meta API credentials not configured');
        }
        const url = `${metaConfig.baseUrl}${metaConfig.agentEndpoint}`;
        const response = await firstValueFrom(
          this.httpService.post(
            url,
            {
              model: 'muse-spark-8b-instruct',
              system_prompt: systemPrompt,
              message: input.userMessage,
            },
            {
              headers: {
                Authorization: `Bearer ${metaConfig.apiKey}`,
                'Content-Type': 'application/json',
              },
              timeout,
            },
          ),
        );
        const data = response.data;
        return {
          agentResponse: data.agentResponse || data.message || data.reply,
          intent: this.detectIntent(input.userMessage),
          groundedDeliveriesCount: context?.deliveries.length || 0,
          provider: 'meta-muse-spark',
          referencedDeliveries: context?.deliveries || [],
        };
      }

      case AiProvider.MODAL: {
        const modalConfig = aiConfig?.modal;
        if (!modalConfig?.apiKey && !modalConfig?.agentUrl) {
          throw new Error('Modal Agent endpoints not configured');
        }
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (modalConfig?.apiKey) {
          headers['Authorization'] = `Bearer ${modalConfig.apiKey}`;
        }
        const response = await firstValueFrom(
          this.httpService.post(
            modalConfig.agentUrl,
            {
              systemPrompt,
              userMessage: input.userMessage,
              farmerId: input.farmerId,
            },
            { headers, timeout },
          ),
        );
        return {
          agentResponse: response.data.agentResponse || response.data.reply,
          intent: response.data.intent || this.detectIntent(input.userMessage),
          groundedDeliveriesCount: context?.deliveries.length || 0,
          provider: 'modal-muse-spark',
          referencedDeliveries: context?.deliveries || [],
        };
      }

      case AiProvider.FIREWORKS: {
        const fireworksConfig = aiConfig?.fireworks;
        if (!fireworksConfig?.apiKey) {
          throw new Error('Fireworks API key not configured');
        }
        const url = `${fireworksConfig.baseUrl}/chat/completions`;
        const response = await firstValueFrom(
          this.httpService.post(
            url,
            {
              model: fireworksConfig.agentModel,
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: input.userMessage },
              ],
              temperature: 0.2,
            },
            {
              headers: {
                Authorization: `Bearer ${fireworksConfig.apiKey}`,
                'Content-Type': 'application/json',
              },
              timeout,
            },
          ),
        );
        const reply = response.data.choices[0].message.content;
        return {
          agentResponse: reply,
          intent: this.detectIntent(input.userMessage),
          groundedDeliveriesCount: context?.deliveries.length || 0,
          provider: 'fireworks-muse-spark',
          referencedDeliveries: context?.deliveries || [],
        };
      }

      case AiProvider.MOCK:
      default:
        return this.generateMockAgentResult(input, context, startTime, 'mock-muse-spark');
    }
  }

  private buildSystemPrompt(context: FarmerContext | null): string {
    const deliveriesJson = JSON.stringify(context?.deliveries ?? [], null, 2);
    return `You are Muse Spark, an expert B2B AI operational and financial assistant for agricultural growers delivering fruit to AgroControl packing facilities.
You must speak in professional, warm Chilean agricultural Spanish (e.g., "Don Carlos", "Estimado productor").
CRITICAL RULE: Rely EXCLUSIVELY on the verified database records below. Do not invent any numbers, dates, or payment details. If information is not in the records, state so clearly and offer to notify yard administration.

VERIFIED PRODUCER CONTEXT:
- Name: ${context?.farmerName ?? 'Agrícola Los Nogales SpA'}
- RUT: ${context?.farmerRut ?? '76.492.103-8'}
- Location: ${context?.farmLocation ?? 'Curicó, Región del Maule'}
- Recent Deliveries & Payment Status:
${deliveriesJson}
`;
  }

  private detectIntent(
    message: string,
  ): 'PAYMENT_STATUS' | 'DELIVERY_CONFIRMATION' | 'QUALITY_DISPUTE' | 'GENERAL_INQUIRY' {
    const lower = message.toLowerCase();
    if (
      lower.includes('pago') ||
      lower.includes('liquid') ||
      lower.includes('plata') ||
      lower.includes('cuándo me pagan') ||
      lower.includes('cuanto') ||
      lower.includes('transferencia')
    ) {
      return 'PAYMENT_STATUS';
    }
    if (
      lower.includes('entrega') ||
      lower.includes('bins') ||
      lower.includes('martes') ||
      lower.includes('llegó') ||
      lower.includes('camion') ||
      lower.includes('recepción') ||
      lower.includes('guía')
    ) {
      return 'DELIVERY_CONFIRMATION';
    }
    if (
      lower.includes('rechazo') ||
      lower.includes('diferencia') ||
      lower.includes('falta') ||
      lower.includes('calidad') ||
      lower.includes('descuento')
    ) {
      return 'QUALITY_DISPUTE';
    }
    return 'GENERAL_INQUIRY';
  }

  private generateMockAgentResult(
    input: AgentChatInput,
    context: FarmerContext | null,
    startTime: number,
    providerName: string,
  ): AgentChatResult {
    const intent = this.detectIntent(input.userMessage);
    const deliveries = context?.deliveries || [];
    const tuesdayDelivery = deliveries.find(
      (d) => d.deliveryDate === '2026-10-20' || d.declaredBins === 18,
    );

    let agentResponse = '';

    if (intent === 'PAYMENT_STATUS' || input.userMessage.toLowerCase().includes('martes')) {
      if (tuesdayDelivery && tuesdayDelivery.isLiquidated) {
        const formattedAmount = tuesdayDelivery.paymentAmountClp
          ? new Intl.NumberFormat('es-CL', {
              style: 'currency',
              currency: 'CLP',
            }).format(tuesdayDelivery.paymentAmountClp)
          : '$18.450.000 CLP';

        agentResponse = `Estimado Don Carlos, revisando su cuenta en el sistema de recepción: sí, la entrega del martes 20 de octubre correspondiente a la Guía ${tuesdayDelivery.dispatchGuideNumber} (18 bins de Cerezas Royal Dawn, 7.200 kg netos) fue completamente aprobada y ya se encuentra LIQUIDADA con fecha 24 de octubre por un monto neto de ${formattedAmount}. Los fondos ya fueron transferidos a su cuenta registrada. ¿Desea que le envíe el comprobante de liquidación a su correo?`;
      } else if (tuesdayDelivery) {
        agentResponse = `Estimado Don Carlos, su entrega del martes (18 bins, Guía ${tuesdayDelivery.dispatchGuideNumber}) está recibida y aprobada en patio. La liquidación financiera está programada para su cierre de ciclo este viernes.`;
      } else {
        agentResponse = `Estimado Don Carlos, consultando en la base de datos de patio registramos su entrega de 18 bins de cerezas en estado APROBADO. El proceso de liquidación administrativa está en curso.`;
      }
    } else if (intent === 'DELIVERY_CONFIRMATION') {
      agentResponse = `Estimado productor, confirmamos que sus últimas recepciones en planta registran ${deliveries.length} entregas: la Guía GD-89412 (18 bins) aprobada y liquidada, la Guía GD-89504 (24 bins) aprobada pendiente de liquidación, y la Guía GD-89689 actualmente en revisión por diferencia de 2 bins en conteo físico.`;
    } else if (intent === 'QUALITY_DISPUTE') {
      agentResponse = `Don Carlos, respecto a la observación de calidad o conteo: la recepción GD-89689 del 25 de octubre presentó 28 bins contados físicamente vs 30 declarados en guía. Nuestro jefe de patio ya adjuntó las fotografías de SAM 3 para su revisión conjunta.`;
    } else {
      agentResponse = `Buenas tardes Don Carlos, le saluda Muse Spark de AgroControl. Tengo acceso directo a sus registros de entregas de fruta en Curicó. ¿En qué le puedo colaborar hoy con sus recepciones o pagos?`;
    }

    return {
      agentResponse,
      intent,
      groundedDeliveriesCount: deliveries.length,
      provider: providerName,
      referencedDeliveries: deliveries,
    };
  }
}
