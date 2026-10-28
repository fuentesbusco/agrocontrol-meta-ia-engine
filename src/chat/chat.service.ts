import { Injectable, Logger } from '@nestjs/common';
import { AgentService } from '../ai/services/agent.service';
import { MockDbService } from '../database/mock-db.service';
import { ChatRequestDto } from './dto/chat-request.dto';
import { ChatResponseDto } from './dto/chat-response.dto';
import { FarmerContext } from '../ai/interfaces/ai-contracts.interface';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly agentService: AgentService,
    private readonly mockDbService: MockDbService,
  ) {}

  async handleFarmerMessage(dto: ChatRequestDto): Promise<ChatResponseDto> {
    const farmerId = dto.farmerId || 'FARMER-76492';
    this.logger.log(`Handling chat query for farmer [${farmerId}]: "${dto.message}"`);

    const result = await this.agentService.processFarmerQuery({
      farmerId,
      userMessage: dto.message,
    });

    return {
      response: result.agentResponse,
      intent: result.intent,
      groundedDeliveriesCount: result.groundedDeliveriesCount,
      provider: result.provider,
      referencedDeliveries: (result.referencedDeliveries || []).map((d) => ({
        receptionId: d.receptionId,
        deliveryDate: d.deliveryDate,
        dispatchGuideNumber: d.dispatchGuideNumber,
        cropType: d.cropType,
        declaredBins: d.declaredBins,
        countedBins: d.countedBins,
        status: d.status,
        isLiquidated: d.isLiquidated,
        paymentAmountClp: d.paymentAmountClp,
      })),
      timestamp: new Date().toISOString(),
    };
  }

  getFarmerContext(farmerId: string): FarmerContext | null {
    return this.mockDbService.getFarmerContext(farmerId);
  }

  getAllFarmers(): FarmerContext[] {
    return this.mockDbService.getAllFarmers();
  }
}
