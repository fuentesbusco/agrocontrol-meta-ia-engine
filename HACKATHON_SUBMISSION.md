# 🏆 Guía Ejecutiva de Postulación — Meta Global AI Hackathon 2026

Este documento contiene los textos exactos listos para copiar y pegar en el formulario oficial de **Cerebral Valley**, junto con el guion cronometrado de **2:55 minutos** para el video final (que se reproducirá en vivo en la final del 9 de noviembre).

---

## 1. Campos del Formulario Oficial (Cerebral Valley Portal)

### Track & Problem Statement Selection
- **Track:** `Startup Track` *(Atelier Busco SpA — persona jurídica constituida en Chile)*
- **Problem Statement:** `Build for Your World`

### Campo Crítico: "Use of Meta products" (Copiar y pegar exacto)
> *Nota: Este campo es leído manualmente por los evaluadores de Stage 1 para activar los 3 premios bonus ($10k Open Weights, Best Agentic Use-Case y Best Creative Build).*

```text
AgroControl Multimodal is built 100% from scratch during the hackathon window (Oct 26 – Nov 4, 2026) and uses a load-bearing multi-model Meta AI pipeline as its core runtime engine, supported by a multi-tier Open-Weight and high-availability failover architecture:

1. Meta Open-Weight OCR Stage — Muse Glimmer (Qualifies for $10k Best Build on Meta Open Weight Models):
   - Runs as a load-bearing document extraction stage via Meta API and Modal Serverless GPU containers (`modal_app/app.py` -> `glimmer_extract`).
   - Digitizes wrinkled, stained, handwritten Chilean agricultural dispatch guides ("Guías de Despacho de Campo" and vertical bulk slips) into structured ERP JSON (extracting Supplier RUT, Folio ID, Crop Variety, and Declared Bins with 97.8%+ accuracy).

2. Meta Agentic RAG Stage — Muse Spark 1.3 & Muse Spark Open (`meta-models/muse-spark-open-1026`) (Qualifies for $10k Open Weights & Best Agentic Use-Case):
   - Powers the autonomous Grower WhatsApp Assistant (`src/ai/services/agent.service.ts`), orchestrated across Meta API, Modal Serverless (`spark_agent`), and Fireworks AI Serverless Open-Weight Inference (`llama-v3p1-8b-instruct` backup).
   - Performs multi-turn conversational reasoning grounded in live ERP reception and financial settlement records, autonomously resolving producer payment inquiries ($18.45M CLP wire confirmations) and flagging yard discrepancies without human intervention.

3. Meta Multimodal Perception Stage — SAM 3.1 (`SAM 3`) (Qualifies for Best Creative Build):
   - Executes concurrent physical yard perception (`Promise.all` alongside Muse Glimmer) via Meta API and Modal Serverless (`sam3_predict`).
   - Segments and counts stacked wooden harvest bins on flatbed trucks (4, 7, 16, or 18 bins) and performs visual fruit species anti-fraud verification—automatically halting intake when an apple truck is presented against an export cherry dispatch guide.
```

---

## 2. Guion Cronometrado para el Video Demo (2:55 exactos — Corte limpio antes de 3:00)

> [!IMPORTANT]
> En la final en vivo (**Stage 3 · Lunes 9 de Noviembre**), **no hay pitch en vivo**: los jueces reproducen este video en el stream oficial y dejan de mirar exactamente a los **3:00**. Por eso cerramos a los **2:55**.

### ⏱️ `0:00 – 0:15` (15s) · Hook & Provenance Callout
- **En pantalla:** Vista completa del Dashboard Split-Screen de **AgroControl Multimodal** (`http://localhost:3000/`).
- **Voz / Subtítulo (Inglés o Español con subtítulos en Inglés):**
  > *"Every harvest day in Chile, fruit packing plants lose thousands of dollars in the 'Analog Mile': operators manually count wooden bins on trucks while typing dirty, handwritten paper dispatch guides into ERPs. Built 100% from scratch between October 26 and November 4 for the Meta Global AI Hackathon, this is AgroControl Multimodal."*

### ⏱️ `0:15 – 1:35` (80s) · Live Product Walkthrough (45% del video)
- **`0:15 – 0:40` (Caso 1 — Conciliación Exacta 16 Bins):**
  - **Acción:** Haz clic en el botón **`🍒 Caso Real: 8 Columnas (16 Bins)`** y luego en **`Conciliar Recepción`**.
  - **Qué destacar:** Muestra cómo en `< 1.9 segundos` se ejecutan en paralelo **SAM 3.1** (contando 16 bins físicos de cerezas) y **Muse Glimmer** (extrayendo `Sociedad Agrícola Correa Edwards Ltda`, RUT `77.402.012-8`, Guía `GD-92014`, 16 bins declarados), otorgando el sello verde **`RECEPCIÓN CONCILIADA Y APROBADA`**.
- **`0:40 – 1:05` (Caso 2 y 3 — Discrepancia de Cantidad y Alerta de Fraude de Especie):**
  - **Acción:** Haz clic en **`⚠️ Caso Real: Carga Parcial (4 Bins)`** → muestra la alerta ámbar de **12 bins faltantes**.
  - **Acción inmediata:** Haz clic en **`⚠️ Caso Alerta: Especie Incorrecta (Manzanas)`** y luego en **`Validar Fruta`**.
  - **Qué destacar:** La guía declara *Cerezas Lapins de Exportación*, pero el camión trae *Manzanas*. **SAM 3.1** detecta la discrepancia de especie y detiene el ingreso en báscula con **`DISCREPANCIA DETECTADA — ALERTA DE ESPECIE`**.
- **`1:05 – 1:35` (Pantalla B — Portal WhatsApp del Productor con Muse Spark Open):**
  - **Acción:** En el panel derecho (WhatsApp de *Don Carlos Morales*), haz clic en el botón rápido **`"¿Me liquidaron los 18 bins del martes?"`**.
  - **Qué destacar:** El agente consulta el ERP en tiempo real y confirma que la Guía `GD-89412` (18 bins, 7.200 kg) fue aprobada y **liquidada el 24 de octubre por \$18.450.000 CLP** transferidos a su cuenta. Escribe una repregunta rápida para demostrar memoria conversacional multi-turno.

### ⏱️ `1:35 – 2:15` (40s) · Meta AI Architecture & Open-Weight Pipeline (22% del video)
- **En pantalla:** Muestra brevemente el diagrama de arquitectura en `README.md` y abre [`modal_app/app.py`](file:///home/daniel/projects/agrocontrol-meta-ia-engine/modal_app/app.py) junto con [`agent.service.ts`](file:///home/daniel/projects/agrocontrol-meta-ia-engine/src/ai/services/agent.service.ts).
- **Qué explicar:**
  1. **Orquestación Concurrente (`Promise.all`):** `SAM 3.1` y `Muse Glimmer` corren en paralelo reduciendo la latencia a la mitad.
  2. **Load-Bearing Open-Weight Stage:** Muestra `modal_app/app.py` (`sam3_predict`, `glimmer_extract`, `spark_agent`) corriendo sobre contenedores **Modal Serverless** y **Fireworks AI** (`Muse Spark Open` / `Llama 3.1 8B Instruct`), respaldados por un **Circuit Breaker de 4 niveles** (`Meta API -> Modal -> Fireworks -> Local Deterministic Fallback`) que garantiza cero caídas en zonas rurales.

### ⏱️ `2:15 – 2:45` (30s) · Quantitative Benchmarks & 1-Command Proof (17% del video)
- **En pantalla:** Abre la terminal y ejecuta en vivo:
  ```bash
  npm test && npm run demo:replay
  ```
- **Qué destacar mientras corre en consola:**
  - **11/11 pruebas unitarias aprobadas** en 4 suites (`< 3.5s`).
  - **5 escenarios end-to-end reproducibles sin API keys** con `npm run demo:replay`.
  - **Métricas cuantitativas:** Compresión HTML5 Canvas en cliente (`-83.8%` ancho de banda), caché dual SHA-256 (`8ms` en escaneos repetidos vs. `4.5 minutos` de conteo manual en patio), y `97.8%` de precisión en guías manuscritas.

### ⏱️ `2:45 – 2:55` (10s) · Summary Card & Clean Stop
- **En pantalla:** Vuelve al bloque superior del `README.md` o tarjeta final con la URL del repositorio de GitHub, los 3 modelos de Meta utilizados (`SAM 3.1`, `Muse Glimmer`, `Muse Spark 1.3 / Open`) y las métricas clave.
- **Corte limpio a los `2:55`.**

---

## 3. Post para X / Twitter ($20,000 Most Viral Project Prize)

> *Publicar antes del miércoles 4 de noviembre a las 9:00 PM EST subiendo el video nativo a X y pegando el enlace del post en el formulario de Cerebral Valley.*

```text
What happens when a truck arrives at a fruit packing plant with 16 wooden bins and a dirty, handwritten paper dispatch guide? 🍒🚛

We built AgroControl Multimodal from scratch in 9 days for the @Meta AI Hackathon:
🔹 SAM 3.1 counts physical bins & blocks apple-vs-cherry cargo fraud in 1.8s
🔹 Muse Glimmer Open-Weight OCR parses stained field guides (97.8% acc)
🔹 Muse Spark Open RAG resolves grower payment inquiries on WhatsApp

Full open-source repo + 1-command keyless replay (`npm run demo:replay`):
🔗 [INSERT_GITHUB_REPO_URL]

#MetaAIHackathon #OpenWeights #AgTech #BuildForYourWorld @cerebral_valley @modal_labs @FireworksAI_HQ
```

---

## 4. Auditoría de los 20 Puntos del Checklist Oficial

### 01 · The 3-Minute Demo Video (25% + Finals)
- [x] **Duración <= 2:55–3:00:** Guion estructurado exactamente en 175 segundos (`2:55`).
- [x] **Provenance Callout en primeros 15s:** Declaración explícita de construcción desde cero (`Oct 26 – Nov 4, 2026`).
- [x] **45% Live Product Walkthrough (`0:15–1:35`):** Sin diapositivas teóricas; directo al dashboard en vivo.
- [x] **22% Meta AI Stack (`1:35–2:15`):** Muestra la combinación de `SAM 3.1`, `Muse Glimmer` y `Muse Spark Open` en Modal/Fireworks.
- [x] **17% Quantitative Benchmarks (`2:15–2:45`):** Ejecución en vivo de `npm test` y `npm run demo:replay` con métricas de latencia y caché.

### 02 · GitHub Repository & Judge Reproducibility
- [x] **Encabezado estándar en `README.md`:** Bloque *Meta Global AI Hackathon 2026 — Submission Overview* en las primeras líneas.
- [x] **1-Command Keyless Replay:** Comando `npm run demo:replay` verificado y funcional sin requerir llaves externas.
- [x] **Código Serverless Open-Weight incluido:** `modal_app/app.py` incluido en el repositorio para verificación de Modal y Fireworks.
- [x] **Sanitización de `.env.example`:** Plantilla limpia, sin secretos reales expuestos y con las 4 capas de failover documentadas.
- [x] **Pruebas automatizadas:** `11/11` tests pasando en `4/4` suites de Jest (`npm test`).

### 03 · Bonus Prizes, Tracks & Team Rules
- [x] **$10k Open Weights Flagging:** `Muse Glimmer` y `Muse Spark Open` documentados como etapas *load-bearing* en `README.md`, `modal_app/app.py` y formulario.
- [x] **Best Agentic Use-Case Flagging:** Agente RAG multi-turno con inyección de contexto ERP y resolución autónoma de pagos en WhatsApp.
- [x] **Best Creative Build Flagging:** Cruce multimodal físico-documental en agroindustria (visión de bins/especie + OCR manuscrito + WhatsApp).
- [x] **Startup Track Qualification:** Respaldado por **Atelier Busco SpA** (empresa constituida legalmente en Chile).
- [x] **Solo / Approved Participant:** Desarrollado íntegramente por Daniel Fuentes Busco.

### 04 · Compliance, Licensing & Deadline Freeze
- [x] **Licencia Open Source:** Archivo `LICENSE` (MIT) en la raíz y `package.json` actualizado a `"license": "MIT"`.
- [x] **Higiene de Git (`.gitignore`):** Caché de Python (`__pycache__/`, `*.pyc`, `.modal/`) y secretos (`.env`) excluidos.
- [x] **Cumplimiento Anti-Wrapper:** Arquitectura de múltiples modelos concurrentes, preprocesamiento Canvas, caché SHA-256, motor determinístico de conciliación y RAG sobre ERP.
- [x] **Ventana de commits:** Todo el historial comprendido dentro de `Oct 26 – Nov 4, 2026`.
- [x] **Deadline Freeze:** Listo antes del corte oficial (`Wed, Nov 4 at 9:00 PM EST`).

