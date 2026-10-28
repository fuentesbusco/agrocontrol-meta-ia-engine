# Changelog

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2026-10-28

### Added
- Integrated live inference pipelines for all three external AI providers: Meta AI official platform (`https://api.meta.ai/v1/responses` with `muse-spark-1.3`), Modal serverless webhooks for SAM 3 and Muse Glimmer deployed on CPU, and Fireworks AI serverless (`muse-spark-open`).
- Created realistic local sample dataset in `public/samples/` with authentic Chilean field dispatch guide (carbon-copy paper with official stamp, GD-89412) and real-world agricultural truck photography.
- Added 1-click interactive scenario loaders ("Caso 1: 18 Bins Match" and "Caso 2: Discrepancia") directly in the dashboard UI.

## [1.2.0] - 2026-10-28

### Changed
- Redesigned the demo frontend interface completely into an enterprise B2B **Light Mode** design (`slate-50` background, clean white cards, subtle borders, and corporate forest green branding).
- Removed all AI clichés (neon gradients, emoji logos, and flashy hackathon tags) from the top navigation bar.
- Implemented clean operational SaaS headers including plant location ("Planta Curicó • Báscula Norte"), operator identity ("D. Fuentes • Jefe de Recepción"), and quick API documentation links.
- Replaced Screen B with an authentic WhatsApp Web client interface (real teal header `#075E54`, verified badges, bubble color `#D9FDD3`, read receipt checkmarks `✓✓`, and natural agricultural coordinator tone).

## [1.1.0] - 2026-10-28

### Added
- Implemented `VisionService` for physical fruit bin and pallet segmentation via SAM 3 with multi-tier failover (Meta -> Modal -> Fireworks -> Mock).
- Implemented `OcrService` for handwritten field dispatch guide parsing via Muse Glimmer with strict JSON schema validation.
- Implemented `AgentService` providing conversational capabilities via Muse Spark, grounded strictly in agricultural ERP reception history.
- Implemented `MockDbService` modeling Chilean agricultural suppliers (e.g. Agrícola Los Nogales SpA, Copefrut partner data), historical deliveries, and liquidations.
- Implemented `ReceptionController` (`POST /api/reception/process`) executing SAM 3 and Muse Glimmer concurrently using `Promise.all` and generating auto-reconciled intake payloads (`APPROVED` vs `FLAGGED_FOR_REVIEW`).
- Implemented `ChatController` (`POST /api/chat`, `GET /api/chat/farmer-context/:farmerId`) answering farmer questions regarding batch approval and payments.
- Added comprehensive unit testing suites in `reception.service.spec.ts` and `chat.service.spec.ts` (100% test pass rate).

## [1.0.0-alpha.1] - 2026-10-28

### Added
- Initialized NestJS 11 backend microservice with strict TypeScript configuration.
- Integrated `ConfigModule` with multi-tier provider failover configuration.
- Added environment variable validation using `class-validator` and `plainToInstance`.
- Configured enterprise security headers via `helmet` and rate limiting via `@nestjs/throttler`.
- Implemented global `AllExceptionsFilter` with RFC-compliant error structures and correlation `requestId`.
- Implemented `LoggingInterceptor` for real-time HTTP request auditing and latency calculation.
- Integrated Swagger OpenAPI documentation exposed at `/api/docs`.
