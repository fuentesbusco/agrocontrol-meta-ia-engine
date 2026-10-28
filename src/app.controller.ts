import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { ReceptionService } from './reception/reception.service';
import { ChatService } from './chat/chat.service';
import { SystemStatusDto } from './common/dto/system-status.dto';
import { ProcessReceptionDto } from './reception/dto/process-reception.dto';
import { ProcessReceptionResponseDto } from './reception/dto/reception-response.dto';
import { ChatRequestDto } from './chat/dto/chat-request.dto';
import { ChatResponseDto } from './chat/dto/chat-response.dto';

@ApiTags('Orchestrator')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly receptionService: ReceptionService,
    private readonly chatService: ChatService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'System diagnostic and AI provider hierarchy status' })
  @ApiResponse({
    status: 200,
    description: 'Returns operational system status and AI fallback priorities',
    type: SystemStatusDto,
  })
  getRootStatus(): SystemStatusDto {
    return this.appService.getSystemStatus();
  }

  @Get('api/health')
  @ApiOperation({ summary: 'Health diagnostic endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Detailed health and provider connectivity diagnostics',
    type: SystemStatusDto,
  })
  getHealth(): SystemStatusDto {
    return this.appService.getSystemStatus();
  }

  /**
   * Primary Multimodal Orchestrator Endpoint
   * Concurrently processes SAM 3 (truck vision) and Muse Glimmer (document OCR)
   * via Promise.all, auto-reconciling physical bins with declared dispatch guide.
   */
  @Post(['api/reception/process', 'api/process-reception'])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Orchestrate physical-to-digital crop reception',
    description:
      'Receives truck photo and field guide photo. Executes SAM 3 and Muse Glimmer concurrently using Promise.all, reconciles physical bins vs declared bins, and approves or flags for ERP.',
  })
  @ApiResponse({
    status: 200,
    description: 'Multimodal physical-to-digital reconciliation complete',
    type: ProcessReceptionResponseDto,
  })
  async processReception(
    @Body() dto: ProcessReceptionDto,
  ): Promise<ProcessReceptionResponseDto> {
    return this.receptionService.processIncomingReception(dto);
  }

  /**
   * Conversational Agentic Workflow Endpoint
   * Muse Spark conversational agent with RAG injection over ERP deliveries.
   */
  @Post('api/chat')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Conversational financial & operational assistant for producers',
    description:
      'Answers farmer queries grounded strictly in database records, determining liquidation and payment status.',
  })
  @ApiResponse({
    status: 200,
    description: 'Grounded natural language agent reply',
    type: ChatResponseDto,
  })
  async chat(@Body() dto: ChatRequestDto): Promise<ChatResponseDto> {
    return this.chatService.handleFarmerMessage(dto);
  }
}
