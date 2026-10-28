# AgroControl Multimodal Engine (`agrocontrol-meta-ia-engine`)

> **Meta Global AI Developer Hackathon (Startup Track)**  
> **Target:** Field-to-Plant Physical Supply Chain AI Reconciliation Engine for B2B Agro-Industry

---

## 🌾 The Problem: The Analog Mile in Crop Reception Yards
In agricultural packing plants and cooperatives, the yard reception process is a critical bottleneck:
- **Wooden Bins & Pallets:** Manually tallied on incoming trucks, creating physical discrepancies and billing disputes.
- **Handwritten Dispatch Guides:** Dirt-stained, handwritten field notes must be hand-typed into ERP systems.
- **Disconnected Farmers:** Farmers wait days without visibility into batch acceptance or liquidations.

**AgroControl Multimodal** replaces manual paperwork and clipboards with an AI pipeline:
1. **Automated Visual Counting:** Segments and counts fruit bins using **SAM 3**.
2. **Dirty Document Extraction:** Digitizes handwritten field guides into strict JSON using **Muse Glimmer**.
3. **Conversational Financial Agent:** Natural language Q&A for farmers powered by **Muse Spark** grounded in ERP transactions.

---

## ⚡ Tech Stack & Architecture
- **Runtime:** Node.js v20+, NestJS v11, TypeScript (strict mode)
- **Security & Standards:** `helmet`, `@nestjs/throttler`, global `AllExceptionsFilter` with UUID correlation IDs.
- **Documentation:** Interactive OpenAPI / Swagger at `/api/docs`.
- **Inference Providers with Auto-Failover:**
  - **Tier 1:** Meta Official Graph API ($150 credit pool)
  - **Tier 2:** Modal Serverless GPU Containers ($100 credit pool)
  - **Tier 3:** Fireworks Serverless Inference ($100 credit pool)
  - **Tier 4:** Resilient Local Mock Fallback for continuous offline testing
- **Frontend Demo:** Static, zero-build `index.html` styled with Tailwind CSS (dark theme: `bg-midnight`, `text-platinum`).
- **Deployment:** Azure App Service.

---

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/fuentesbusco/agrocontrol-meta-ia-engine.git
cd agrocontrol-meta-ia-engine
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Configure your Meta, Modal, or Fireworks API credentials in `.env`.

### 3. Build & Run
```bash
# Compile TypeScript
npm run build

# Run unit tests
npm test

# Start development server with hot-reload
npm run start:dev

# Start production server
npm run start:prod
```

### 4. Verify Endpoints
- **Health Diagnostic:** [http://localhost:3000/api/health](http://localhost:3000/api/health)
- **Interactive Swagger Docs:** [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

---

## 🧪 AI Failover Architecture
The engine monitors inference requests across configured providers:
```text
Primary (Meta API) -> [Network Timeout / Outage] -> Fallback 1 (Modal) -> Fallback 2 (Fireworks) -> Local Mock
```
All errors and provider handoffs are recorded with structured correlation IDs (`x-request-id`).

---

## 📄 License & Attribution
Developed by **Daniel Fuentes Busco** (Founder, **Atelier Busco SpA**) for the **Meta Global AI Developer Hackathon**.
Licensed under UNLICENSED / Proprietary.
