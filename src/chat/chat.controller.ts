import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { ChatRequestDto } from './dto/chat-request.dto';
import { ChatResponseDto } from './dto/chat-response.dto';

@ApiTags('Agent')
@Controller('api/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Chat with Muse Spark conversational agent',
    description:
      'Answers farmer operational and financial queries (e.g. "¿Me liquidaron los 18 bins de la entrega del martes?") grounded strictly in real ERP reception records.',
  })
  @ApiResponse({
    status: 200,
    description: 'Empathetic, factual agent response grounded in database',
    type: ChatResponseDto,
  })
  async chat(@Body() dto: ChatRequestDto): Promise<ChatResponseDto> {
    return this.chatService.handleFarmerMessage(dto);
  }

  @Get('farmer-context/:farmerId')
  @ApiOperation({ summary: 'Retrieve verified producer context and delivery history' })
  @ApiResponse({
    status: 200,
    description: 'Farmer profile and recent delivery records',
  })
  getFarmerContext(@Param('farmerId') farmerId: string) {
    return this.chatService.getFarmerContext(farmerId);
  }

  @Get('farmers')
  @ApiOperation({ summary: 'List all mock registered agricultural producers' })
  @ApiResponse({
    status: 200,
    description: 'List of registered farmers',
  })
  getAllFarmers() {
    return this.chatService.getAllFarmers();
  }
}
