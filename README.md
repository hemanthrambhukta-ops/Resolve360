# Resolve 360 — Multimodal AI-Powered Technical Support & Ticket Resolution Platform

<div align="center">
  <img src="https://img.shields.io/badge/AI-Gemini%203.8%20Flash-blue?style=for-the-badge&logo=google" />
  <img src="https://img.shields.io/badge/Backend-Node.js%20Express-green?style=for-the-badge&logo=node.js" />
  <img src="https://img.shields.io/badge/Frontend-React%20Vite-purple?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/Database-Supabase%20PostgreSQL-orange?style=for-the-badge&logo=supabase" />
  <img src="https://img.shields.io/badge/Language-TypeScript-blue?style=for-the-badge&logo=typescript" />
</div>

---

## Overview

**Resolve 360** is a production-grade Multimodal AI Support Platform that ingests, correlates, and analyzes heterogeneous diagnostic evidence—including **text, images, audio recordings, PDF documentation, raw system logs, and screen recording videos**—into a single fused AI context.

The platform leverages **Gemini 3.8 Flash** multimodal capabilities via the `@google/genai` SDK to perform cross-modal root cause analysis, automated ticket resolution, and knowledge base management.

---

## Features

### 🔬 Multimodal Evidence Engine
- Upload up to **10 files simultaneously** across any modality
- Supports: `.png`, `.jpg`, `.webp` (screenshots), `.mp3`, `.m4a`, `.wav` (audio recordings), `.pdf` (documentation), `.log`, `.txt` (system logs), `.mp4`, `.webm` (screen recordings)
- Audio recorder built-in with live waveform visualization
- Inline-data base64 streaming directly into Gemini API

### 🤖 Gemini AI Analysis Pipeline
- **Cross-modal context fusion** — correlates timestamps, error codes, visual indicators, and spoken audio cues
- **Evidence attribution** — every finding cites the source file and modality
- **Dual-tier resolution** — plain-language guide for end users + CLI/config commands for IT engineers
- **Confidence scoring** — honest 0.00–1.00 score with discrepancy detection
- **Structured JSON schema** output via `responseMimeType: 'application/json'` and `responseSchema`
- Automatic model fallback chain: `gemini-3.8-flash` → `gemini-flash-latest` → `gemini-2.5-flash`

### 🎫 Ticket Management
- Full CRUD for support tickets with severity levels (LOW / MEDIUM / HIGH / CRITICAL)
- Status workflow: OPEN → IN_PROGRESS → RESOLVED → CLOSED
- Evidence matrix view showing cross-modal file correlations
- PDF export with html2canvas + jsPDF

### 📚 Knowledge Base
- AI-curated knowledge base with semantic full-text search
- Category filtering across Software, OS, Network, Hardware, Database, Security domains

### 🔐 Auth & Persistence
- Supabase Auth with JWT + Row Level Security (RLS)
- Supabase Storage for evidence file uploads
- File-backed JSON fallback store for offline/demo mode

---

## Architecture

```
c:\Resolve360\
├── client/                    # React 18 + Vite + TypeScript frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── Navbar.tsx
│   │   │   ├── MultimodalUploader.tsx   # Drag-drop + camera + mic
│   │   │   ├── AudioRecorderModal.tsx   # Live waveform recorder
│   │   │   ├── EvidenceMatrixCard.tsx   # Cross-modal correlation viz
│   │   │   ├── ResolutionViewer.tsx     # Dual-tier AI resolution
│   │   │   ├── ConfidenceBadge.tsx      # AI confidence indicator
│   │   │   ├── TicketTable.tsx          # Sortable ticket list
│   │   │   └── TicketPDFExport.tsx      # PDF generation
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx          # Marketing hero page
│   │   │   ├── LoginPage.tsx            # Supabase Auth login
│   │   │   ├── RegisterPage.tsx         # New account creation
│   │   │   ├── DashboardPage.tsx        # Analytics overview
│   │   │   ├── WorkspacePage.tsx        # Multimodal submission form
│   │   │   ├── TicketsPage.tsx          # Ticket list view
│   │   │   ├── TicketDetailPage.tsx     # Ticket detail & evidence
│   │   │   └── KnowledgeBasePage.tsx    # KB search & browse
│   │   └── lib/
│   │       └── apiClient.ts             # Axios API layer
│
├── server/                    # Node.js Express + TypeScript backend
│   ├── src/
│   │   ├── server.ts                    # Express app entry point
│   │   ├── config/
│   │   │   ├── gemini.ts                # Google AI SDK client
│   │   │   └── supabaseAdmin.ts        # Supabase admin + local store
│   │   ├── routes/
│   │   │   ├── resolveRoutes.ts         # POST /api/resolve (core pipeline)
│   │   │   ├── ticketRoutes.ts          # CRUD /api/tickets
│   │   │   ├── kbRoutes.ts              # GET/POST /api/knowledge-base
│   │   │   └── authRoutes.ts            # POST /api/auth/*
│   │   ├── services/
│   │   │   ├── aiService.ts             # Gemini multimodal analysis
│   │   │   └── storageService.ts        # Supabase Storage uploads
│   │   ├── middleware/
│   │   │   ├── authMiddleware.ts        # JWT verification
│   │   │   └── fileUpload.ts            # Multer 50MB config
│   │   └── shared/
│   │       └── validators.ts            # Zod schemas
│
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql       # Full DB schema with RLS
│
└── shared/
    └── validators.ts                    # Shared Zod validation types
```

---

## Quick Start

### Prerequisites
- Node.js ≥ 20.0.0
- npm ≥ 9.0.0

### 1. Clone the repository
```bash
git clone https://github.com/hemanthrambhukta-ops/Resolve360.git
cd Resolve360
```

### 2. Install dependencies
```bash
# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 3. Configure environment variables

**Server** (`server/.env`):
```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key
```

**Client** (`client/.env`):
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_BASE_URL=http://localhost:5000
```

### 4. Run database migrations
Apply the SQL in `supabase/migrations/001_initial_schema.sql` via the Supabase SQL Editor.

### 5. Start the application
```bash
# Terminal 1: Start backend
cd server && npm run dev

# Terminal 2: Start frontend
cd client && npm run dev
```

Open `http://localhost:5173` in your browser.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/resolve` | Submit multimodal evidence for AI analysis |
| `GET` | `/api/tickets` | List all tickets |
| `GET` | `/api/tickets/:id` | Get ticket details with evidence |
| `PATCH` | `/api/tickets/:id/status` | Update ticket status |
| `GET` | `/api/knowledge-base` | List KB articles |
| `POST` | `/api/knowledge-base` | Add new KB article |
| `GET` | `/api/health` | Backend health check |

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| AI Engine | Google Gemini 3.8 Flash (`@google/genai`) |
| Frontend | React 18, Vite, TypeScript, Tailwind CSS |
| Backend | Node.js, Express 4, TypeScript |
| Database | Supabase Cloud PostgreSQL |
| Auth | Supabase Auth (JWT + RLS) |
| Storage | Supabase Storage |
| Validation | Zod |
| File Upload | Multer (50MB) |
| PDF | html2canvas + jsPDF |
| Icons | Lucide React |

---

## License

MIT License — © 2026 Resolve 360
