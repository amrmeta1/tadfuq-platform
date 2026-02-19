# CashFlow.ai — Multi-Tenant Financial Platform

Production-grade multi-tenant SaaS backend for **CashFlow.ai**, an agentic financial management platform targeting GCC SMEs (Saudi Arabia, Qatar, UAE).

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        API Gateway / LB                          │
│                 (X-Tenant-ID header fallback)                    │
└───────────┬──────────────────────────────┬──────────────────────┘
            │ :8080                         │ :8081
┌───────────▼───────────┐     ┌────────────▼────────────────────┐
│   Tenant Service (Go) │     │  Ingestion Service (Go)         │
│                       │     │                                 │
│  Middleware → Handler  │     │  CSV Import / Bank Sync /       │
│  → UseCase → Repo     │     │  Accounting Sync → RabbitMQ     │
│                       │     │  Command Consumer Worker         │
└───────────┬───────────┘     └──┬──────────────┬───────────────┘
            │                    │              │
  ┌─────────▼─────────┐  ┌──────▼────┐  ┌─────▼──────────────┐
  │  PostgreSQL 16     │  │ Keycloak  │  │  RabbitMQ 3.13     │
  │  (multi-tenant)    │  │ 24 (OIDC) │  │  (events+commands) │
  └────────────────────┘  └───────────┘  └────────────────────┘
```

### Clean Architecture Layers

| Layer | Package | Responsibility |
|-------|---------|----------------|
| **Domain** | `internal/domain` | Entities, repo interfaces, context helpers, errors, role validation |
| **Auth** | `internal/auth` | JWKS client, JWT validator, permission matrix |
| **Events** | `internal/events` | NATS JetStream publisher, consumer worker, envelope schema, OTel propagation |
| **MQ** | `internal/adapter/mq` | RabbitMQ publisher, consumer, topology (exchanges/queues/DLQ), envelope |
| **Use Case** | `internal/usecase` | Business logic, RBAC enforcement, audit logging |
| **Adapter/HTTP** | `internal/adapter/http` | chi router, handlers, response helpers |
| **Adapter/DB** | `internal/adapter/db` | PostgreSQL repository implementations (pgx) |
| **Integrations** | `internal/adapter/integrations` | Bank/Accounting provider interfaces + stubs |
| **Middleware** | `internal/middleware` | Keycloak JWT auth, tenant resolution, user provisioning, RBAC |
| **Config** | `internal/config` | Environment-based configuration (envconfig) |
| **Observability** | `internal/observability` | OpenTelemetry tracer initialization |

### Multi-Tenancy Model

- **Row-level isolation**: Every tenant-scoped entity has a `tenant_id` foreign key
- **Tenant context**: Resolved from JWT custom claim `tenant_id` or `X-Tenant-ID` header
- **Middleware chain**: `KeycloakAuth → TenantFromHeader → ProvisionUser → RequirePermission`
- Every API request within tenant scope is validated for membership

### AuthN/AuthZ

- **Identity Provider**: Keycloak (OIDC) — all authentication handled externally
- **JWT validation**: RS256 signatures verified via JWKS endpoint with key caching
- **User provisioning**: Automatic upsert from JWT claims (sub, email) on first request
- **RBAC roles** (Keycloak client roles): `tenant_admin`, `owner`, `finance_manager`, `accountant_readonly`
- **Permission matrix**: Roles map to fine-grained permissions (`tenant:create`, `member:add`, etc.)
- **Enforcement**: Both middleware-level (`RequirePermission`) and usecase-level checks
- **No local password auth** — users authenticate via Keycloak's token endpoint

### RabbitMQ Event & Command Backbone (Ingestion Service)

- **Broker**: RabbitMQ 3.13 with management plugin
- **Envelope schema**: `event_id`, `event_type`, `tenant_id`, `occurred_at`, `version`, `idempotency_key`, `trace_id`, `payload`
- **At-least-once delivery**: Publisher confirms + manual consumer ACK
- **Idempotency**: `idempotency_keys` table for application-level dedup
- **Retry**: Failed messages dead-letter to retry queues with TTL (5s → 30s → DLQ)

#### Exchanges & Queues

| Exchange | Type | Purpose |
|----------|------|---------|
| `cashflow.events` | topic | Domain events (transactions.ingested, invoices.synced) |
| `cashflow.commands` | direct | Command/job dispatch (ingestion.sync_bank, categorization.run) |
| `cashflow.retry` | direct | Retry routing (retry.5s, retry.30s) |

| Queue | Binds To | Description |
|-------|----------|-------------|
| `q.cashflow.transactions.ingested` | events / `transactions.ingested` | Downstream consumers |
| `q.cashflow.commands.ingestion` | commands / `ingestion.sync_bank`, etc. | Ingestion worker |
| `q.cashflow.retry.5s` | retry / `retry.5s` | 5s delay retry (dead-letters back to commands) |
| `q.cashflow.retry.30s` | retry / `retry.30s` | 30s delay retry |
| `q.cashflow.dlq` | — | Dead-letter queue (terminal failures) |

### NATS JetStream (Tenant Service)

- **Broker**: NATS with JetStream (file-backed, work-queue retention)
- **Used by**: Tenant Service for domain events
- **Streams**: `CASHFLOW`, `CASHFLOW_DLQ`

### Audit & Compliance

Every security-relevant event is captured in `audit_logs` with `actor_sub` (Keycloak subject):
- Tenant creation/update/deletion
- Member added/removed, role changes
- Token validation failures
- Access denied events

## Repository Structure

```
cashflow/
├── cmd/
│   ├── tenant-service/          # Tenant service entrypoint (:8080)
│   ├── ingestion-service/       # Ingestion service entrypoint (:8081)
│   └── worker-example/          # Example NATS consumer worker
├── internal/
│   ├── auth/                    # JWKS client, JWT validator, permissions
│   ├── events/                  # NATS JetStream (tenant-service)
│   ├── domain/                  # Entities, interfaces, errors, context
│   ├── usecase/                 # Business logic (tenant, member, ingestion)
│   ├── adapter/
│   │   ├── http/                # Handlers, routers, response helpers
│   │   ├── db/                  # PostgreSQL repositories
│   │   ├── mq/                  # RabbitMQ publisher, consumer, topology
│   │   └── integrations/        # Bank/Accounting provider interfaces + stubs
│   ├── middleware/               # Keycloak JWT, RBAC, tenant, user provisioning
│   ├── config/                  # Env-based config (tenant + ingestion)
│   └── observability/           # OpenTelemetry setup
├── migrations/                  # golang-migrate SQL files
├── openapi/                     # OpenAPI specs (openapi.yaml, ingestion.yaml)
├── deploy/
│   ├── docker/                  # Dockerfiles + docker-compose
│   ├── keycloak/                # Keycloak realm export JSON
│   └── terraform/               # AWS infrastructure skeleton
├── .github/workflows/           # CI pipeline
├── Makefile                     # Dev commands
└── .env.example                 # Configuration template
```

## Quick Start

### Prerequisites

- Go 1.22+
- Docker & Docker Compose
- [golang-migrate](https://github.com/golang-migrate/migrate) CLI

### 1. Start infrastructure

```bash
# Start all infra (postgres, keycloak, nats, rabbitmq)
make up-deps

# Or start everything including both services
make up
```

- **Keycloak admin console**: http://localhost:8180 (`admin` / `admin`)
- **RabbitMQ management UI**: http://localhost:15672 (`guest` / `guest`)

### 2. Run migrations

```bash
make migrate
```

This applies both `000001_init_schema` (tenants/users/memberships/audit) and `000002_ingestion_schema` (bank_accounts/transactions/jobs/idempotency).

### 3. Run locally (without Docker)

```bash
cp .env.example .env

# Terminal 1: tenant-service on :8080
make run

# Terminal 2: ingestion-service on :8081
make run-ingestion
```

### 4. Test Tenant Service API

```bash
# Health check
curl http://localhost:8080/healthz

# Get a Keycloak access token (test user: admin@demo.com / admin123)
TOKEN=$(make keycloak-token)

# Create a tenant
curl -X POST http://localhost:8080/tenants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name": "Finch Capital", "slug": "finch-capital"}'
```

### 5. Test Ingestion Service — CSV Import End-to-End

```bash
TOKEN=$(make keycloak-token)
TENANT_ID="<tenant-id-from-step-4>"

# 1. Register a bank account
curl -X POST "http://localhost:8081/tenants/$TENANT_ID/bank-accounts" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"nickname": "SNB Main Account", "currency": "SAR", "provider": "manual"}'

# Note the account ID from the response
ACCOUNT_ID="<account-id>"

# 2. Create a sample CSV file
cat > /tmp/transactions.csv << 'EOF'
date,amount,currency,description,counterparty,category
2024-01-15,5000.00,SAR,Invoice payment received,ABC Corp,revenue
2024-01-16,-1200.50,SAR,Office rent,Al Faisaliah Tower,rent
2024-01-17,-350.00,SAR,STC internet bill,STC,utilities
2024-01-18,12500.00,SAR,Client project milestone,XYZ Ltd,revenue
2024-01-19,-800.00,SAR,Employee salary advance,Mohammed Ali,payroll
EOF

# 3. Upload CSV
curl -X POST "http://localhost:8081/tenants/$TENANT_ID/imports/bank-csv" \
  -H "Authorization: Bearer $TOKEN" \
  -F "account_id=$ACCOUNT_ID" \
  -F "file=@/tmp/transactions.csv"

# Response shows: total_rows, inserted, duplicates, errors

# 4. Query transactions
curl "http://localhost:8081/tenants/$TENANT_ID/transactions?from=2024-01-01&to=2024-12-31" \
  -H "Authorization: Bearer $TOKEN"

# 5. Re-upload the same CSV (deduplication test — should show 0 inserted, 5 duplicates)
curl -X POST "http://localhost:8081/tenants/$TENANT_ID/imports/bank-csv" \
  -H "Authorization: Bearer $TOKEN" \
  -F "account_id=$ACCOUNT_ID" \
  -F "file=@/tmp/transactions.csv"
```

### 6. Test Sync Commands & RabbitMQ

```bash
# Enqueue a bank sync command (stub — completes immediately)
curl -X POST "http://localhost:8081/tenants/$TENANT_ID/sync/bank" \
  -H "Authorization: Bearer $TOKEN"

# Enqueue an accounting sync command
curl -X POST "http://localhost:8081/tenants/$TENANT_ID/sync/accounting" \
  -H "Authorization: Bearer $TOKEN"
```

**Viewing messages in RabbitMQ Management UI:**

1. Open http://localhost:15672 (login: `guest` / `guest`)
2. Go to **Queues and Streams** tab
3. You'll see: `q.cashflow.transactions.ingested`, `q.cashflow.commands.ingestion`, retry queues, and DLQ
4. Click on any queue → **Get messages** to inspect message payloads
5. The `Exchanges` tab shows `cashflow.events`, `cashflow.commands`, `cashflow.retry` with their bindings

### Test Users (Keycloak)

| Email | Password | Role |
|-------|----------|------|
| `admin@demo.com` | `admin123` | `tenant_admin` |
| `owner@demo.com` | `owner123` | `owner` |
| `accountant@demo.com` | `accountant123` | `accountant_readonly` |

## Available Make Commands

| Command | Description |
|---------|-------------|
| `make up` | Start all containers (postgres, keycloak, nats, rabbitmq, services) |
| `make down` | Stop and remove containers |
| `make up-deps` | Start infra only (postgres, keycloak, nats, rabbitmq) |
| `make run` | Run tenant-service locally (:8080) |
| `make run-ingestion` | Run ingestion-service locally (:8081) |
| `make run-worker` | Run example NATS consumer worker |
| `make build` | Build tenant-service binary |
| `make build-ingestion` | Build ingestion-service binary |
| `make build-all` | Build all service binaries |
| `make migrate` | Apply DB migrations (golang-migrate) |
| `make migrate-down` | Roll back last migration |
| `make migrate-create NAME=x` | Create new migration |
| `make test` | Run tests |
| `make lint` | Run golangci-lint |
| `make docker-build` | Build tenant-service Docker image |
| `make docker-build-ingestion` | Build ingestion-service Docker image |
| `make docker-build-all` | Build all Docker images |
| `make keycloak-token` | Get test access token |

## API Documentation

### Tenant Service (`:8080`)

Full OpenAPI spec: [`openapi/openapi.yaml`](openapi/openapi.yaml)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/healthz` | No | Health check |
| GET | `/me` | Yes | Current user profile |
| POST | `/tenants` | Yes | Create tenant |
| GET | `/tenants/{id}` | Yes | Get tenant |
| POST | `/tenants/{id}/members` | Yes | Add member |
| GET | `/tenants/{id}/members` | Yes | List members |
| DELETE | `/tenants/{id}/members/{mid}` | Yes | Remove member |
| POST | `/tenants/{id}/roles` | Yes | Change member role |
| GET | `/audit-logs` | Yes | List audit logs |

### Ingestion Service (`:8081`)

Full OpenAPI spec: [`openapi/ingestion.yaml`](openapi/ingestion.yaml)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/healthz` | No | Health check |
| POST | `/tenants/{id}/imports/bank-csv` | Yes | Upload CSV bank transactions |
| GET | `/tenants/{id}/transactions` | Yes | List transactions (with date/account filters) |
| POST | `/tenants/{id}/bank-accounts` | Yes | Register bank account |
| POST | `/tenants/{id}/sync/bank` | Yes | Enqueue bank sync command |
| POST | `/tenants/{id}/sync/accounting` | Yes | Enqueue accounting sync command |

## RBAC Permission Matrix

| Permission | tenant_admin | owner | finance_manager | accountant_readonly |
|-----------|:---:|:---:|:---:|:---:|
| `tenant:create` | ✓ | ✓ | | |
| `tenant:read` | ✓ | ✓ | ✓ | ✓ |
| `tenant:update` | ✓ | ✓ | | |
| `tenant:delete` | ✓ | | | |
| `member:add` | ✓ | ✓ | | |
| `member:remove` | ✓ | ✓ | | |
| `member:read` | ✓ | ✓ | ✓ | ✓ |
| `member:role_change` | ✓ | | | |
| `audit:read` | ✓ | ✓ | ✓ | |
| `ingestion:import` | ✓ | ✓ | ✓ | |
| `ingestion:read` | ✓ | ✓ | ✓ | ✓ |
| `ingestion:sync` | ✓ | ✓ | ✓ | |
| `bank_account:create` | ✓ | ✓ | ✓ | |
| `bank_account:read` | ✓ | ✓ | ✓ | ✓ |

## Ingestion Service — Data Model

### Tables (migration `000002`)

| Table | Description |
|-------|-------------|
| `bank_accounts` | Registered bank accounts per tenant (provider, currency, status) |
| `raw_bank_transactions` | Immutable audit trail of raw imported data (JSONB) |
| `bank_transactions` | Normalized, deduplicated transactions with deterministic hash |
| `ingestion_jobs` | Job tracking for CSV imports and sync operations |
| `idempotency_keys` | At-least-once processing guard for RabbitMQ consumers |

### Deduplication

Each transaction gets a **deterministic SHA-256 hash** computed from: `account_id | date | amount | description | counterparty`. A unique index on `(tenant_id, hash)` prevents duplicate inserts. Re-uploading the same CSV results in 0 new insertions.

## Future Services (Phase 3+)

- **Cashflow Engine** — Real-time cash position calculation
- **Forecast Engine** — AI-powered cash flow prediction
- **Alert Service** — Threshold-based notifications
- **AI Orchestration** — LLM-based financial insights agent

Services communicate via RabbitMQ events and share tenant identity context via Keycloak JWT propagation.

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Language | Go 1.22+ |
| HTTP Router | chi/v5 |
| Database | PostgreSQL 16 |
| DB Driver | pgx/v5 |
| Identity Provider | Keycloak 24 (OIDC / RS256) |
| JWT Validation | JWKS (golang-jwt/v5) |
| Message Queue | RabbitMQ 3.13 (amqp091-go) |
| Event Backbone | NATS JetStream (tenant-service) |
| Migrations | golang-migrate |
| Config | envconfig |
| Logging | zerolog |
| Observability | OpenTelemetry |
| Containerization | Docker |
| CI/CD | GitHub Actions |
| IaC | Terraform (AWS) |
