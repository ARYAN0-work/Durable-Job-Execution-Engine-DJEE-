# Durable Job Execution Engine (DJEE)

A TypeScript-based backend project focused on building a reliable, persistent, and fault-tolerant job execution engine.

The goal is to develop an engine capable of accepting jobs, persisting their state, executing them asynchronously, recovering from failures, and supporting reliable job processing.

**Current phase:** Application foundation and lifecycle management.

---

## Technology Stack

| Category        | Technology           |
| --------------- | -------------------- |
| Runtime         | Node.js              |
| Language        | TypeScript           |
| Package Manager | pnpm                 |
| HTTP Framework  | Express.js           |
| Database        | PostgreSQL           |
| Database Driver | node-postgres (`pg`) |
| Validation      | Zod                  |
| Logging         | Pino                 |
| Testing         | Vitest               |
| Code Quality    | ESLint, Prettier     |
| Git Hooks       | Husky                |

---

## Project Structure

```text
src/
├── app.ts
├── index.ts
├── server.ts
│
├── bootstrap/
│   ├── initialize.ts
│   ├── startup.ts
│   └── shutdown.ts
│
├── config/
│   ├── env-schema.ts
│   └── env.ts
│
└── infrastructure/
    ├── database/
    │   └── pool.ts
    │
    └── logging/
        └── logger.ts

tests/
├── app.test.ts
├── server.test.ts
│
├── bootstrap/
│   ├── startup.test.ts
│   └── shutdown.test.ts
│
├── config/
│   └── env.test.ts
│
└── infrastructure/
    └── database/
        └── pool.test.ts
```

### Architectural Components

- **Application:** Creates and configures the Express application.
- **Server:** Manages HTTP server startup and graceful closure.
- **Bootstrap:** Coordinates application initialization, startup, and shutdown.
- **Configuration:** Validates environment variables using Zod.
- **Database:** Manages PostgreSQL connections through a connection pool.
- **Logging:** Provides structured application logging using Pino.

---

## Current Features

- Express application with JSON request parsing.
- Health check endpoint.
- Environment variable validation.
- PostgreSQL connection pooling.
- Database connectivity verification during initialization.
- Structured logging.
- Configurable HTTP server port.
- Graceful HTTP server shutdown.
- SIGINT and SIGTERM shutdown handling.
- Startup and shutdown orchestration.
- Resource cleanup with error handling.
- Automated unit and integration tests.

---

## Prerequisites

Before running the project, install:

- Node.js
- pnpm
- PostgreSQL

A PostgreSQL database and the credentials specified in your environment configuration must be available.

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/ARYAN0-work/Durable-Job-Execution-Engine-DJEE-.git

cd Durable-Job-Execution-Engine-DJEE-
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

Create your local environment file:

```bash
cp .env.example .env
```

Update `DATABASE_URL` with your PostgreSQL credentials.

### 4. Start the development server

```bash
pnpm dev
```

The development server starts using `tsx` and automatically restarts when source files change.

Default address:

```text
http://localhost:3000
```

---

## Environment Variables

| Variable                   | Description                    | Default       |
| -------------------------- | ------------------------------ | ------------- |
| `DATABASE_URL`             | PostgreSQL connection string   | Required      |
| `NODE_ENV`                 | Application environment        | `development` |
| `PORT`                     | HTTP server port               | `3000`        |
| `LOG_LEVEL`                | Logging verbosity              | `info`        |
| `DB_POOL_MAX`              | Maximum database connections   | `10`          |
| `DB_IDLE_TIMEOUT_MS`       | Idle connection timeout        | `30000`       |
| `DB_CONNECTION_TIMEOUT_MS` | Connection acquisition timeout | `5000`        |

Environment variables are validated at application startup using Zod.

---

## API

### Health Check

**Endpoint:**

```http
GET /health
```

**Successful response:**

```json
{
  "status": "ok",
  "service": "durable-job-execution-engine"
}
```

Returns HTTP `200` when the Express application is responding.

---

## Development Commands

| Command             | Description                  |
| ------------------- | ---------------------------- |
| `pnpm dev`          | Start development server     |
| `pnpm build`        | Compile TypeScript           |
| `pnpm start`        | Start compiled application   |
| `pnpm test`         | Run automated tests          |
| `pnpm typecheck`    | Run TypeScript type checking |
| `pnpm lint`         | Run ESLint                   |
| `pnpm format`       | Format project files         |
| `pnpm format:check` | Check formatting             |

### Run the production build

```bash
pnpm build
pnpm start
```

The production application runs from the compiled `dist/` directory.

---

## Testing

The project uses Vitest.

Run the complete test suite:

```bash
pnpm test
```

Run tests with coverage:

```bash
pnpm exec vitest run --coverage
```

The test suite covers:

- Environment configuration validation.
- PostgreSQL connection pool behavior.
- Express application endpoints.
- HTTP server lifecycle.
- Application startup orchestration.
- Application shutdown orchestration.
- Startup and cleanup failure handling.

---

## Development Roadmap

The project is being developed incrementally.

### Phase 1 — Application Foundation

- [x] TypeScript project setup.
- [x] PostgreSQL integration.
- [x] Environment configuration.
- [x] Structured logging.
- [x] Express application.
- [x] HTTP server lifecycle.
- [x] Startup orchestration.
- [x] Shutdown orchestration.
- [x] Automated foundation tests.

### Phase 2 — Job Management and Persistence

- [ ] Job data model.
- [ ] PostgreSQL job schema.
- [ ] Job state machine.
- [ ] Job submission API.
- [ ] Persistent job storage.
- [ ] Job retrieval and status tracking.

### Phase 3 — Execution Engine

- [ ] Worker architecture.
- [ ] Job claiming and execution.
- [ ] Concurrency management.
- [ ] Retry mechanisms.
- [ ] Failure handling.

### Phase 4 — Durability and Reliability

- [ ] Crash recovery.
- [ ] Stalled job recovery.
- [ ] Execution guarantees.
- [ ] Distributed worker coordination.
- [ ] Observability and metrics.

### Phase 5 — Production Readiness

- [ ] Comprehensive integration testing.
- [ ] Performance testing.
- [ ] Security improvements.
- [ ] Containerization.
- [ ] Deployment and monitoring.

---

## Project Philosophy

The project emphasizes understanding and implementing backend engineering concepts rather than simply assembling libraries.

Key engineering principles:

- Explicit application lifecycle management.
- Persistent state.
- Reliable failure handling.
- Separation of concerns.
- Testable architecture.
- Incremental development.
- Production-oriented design.

---

**DJEE — Building reliable job execution, one layer at a time.**
