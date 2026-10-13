# AutoZure — Self-Hosted Visual Workflow Automation Platform

> **Automate anything. Deploy everywhere.**  
> AutoZure is a modern, self-hosted visual workflow automation platform engineered for reliability, modularity, and distributed scale.

---

## Architecture Overview

```
                      ┌─────────────────────────────────────────┐
                      │          AutoZure Frontend             │
                      │         (Next.js 14 + React Flow)       │
                      │               Port 3000                 │
                      └────────────────────┬────────────────────┘
                                           │
                                    REST API / JWT
                                           │
                      ┌────────────────────▼────────────────────┐
                      │          AutoZure Backend              │
                      │         (Node.js + Express API)         │
                      │               Port 3001                 │
                      └────────┬──────────────────────┬─────────┘
                               │                      │
                   PostgreSQL  │                      │ BullMQ / Redis
                   (Port 5432) │                      │ (Port 6379)
                      ┌────────▼─────────┐   ┌────────▼─────────┐
                      │    PostgreSQL    │   │  Redis & BullMQ  │
                      │ (Drizzle ORM DB) │   │ (Async Workers)  │
                      └──────────────────┘   └──────────────────┘
```

### Core Architecture Components

1. **Frontend (`apps/web`)**: Next.js 14 App Router, TypeScript, React Flow (@xyflow/react), Tailwind CSS, Lucide icons, Zustand state management.
2. **Backend API (`apps/api`)**: Express, Drizzle ORM, PostgreSQL, rate limiting, JWT token rotation, AES-256-GCM credential encryption.
3. **Execution Engine (`apps/api/src/engine`)**: Topological DAG sorting (Kahn's algorithm), cycle detection, asynchronous data passing, timeout control.
4. **Distributed Workers (`apps/api/src/workers`)**: BullMQ backed by Redis for concurrent horizontal worker processing and recurring cron schedules.
5. **Node Registry (`apps/api/src/nodes`)**: Extensible registry pattern allowing custom node definitions via standard contracts.

---

## Built-In Node Registry

AutoZure ships with 14 production-grade nodes out of the box:

| Category | Node | Description |
| :--- | :--- | :--- |
| **Triggers** | `trigger.manual` | Trigger workflow manually via UI or REST API with optional custom payload |
| | `trigger.webhook` | Secure webhook URL trigger supporting GET, POST, PUT, PATCH, DELETE |
| | `trigger.schedule` | Cron-based repeatable scheduling with BullMQ |
| **Actions** | `action.http` | Full HTTP client (Axios) supporting all methods, headers, auth, and timeouts |
| | `action.delay` | Pauses execution for a specified duration (ms/s/m) with abort signal handling |
| | `action.code` | Executes custom JavaScript logic in a sandboxed execution context |
| **Logic** | `logic.condition` | 11 comparison operators with branching (`true` / `false` paths) |
| | `logic.merge` | Merges multi-branch input streams (combine, append, first, second) |
| **Data** | `data.transform` | Reshape and map JSON fields using keypath templates |
| | `data.setVariable` | Add or overwrite key-value pairs on the pipeline data payload |
| **AI** | `ai.openai` | GPT-4o, GPT-4o Mini, GPT-3.5 with structured JSON mode and template interpolation |
| | `ai.gemini` | Google Gemini 1.5 Pro, Flash, and 2.0 Flash models with JSON output mode |
| | `ai.anthropic` | Anthropic Claude 3.5 Sonnet and Haiku with system instructions and token controls |
| **Utils** | `util.debug` | Telemetry inspector for debugging data passing without payload mutation |

---

## Quickstart with Docker Compose

The fastest way to spin up the entire AutoZure stack (PostgreSQL, Redis, API, and Next.js Web):

```bash
# 1. Clone the repository
git clone <repo-url> autozure
cd autozure

# 2. Copy the environment variables
cp .env.example .env

# 3. Launch all services
docker compose -f docker/docker-compose.yml up --build -d
```

- **Frontend Dashboard:** [http://localhost:3000](http://localhost:3000)
- **API Server:** [http://localhost:3001](http://localhost:3001)
- **API Health Check:** [http://localhost:3001/health](http://localhost:3001/health)

---

## Local Development Setup

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.15.0
- PostgreSQL >= 15
- Redis >= 7

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment

```bash
# Root
cp .env.example .env

# API
cp apps/api/.env.example apps/api/.env

# Web
cp apps/web/.env.example apps/web/.env
```

### 3. Run Database Migrations

```bash
pnpm db:generate
pnpm db:migrate
```

### 4. Start Development Servers

```bash
pnpm dev
```

This will run Turborepo dev tasks in parallel:
- API server with live reload on `http://localhost:3001`
- Next.js development server on `http://localhost:3000`

---

## Running Automated Tests

AutoZure includes unit and integration tests covering graph validation, cycle detection, cryptographic encryption, and node execution:

```bash
# Run API test suite
pnpm --filter=@autozure/api test
```

---

## REST API Reference

### Authentication
- `POST /api/v1/auth/register` — Register new user
- `POST /api/v1/auth/login` — Sign in and receive JWT access/refresh tokens
- `POST /api/v1/auth/refresh` — Rotate access token
- `POST /api/v1/auth/logout` — Revoke active refresh token
- `GET  /api/v1/auth/me` — Retrieve current user profile

### Workspaces
- `GET    /api/v1/workspaces` — List user workspaces
- `POST   /api/v1/workspaces` — Create new workspace
- `GET    /api/v1/workspaces/:id` — Get workspace details
- `PATCH  /api/v1/workspaces/:id` — Update workspace
- `DELETE /api/v1/workspaces/:id` — Remove workspace

### Workflows
- `GET    /api/v1/workflows` — List workflows in active workspace
- `POST   /api/v1/workflows` — Create new workflow
- `GET    /api/v1/workflows/nodes` — Fetch available node definitions schema
- `GET    /api/v1/workflows/:id` — Get workflow definition and graph
- `PATCH  /api/v1/workflows/:id` — Update graph and create version snapshot
- `DELETE /api/v1/workflows/:id` — Delete workflow
- `POST   /api/v1/workflows/:id/execute` — Trigger manual execution
- `GET    /api/v1/workflows/:id/versions` — List historical version snapshots

### Executions & Telemetry
- `GET  /api/v1/executions` — List executions with status filter
- `GET  /api/v1/executions/stats` — Workspace execution metrics
- `GET  /api/v1/executions/:id` — Execution details and node results
- `POST /api/v1/executions/:id/cancel` — Abort running execution
- `GET  /api/v1/executions/:id/logs` — Real-time execution logs

### Credentials
- `GET    /api/v1/credentials` — List credentials (values masked)
- `POST   /api/v1/credentials` — Create encrypted credential (AES-256-GCM)
- `PATCH  /api/v1/credentials/:id` — Update credential
- `DELETE /api/v1/credentials/:id` — Delete credential

### Webhooks
- `ALL /webhooks/:path` — Ingest external webhook triggers

---

## Security & Isolation

1. **At-Rest Encryption:** All third-party API keys and credentials are encrypted using AES-256-GCM with unique initialization vectors (IV).
2. **Untrusted Code Execution:** The `action.code` node runs with bounded scope and strict execution timeouts. For multi-tenant production setups, an isolated V8 container (`isolated-vm` / gVisor) is recommended.
3. **Workspace Isolation:** All database queries enforce workspace ownership checks via row-level security design patterns.
4. **Rate Limiting:** IP and user-based sliding window rate limits protect auth and execution endpoints against abuse.

---

## License

MIT License. Designed and built from scratch as an original self-hosted automation solution.
