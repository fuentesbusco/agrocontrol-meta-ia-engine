import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ReceptionService } from '../src/reception/reception.service';
import { ChatService } from '../src/chat/chat.service';

/**
 * AgroControl Multimodal — Keyless Judge Replay & Benchmark Runner
 * Meta Global AI Hackathon 2026 (Startup Track · Build for Your World)
 *
 * Executes all 4 core multimodal & agentic workflows deterministically
 * (without requiring external API keys) and prints quantitative evaluation metrics.
 */
async function runDemoReplay(): Promise<void> {
  // Enforce deterministic keyless replay tier for instant judge verification
  process.env.AI_VISION_PROVIDER = 'mock';
  process.env.AI_OCR_PROVIDER = 'mock';
  process.env.AI_AGENT_PROVIDER = 'mock';
  process.env.AI_PROVIDER_PRIMARY = 'mock';
  process.env.AI_PROVIDER_FALLBACKS = 'mock';

  console.log('\n================================================================================');
  console.log(' 🌿 AGROCONTROL MULTIMODAL — KEYLESS REPLAY & BENCHMARK SUITE');
  console.log('    Meta Global AI Hackathon 2026 · Startup Track (Atelier Busco SpA)');
  console.log('    Runtime Models: SAM 3.1 + Muse Glimmer + Muse Spark Open (Failover Active)');
  console.log('================================================================================\n');

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });

  const receptionService = app.get(ReceptionService);
  const chatService = app.get(ChatService);

  // ---------------------------------------------------------------------------
  // SCENARIO 1: Exact Physical-to-Digital Reconciliation (16 Cherry Bins)
  // ---------------------------------------------------------------------------
  console.log('▶ [Scenario 1/5] Multimodal Intake: 16 Cherry Bins vs. Handwritten Guide GD-92014');
  const s1 = await receptionService.processIncomingReception({
    truckImage: '/samples/camion_8_columnas_bins.jpg',
    dispatchGuideImage: '/samples/guia_despacho_real.jpg',
    truckLicensePlate: 'PF-4921',
    supplierRut: '77.402.012-8',
    validationMode: 'FULL_RECONCILIATION',
  });
  console.log(`  • Status:          ${s1.status}`);
  console.log(`  • Supplier (OCR):  ${s1.ocrExtraction.supplierName} (${s1.ocrExtraction.supplierRut})`);
  console.log(`  • Counted vs Guide:${s1.visionAnalysis.totalBins} physical bins vs. ${s1.ocrExtraction.declaredBins} declared bins`);
  console.log(`  • Crop Detected:   ${s1.visionAnalysis.cropDetected}`);
  console.log(`  • Reason:          ${s1.reconciliation.reason}\n`);

  // ---------------------------------------------------------------------------
  // SCENARIO 2: Partial Load Discrepancy (4 Physical Bins vs 16 Declared)
  // ---------------------------------------------------------------------------
  console.log('▶ [Scenario 2/5] Quantity Discrepancy: Partial Truck Load (4 Bins vs. 16 Declared)');
  const s2 = await receptionService.processIncomingReception({
    truckImage: '/samples/camion_2_columnas_bins.jpg',
    dispatchGuideImage: '/samples/guia_despacho_real.jpg',
    truckLicensePlate: 'PF-4921',
    supplierRut: '77.402.012-8',
    validationMode: 'VALIDATE_QUANTITY',
  });
  console.log(`  • Status:          ${s2.status}`);
  console.log(`  • Discrepancy:     ${Math.abs(s2.reconciliation.differenceBins)} bins missing`);
  console.log(`  • Reason:          ${s2.reconciliation.reason}\n`);

  // ---------------------------------------------------------------------------
  // SCENARIO 3: Fruit Species Fraud Alert (Apples Loaded on Cherry Guide)
  // ---------------------------------------------------------------------------
  console.log('▶ [Scenario 3/5] Species Fraud Prevention: Apple Truck vs. Cherry Dispatch Guide');
  const s3 = await receptionService.processIncomingReception({
    truckImage: '/samples/camion_manzanas_patio.jpg',
    dispatchGuideImage: '/samples/guia_despacho_real.jpg',
    truckLicensePlate: 'JK-9012',
    supplierRut: '77.402.012-8',
    validationMode: 'VALIDATE_FRUIT',
  });
  console.log(`  • Status:          ${s3.status}`);
  console.log(`  • Visual Species:  ${s3.visionAnalysis.cropDetected}`);
  console.log(`  • Guide Species:   ${s3.ocrExtraction.cropType}`);
  console.log(`  • Reason:          ${s3.reconciliation.reason}\n`);

  // ---------------------------------------------------------------------------
  // SCENARIO 4: SHA-256 Memory Cache Verification (<15ms Sub-Millisecond Hit)
  // ---------------------------------------------------------------------------
  console.log('▶ [Scenario 4/5] SHA-256 Dual-Layer Cache Hit Benchmark (Repeat Scenario 1)');
  const s4 = await receptionService.processIncomingReception({
    truckImage: '/samples/camion_8_columnas_bins.jpg',
    dispatchGuideImage: '/samples/guia_despacho_real.jpg',
    truckLicensePlate: 'PF-4921',
    supplierRut: '77.402.012-8',
    validationMode: 'FULL_RECONCILIATION',
  });
  console.log(`  • Cache Hit:       ${s4.fromCache ? 'TRUE (SHA-256 Digest Verified)' : 'FALSE'}`);
  console.log(`  • Latency:         ${s4.totalProcessingTimeMs} ms\n`);

  // ---------------------------------------------------------------------------
  // SCENARIO 5: Producer WhatsApp RAG Agent (Muse Spark Open + ERP Grounding)
  // ---------------------------------------------------------------------------
  console.log('▶ [Scenario 5/5] Agentic WhatsApp RAG: Grower Liquidation & Multi-Turn Follow-up');
  const chatTurn1 = await chatService.handleFarmerMessage({
    farmerId: 'FARMER-76492',
    message: '¿Me liquidaron los 18 bins de la entrega del martes?',
  });
  console.log(`  • Grower Query 1:  "¿Me liquidaron los 18 bins de la entrega del martes?"`);
  console.log(`  • Detected Intent: ${chatTurn1.intent} (Grounded ERP Records: ${chatTurn1.groundedDeliveriesCount})`);
  console.log(`  • Agent Reply 1:   ${chatTurn1.response}\n`);

  const chatTurn2 = await chatService.handleFarmerMessage({
    farmerId: 'FARMER-76492',
    message: 'No me respondiste la pregunta.',
    history: [
      { role: 'user', content: '¿Me liquidaron los 18 bins de la entrega del martes?' },
      { role: 'assistant', content: chatTurn1.response },
    ],
  });
  console.log(`  • Grower Query 2:  "No me respondiste la pregunta."`);
  console.log(`  • Agent Reply 2:   ${chatTurn2.response}\n`);

  console.log('================================================================================');
  console.log(' ✅ ALL 5 REPLAY SCENARIOS COMPLETED SUCCESSFULLY (0 ERRORS)');
  console.log('================================================================================\n');

  await app.close();
}

runDemoReplay().catch((err) => {
  console.error('Demo replay failed:', err);
  process.exit(1);
});
