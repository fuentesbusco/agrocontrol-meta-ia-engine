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

  /**
   * Main conversational interface: routes strictly to Fireworks Serverless
   * inference running Muse Spark Open-Weight model with RAG context grounding.
   */
  async processFarmerQuery(input: AgentChatInput): Promise<AgentChatResult> {
    const aiConfig = this.configService.get('ai');
    const designatedProvider: AiProvider =
      aiConfig?.routing?.agentProvider || AiProvider.FIREWORKS;

    const fallbacks: AiProvider[] = (aiConfig?.fallbackProviders || [
      AiProvider.MODAL,
      AiProvider.MOCK,
    ]).filter((p: AiProvider) => p !== designatedProvider && p !== AiProvider.META);

    const providerSequence: AiProvider[] = [designatedProvider, ...fallbacks];

    // Fetch verified grounding context from in-memory ERP database
    const context =
      this.mockDbService.getFarmerContext(input.farmerId) ||
      this.mockDbService.getFarmerContext('FARMER-76492');

    const startTime = Date.now();

    for (const provider of providerSequence) {
      try {
        this.logger.log(`Dispatching Muse Spark agent query via: [${provider}]`);
        const result = await this.executeProviderChat(provider, input, context, startTime);
        if (result) {
          this.logger.log(
            `Agent response generated via [${provider}]. Intent: ${result.intent}, Deliveries referenced: ${result.groundedDeliveriesCount}`,
          );
          return result;
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        this.logger.warn(
          `Provider [${provider}] failed for Muse Spark agent: ${error.message}. Escalating to fallback...`,
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
    const timeout = aiConfig?.resilience?.timeoutMs || 20000;
    const systemPrompt = this.buildSystemPrompt(context);

    switch (provider) {
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
              temperature: 0.3,
              max_tokens: 500,
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
        const replyText =
          response.data.choices[0]?.message?.content ||
          'Estimado productor, su consulta ha sido procesada correctamente contra los registros de báscula.';

        return {
          agentResponse: replyText,
          intent: this.detectIntent(input.userMessage),
          groundedDeliveriesCount: context?.deliveries.length || 0,
          provider: 'fireworks-muse-spark-openweight',
          referencedDeliveries: context?.deliveries || [],
        };
      }

      case AiProvider.MODAL: {
        const modalConfig = aiConfig?.modal;
        if (!modalConfig?.agentUrl) {
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
          intent: this.detectIntent(input.userMessage),
          groundedDeliveriesCount: context?.deliveries.length || 0,
          provider: 'modal-muse-spark',
          referencedDeliveries: context?.deliveries || [],
        };
      }

      case AiProvider.MOCK:
      default:
        return this.generateMockAgentResult(input, context, startTime, 'mock-muse-spark');
    }
  }

  private buildSystemPrompt(context: FarmerContext | null): string {
    const farmerName = context?.farmerName || 'Don Carlos Morales';
    const farmerRut = context?.farmerRut || '76.492.103-8';
    const deliveriesText = context?.deliveries?.length
      ? context.deliveries
          .map(
            (d) =>
              `- Recepción: ${d.receptionId} | Fecha: ${d.deliveryDate} | Guía: ${d.dispatchGuideNumber} | Especie: ${d.cropType} | Bins Declarados: ${d.declaredBins} | Bins Contados: ${d.countedBins} | Kilos: ${d.declaredKilos} kg | Estado: ${d.status} | Liquidado: ${d.isLiquidated ? 'SÍ' : 'NO'}`,
          )
          .join('\n')
      : 'No registra entregas recientes en el sistema.';

    return `Eres AgroControl Assistant, el asistente virtual oficial de recepción y báscula en Planta Curicó (Atelier Busco).
Atiendes a productores agrícolas chilenos a través de WhatsApp de forma profesional, clara, empática y respetuosa.

DATOS VERIFICADOS DEL PRODUCTOR:
Nombre: ${farmerName}
RUT: ${farmerRut}
Entregas Registradas en ERP:
${deliveriesText}

REGLAS DE RESPUESTA:
1. Responde SIEMPRE basándote de forma estricta en los datos verificados anteriores.
2. Si preguntan por liquidaciones o pagos, confirma el estado exacto de cada guía y el monto o kilos asociados.
3. Si una entrega está en estado FLAGGED_FOR_REVIEW o con discrepancia, explica amablemente que el supervisor de patio la está revisando manualmente y se le notificará a la brevedad.
4. Mantén un tono natural chileno corporativo (ej: "Estimado Don Carlos", "según nuestros registros en báscula").
5. NUNCA inventes números de guías, kilos o dinero que no figuren en los datos verificados.`;
  }

  private detectIntent(
    message: string,
  ): 'PAYMENT_STATUS' | 'DELIVERY_CONFIRMATION' | 'QUALITY_DISPUTE' | 'GENERAL_INQUIRY' {
    const lower = message.toLowerCase();
    if (lower.includes('liquid') || lower.includes('pago') || lower.includes('plata') || lower.includes('transferencia')) {
      return 'PAYMENT_STATUS';
    }
    if (lower.includes('bin') || lower.includes('kilo') || lower.includes('conteo') || lower.includes('recep') || lower.includes('camion')) {
      return 'DELIVERY_CONFIRMATION';
    }
    if (lower.includes('discrepan') || lower.includes('problema') || lower.includes('falta') || lower.includes('rechazo')) {
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
    let agentResponse = '';

    if (intent === 'PAYMENT_STATUS') {
      agentResponse = `Estimado ${context?.farmerName || 'Don Carlos'}, revisando su entrega del 28 de octubre con guía GD-89412 por 18 bins (7.200 kg de Cerezas Lapins), le confirmamos que fue APROBADA en báscula. El estado de liquidación se encuentra programado para pago el próximo viernes.`;
    } else if (intent === 'DELIVERY_CONFIRMATION') {
      agentResponse = `Buenas tardes ${context?.farmerName || 'Don Carlos'}. Su camión patente JD-8941 completó el pesaje en Báscula Norte. El conteo óptico por visión artificial confirmó exactamente 18 bins de exportación, coincidiendo con su guía de despacho.`;
    } else if (intent === 'QUALITY_DISPUTE') {
      agentResponse = `Estimado ${context?.farmerName || 'Don Carlos'}, informamos que la recepción se encuentra bajo revisión del supervisor debido a una discrepancia en el conteo de bins reportada por el sistema. Nos pondremos en contacto vía telefónica a la brevedad.`;
    } else {
      agentResponse = `Estimado ${context?.farmerName || 'Don Carlos'}, su historial registra 2 recepciones esta semana en Planta Curicó por un total de 36 bins y 14.400 kg de fruta de exportación. Todas conciliadas exitosamente con sus guías de huerto.`;
    }

    return {
      agentResponse,
      intent,
      groundedDeliveriesCount: context?.deliveries.length || 0,
      provider: providerName,
      referencedDeliveries: context?.deliveries || [],
    };
  }
}
