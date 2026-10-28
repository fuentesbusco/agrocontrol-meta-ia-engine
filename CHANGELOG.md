# Changelog

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-10-28

### Added
- Implemented `VisionService` for physical fruit bin and pallet segmentation via SAM 3 with multi-tier failover (Meta -> Modal -> Fireworks -> Mock).
- Implemented `OcrService` for handwritten field dispatch guide parsing via Muse Glimmer with strict JSON schema validation.
- Implemented `AgentService` providing conversational capabilities via Muse Spark, grounded strictly in agricultural ERP reception history.
- Implemented `MockDbService` modeling Chilean agricultural suppliers (e.g. Agrícola Los Nogales SpA, Copefrut partner data), historical deliveries, and liquidations.
- Implemented `ReceptionController` (`POST /api/reception/process`) executing SAM 3 and Muse Glimmer concurrently using `Promise.all` and generating auto-reconciled intake payloads (`APPROVED` vs `FLAGGED_FOR_REVIEW`).
- Implemented `ChatController` (`POST /api/chat`, `GET /api/chat/farmer-context/:farmerId`) answering farmer questions regarding batch approval and payments.
- Created high-fidelity split-screen demo UI in `public/index.html` and `index.html` with Tailwind CSS CDN (`bg-midnight`, `text-platinum`), featuring Screen A (Operator Intake) and Screen B (Farmer WhatsApp Assistant).
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
- Implemented `GET /` and `GET /api/health` diagnostic endpoints.
