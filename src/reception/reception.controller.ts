import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ReceptionService } from './reception.service';
import { ProcessReceptionDto } from './dto/process-reception.dto';
import { ProcessReceptionResponseDto } from './dto/reception-response.dto';

@ApiTags('Reception')
@Controller('api/reception')
export class ReceptionController {
  constructor(private readonly receptionService: ReceptionService) {}

  @Post('process')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Process incoming truck reception',
    description:
      'Receives truck photo and field dispatch guide photo. Executes SAM 3 visual bin counting and Muse Glimmer document extraction concurrently, compares tallies, and returns ERP reconciliation status (APPROVED or FLAGGED_FOR_REVIEW).',
  })
  @ApiResponse({
    status: 200,
    description: 'Successful multimodal reconciliation',
    type: ProcessReceptionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input payload or malformed image data',
  })
  async processReception(
    @Body() dto: ProcessReceptionDto,
  ): Promise<ProcessReceptionResponseDto> {
    return this.receptionService.processIncomingReception(dto);
  }
}
