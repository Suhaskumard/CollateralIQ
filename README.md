# CollateralIQ

> AI-powered collateral intelligence platform for Indian NBFCs — property valuation, risk analysis, portfolio management & AI copilot.

Live deployment: https://collateraliq.vercel.app

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Backend | Node.js + Express |
| AI Copilot | OpenAI GPT-4o (streaming SSE) |
| Storage | JSON file persistence |

---

## Project Structure

```
CollateralIQ/
├── README.md
│
├── archive/                    ← Original single-file prototype (not used)
│   └── valuai_pro.html
│
├── backend/                    ← Node.js + Express API (port 8000)
│   ├── server.js               ← Entry point (bootstrap only)
│   ├── package.json
│   ├── .env / .env.example
│   └── src/
│       ├── app.js              ← Express app factory
│       ├── config/
│       │   └── index.js        ← Environment variables
│       ├── middleware/
│       │   └── errorHandler.js ← Global error handler
│       ├── utils/
│       │   └── fileStore.js    ← Shared JSON persistence utility
│       └── modules/            ← Feature modules (Routes → Controller → Service)
│           ├── dashboard/      → GET  /api/dashboard/metrics
│           ├── estimate/       → POST /api/estimate/run
│           ├── whatif/         → POST /api/whatif/analyze
│           ├── portfolio/      → GET/POST/DELETE /api/portfolio
│           ├── copilot/        → POST /api/copilot/chat (SSE)
│           └── audit/          → GET/POST /api/audit/trail
│
└── frontend/                   ← React 18 + Vite (port 5173)
    ├── vite.config.js          ← Proxy: /api → localhost:8000
    ├── index.html
    └── src/
        ├── App.jsx             ← App shell (layout + routing)
        ├── index.css           ← Global design system
        ├── main.jsx
        ├── components/
        │   ├── Sidebar/        ← Navigation sidebar
        │   └── Toast/          ← Notification toasts
        ├── context/
        │   └── AppContext.jsx  ← Global state (page, toasts)
        ├── pages/
        │   ├── Dashboard/      ← KPI cards + risk distribution
        │   ├── Estimate/       ← Valuation form + report
        │   ├── WhatIf/         ← Live scenario sliders
        │   ├── Portfolio/      ← Case table + CRUD
        │   ├── Copilot/        ← Streaming AI chat
        │   └── Audit/          ← Immutable event log
        └── services/
            └── api.js          ← All API calls (fetch + SSE)
```

---

## Quick Start

### 1. Backend
```bash
cd backend
copy .env.example .env     # Windows
# cp .env.example .env     # Mac/Linux
# → add your OPENAI_API_KEY

npm install
npm run dev                # → http://localhost:8000
```

```
### 2. Frontend
```bash
cd frontend
npm install
npm run dev                # → http://localhost:5173

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard/metrics` | Portfolio KPIs & risk distribution |
| POST | `/api/estimate/run` | Run collateral valuation |
| POST | `/api/whatif/analyze` | Real-time scenario analysis |
| GET | `/api/portfolio` | List all saved cases |
| POST | `/api/portfolio/save` | Save valuation case |
| DELETE | `/api/portfolio/:id` | Remove a case |
| POST | `/api/copilot/chat` | AI chat (streaming SSE) |
| GET | `/api/audit/trail` | Audit event log |

---

## Environment Variables

```env
# backend/.env
OPENAI_API_KEY=sk-...      # Optional — mock responses used if not set
OPENAI_MODEL=gpt-4o
PORT=8000
```

> The copilot works without an API key and returns smart mock responses.
