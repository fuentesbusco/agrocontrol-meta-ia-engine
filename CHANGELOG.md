# Changelog

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0-alpha.1] - 2026-10-28

### Added
- Initialized NestJS 11 backend microservice with strict TypeScript configuration.
- Integrated `ConfigModule` with multi-tier provider failover configuration (Meta Official Graph API -> Modal Endpoints -> Fireworks Serverless Inference -> Resilient Mock).
- Added environment variable validation using `class-validator` and `plainToInstance`.
- Configured enterprise security headers via `helmet` and rate limiting via `@nestjs/throttler`.
- Implemented global `AllExceptionsFilter` with RFC-compliant error structures, stack tracing, and correlation `requestId` (UUID).
- Implemented `LoggingInterceptor` for real-time HTTP request auditing, latency calculation, and correlation propagation.
- Integrated Swagger OpenAPI documentation exposed at `/api/docs`.
- Implemented `GET /` and `GET /api/health` diagnostic endpoints returning active AI provider statuses and failover configuration.
- Added comprehensive unit testing suite for `AppController` and `AppService`.
- Added documentation suite: `CONTEXT.md`, `SPEC.md`, `TODO.md`, `README.md`, and `TIMELOG.md`.
