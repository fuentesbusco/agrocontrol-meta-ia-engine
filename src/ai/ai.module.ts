import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { VisionService } from './services/vision.service';
import { OcrService } from './services/ocr.service';
import { AgentService } from './services/agent.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 15000,
      maxRedirects: 3,
    }),
  ],
  providers: [VisionService, OcrService, AgentService],
  exports: [VisionService, OcrService, AgentService],
})
export class AiModule {}
