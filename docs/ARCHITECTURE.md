# System Architecture

## Overview

TadFuq.ai (CashFlow) is a multi-tenant SaaS platform for financial management targeting GCC SMEs. The system follows Clean Architecture principles with clear separation of concerns.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                           │
│                  No Authentication Required                       │
└───────────┬──────────────────────────────┬──────────────────────┘
            │                               │
┌───────────▼───────────┐     ┌────────────▼────────────────────┐
│   Tenant Service (Go) │     │  Ingestion Service (Go)         │
│                       │     │                                 │
│  Middleware → Handler │     │  CSV Import / Bank Sync /       │
│  → UseCase → Repo     │     │  Accounting Sync → RabbitMQ     │
│                       │     │  Command Consumer Worker         │
└───────────┬───────────┘     └──┬──────────────┬───────────────┘
            │                    │              │
  ┌─────────▼─────────┐  ┌──────▼────┐  ┌─────▼──────────────┐
  │  PostgreSQL 16     │  │ (Removed) │  │  RabbitMQ 3.13     │
  │  (multi-tenant)    │  │           │  │  (events+commands) │
  └────────────────────┘  └───────────┘  └────────────────────┘
```

## Technology Stack

### Backend
- **Language:** Go 1.21+
- **Framework:** Chi router
- **Database:** PostgreSQL 16 with pgx driver
- **Message Queue:** RabbitMQ 3.13
- **Event Streaming:** NATS JetStream (Tenant Service)
- **Authentication:** Removed (previously Keycloak)

### Frontend
- **Framework:** Next.js 14 (App Router)
- **UI:** React 18, TailwindCSS, shadcn/ui
- **State:** React Query
- **Authentication:** None (removed)

### Infrastructure
- **Container Orchestration:** Kubernetes (EKS) - Currently destroyed
- **CI/CD:** ArgoCD GitOps - Currently destroyed
- **IaC:** Terraform
- **Monitoring:** OpenTelemetry

## Clean Architecture Layers

### Domain Layer (`internal/domain`)
- Pure business entities
- Repository interfaces
- Domain errors
- No external dependencies

### Use Case Layer (`internal/usecase`)
- Business logic orchestration
- RBAC enforcement (currently bypassed)
- Audit logging
- Transaction management

### Adapter Layer
- **HTTP** (`internal/adapter/http`): REST API handlers
- **Database** (`internal/adapter/db`): PostgreSQL repositories
- **MQ** (`internal/adapter/mq`): RabbitMQ publisher/consumer
- **Integrations** (`internal/adapter/integrations`): Bank/Accounting providers

### Infrastructure Layer
- **Middleware** (`internal/middleware`): Auth, tenant resolution, logging
- **Config** (`internal/config`): Environment configuration
- **Observability** (`internal/observability`): OpenTelemetry setup

## Multi-Tenancy Model

### Row-Level Isolation
- Every tenant-scoped entity has `tenant_id` foreign key
- Database constraints enforce data isolation
- No shared data between tenants

### Tenant Context Resolution
1. Extract from JWT custom claim `tenant_id` (when auth was enabled)
2. Fallback to `X-Tenant-ID` header
3. Validate tenant membership
4. Inject into request context

### Middleware Chain
```
Request → KeycloakAuth (removed) → TenantFromHeader → 
ProvisionUser (removed) → TenantFromRouteParam → 
RequireTenantMembership → RequirePermission → Handler
```

## Authentication & Authorization (Removed)

**Note:** All authentication has been removed from the frontend. The system currently operates without login requirements.

Previously used:
- **Identity Provider:** Keycloak (OIDC)
- **JWT Validation:** RS256 signatures via JWKS
- **RBAC Roles:** `tenant_admin`, `owner`, `finance_manager`, `accountant_readonly`

Current state:
- Frontend: Mock user with admin permissions
- Backend: Still has auth middleware but not enforced

## Event-Driven Architecture

### RabbitMQ (Ingestion Service)

#### Exchanges
- `cashflow.events` (topic): Domain events
- `cashflow.commands` (direct): Command dispatch
- `cashflow.retry` (direct): Retry routing

#### Queues
- `q.cashflow.transactions.ingested`: Transaction events
- `q.cashflow.commands.ingestion`: Ingestion jobs
- `q.cashflow.retry.5s`: 5-second retry delay
- `q.cashflow.retry.30s`: 30-second retry delay
- `q.cashflow.dlq`: Dead-letter queue

#### Message Envelope
```json
{
  "event_id": "uuid",
  "event_type": "transactions.ingested",
  "tenant_id": "uuid",
  "occurred_at": "2026-03-07T00:00:00Z",
  "version": "1.0",
  "idempotency_key": "unique-key",
  "trace_id": "otel-trace-id",
  "payload": {}
}
```

### NATS JetStream (Tenant Service)

- **Streams:** `CASHFLOW`, `CASHFLOW_DLQ`
- **Retention:** Work-queue (file-backed)
- **Consumers:** Durable with acknowledgment

## Data Flow

### Transaction Ingestion
```
CSV Upload → Ingestion Service → Parse & Validate → 
Store Raw Transactions → Publish Event → 
RabbitMQ → Consumer → Categorize → Store Processed
```

### Tenant Operations
```
API Request → Middleware (Tenant Resolution) → 
Use Case (Business Logic) → Repository (DB) → 
Event Publisher (NATS) → Audit Log
```

## Security Considerations

### Current State (No Auth)
- ⚠️ **No authentication required**
- ⚠️ **All users have admin permissions**
- ⚠️ **Tenant ID from header (not validated)**

### Previously Implemented
- JWT signature verification
- Role-based access control
- Audit logging for all operations
- Rate limiting per tenant

## Scalability

### Horizontal Scaling
- Stateless services (can scale pods)
- Database connection pooling
- Message queue for async processing

### Performance Optimizations
- Database indexes on tenant_id
- Query result caching (planned)
- CDN for static assets (planned)

## Monitoring & Observability

### OpenTelemetry
- Distributed tracing
- Metrics collection
- Log correlation

### Health Checks
- `/health` endpoint
- Database connectivity
- Message queue connectivity

## Current Infrastructure Status

**⚠️ All infrastructure has been destroyed:**
- EKS Cluster: Deleted
- RDS Database: Deleted
- Load Balancers: Deleted
- VPC & Networking: Deleted
- ECR Repositories: Deleted

**To redeploy:**
```bash
cd infra/terraform
terraform init
terraform apply
```

## Future Enhancements

1. **Re-enable Authentication** (if needed)
2. **Implement Caching Layer** (Redis)
3. **Add Search** (Elasticsearch)
4. **ML-based Categorization**
5. **Real-time Bank Sync**
6. **Mobile Apps**
