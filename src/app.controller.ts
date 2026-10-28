import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { SystemStatusDto } from './common/dto/system-status.dto';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Root operational check' })
  @ApiResponse({
    status: 200,
    description: 'Returns operational system status and provider configuration summary',
    type: SystemStatusDto,
  })
  getRootStatus(): SystemStatusDto {
    return this.appService.getSystemStatus();
  }

  @Get('api/health')
  @ApiOperation({ summary: 'Health diagnostic endpoint' })
  @ApiResponse({
    status: 200,
    description: 'System health, AI engine fallback hierarchy, and uptime diagnostic',
    type: SystemStatusDto,
  })
  getHealth(): SystemStatusDto {
    return this.appService.getSystemStatus();
  }
}
