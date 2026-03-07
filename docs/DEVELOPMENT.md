# Development Guide

## Getting Started

### Prerequisites

- Go 1.21+
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 16
- RabbitMQ 3.13
- Make

### Clone Repository

```bash
git clone https://github.com/amrmeta1/tadfuq-platform.git
cd tadfuq-platform
```

## Local Development Setup

### 1. Start Infrastructure Services

```bash
# Start PostgreSQL, RabbitMQ, NATS
cd infra/docker
docker-compose up -d

# Verify services are running
docker-compose ps
```

### 2. Database Setup

```bash
# Run migrations
cd backend/migrations
export DATABASE_URL="postgresql://cashflow:cashflow@localhost:5432/cashflow?sslmode=disable"

# Install golang-migrate (if not installed)
# macOS
brew install golang-migrate

# Run migrations
migrate -path . -database $DATABASE_URL up
```

### 3. Backend Development

#### Tenant Service

```bash
cd backend

# Install dependencies
go mod download

# Run service
go run cmd/tenant-service/main.go

# Or use Make
make run-tenant

# Service will be available at http://localhost:8080
```

#### Ingestion Service

```bash
cd backend

# Run service
go run cmd/ingestion-service/main.go

# Or use Make
make run-ingestion

# Service will be available at http://localhost:8081
```

### 4. Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Frontend will be available at http://localhost:3000
```

## Project Structure

```
tadfuq-platform/
├── backend/
│   ├── cmd/                    # Application entry points
│   │   ├── tenant-service/
│   │   ├── ingestion-service/
│   │   └── worker-example/
│   ├── internal/               # Internal packages
│   │   ├── domain/            # Domain entities & interfaces
│   │   ├── usecase/           # Business logic
│   │   ├── adapter/           # External adapters
│   │   │   ├── http/          # HTTP handlers
│   │   │   ├── db/            # Database repositories
│   │   │   ├── mq/            # RabbitMQ
│   │   │   └── integrations/  # Bank/Accounting APIs
│   │   ├── middleware/        # HTTP middleware
│   │   ├── config/            # Configuration
│   │   └── observability/     # OpenTelemetry
│   ├── migrations/            # Database migrations
│   └── go.mod
├── frontend/
│   ├── app/                   # Next.js App Router
│   ├── components/            # React components
│   ├── lib/                   # Utilities & hooks
│   └── public/                # Static assets
├── infra/
│   ├── terraform/             # Infrastructure as Code
│   ├── helm/                  # Kubernetes Helm charts
│   ├── docker/                # Docker configs
│   └── scripts/               # Deployment scripts
└── docs/                      # Documentation
```

## Development Workflow

### Backend Development

#### 1. Create New Feature

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes following Clean Architecture
# Domain → Use Case → Adapter → Handler
```

#### 2. Add Tests

```bash
# Run tests
go test ./...

# Run tests with coverage
go test -cover ./...

# Run specific package tests
go test ./internal/domain/...
```

#### 3. Code Quality

```bash
# Format code
go fmt ./...

# Run linter
golangci-lint run

# Or use Make
make lint
```

### Frontend Development

#### 1. Component Development

```bash
# Create new component
cd frontend/components
mkdir my-component
touch my-component/index.tsx
```

#### 2. Add Tests

```bash
# Run tests
npm test

# Run tests in watch mode
npm test -- --watch
```

#### 3. Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run type-check
```

## API Development

### Adding New Endpoint

#### 1. Define Domain Entity

```go
// backend/internal/domain/entity.go
type MyEntity struct {
    ID        string    `json:"id"`
    TenantID  string    `json:"tenant_id"`
    Name      string    `json:"name"`
    CreatedAt time.Time `json:"created_at"`
}
```

#### 2. Define Repository Interface

```go
// backend/internal/domain/repository.go
type MyEntityRepository interface {
    Create(ctx context.Context, entity *MyEntity) error
    GetByID(ctx context.Context, id string) (*MyEntity, error)
    List(ctx context.Context, tenantID string) ([]*MyEntity, error)
}
```

#### 3. Implement Repository

```go
// backend/internal/adapter/db/my_entity_repo.go
type myEntityRepo struct {
    db *pgxpool.Pool
}

func (r *myEntityRepo) Create(ctx context.Context, entity *MyEntity) error {
    // Implementation
}
```

#### 4. Create Use Case

```go
// backend/internal/usecase/my_entity.go
type MyEntityUseCase struct {
    repo domain.MyEntityRepository
}

func (uc *MyEntityUseCase) CreateEntity(ctx context.Context, req CreateRequest) error {
    // Business logic
}
```

#### 5. Add HTTP Handler

```go
// backend/internal/adapter/http/my_entity_handler.go
func (h *Handler) CreateMyEntity(w http.ResponseWriter, r *http.Request) {
    // Parse request
    // Call use case
    // Return response
}
```

#### 6. Register Route

```go
// backend/internal/adapter/http/router.go
r.Route("/api/v1/my-entities", func(r chi.Router) {
    r.Post("/", h.CreateMyEntity)
    r.Get("/{id}", h.GetMyEntity)
})
```

## Database Migrations

### Create New Migration

```bash
cd backend/migrations

# Create migration files
migrate create -ext sql -dir . -seq add_my_table

# This creates:
# 000004_add_my_table.up.sql
# 000004_add_my_table.down.sql
```

### Write Migration

```sql
-- 000004_add_my_table.up.sql
CREATE TABLE my_table (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_my_table_tenant_id ON my_table(tenant_id);
```

```sql
-- 000004_add_my_table.down.sql
DROP TABLE IF EXISTS my_table;
```

### Run Migration

```bash
# Up
migrate -path . -database $DATABASE_URL up

# Down
migrate -path . -database $DATABASE_URL down 1

# Force version (if stuck)
migrate -path . -database $DATABASE_URL force 3
```

## Testing

### Unit Tests

```go
// backend/internal/domain/entity_test.go
func TestMyEntity_Validate(t *testing.T) {
    tests := []struct {
        name    string
        entity  *MyEntity
        wantErr bool
    }{
        {
            name: "valid entity",
            entity: &MyEntity{Name: "Test"},
            wantErr: false,
        },
    }
    
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            err := tt.entity.Validate()
            if (err != nil) != tt.wantErr {
                t.Errorf("Validate() error = %v, wantErr %v", err, tt.wantErr)
            }
        })
    }
}
```

### Integration Tests

```go
// backend/internal/adapter/db/my_entity_repo_test.go
func TestMyEntityRepo_Create(t *testing.T) {
    // Setup test database
    db := setupTestDB(t)
    defer db.Close()
    
    repo := NewMyEntityRepo(db)
    
    // Test
    entity := &domain.MyEntity{Name: "Test"}
    err := repo.Create(context.Background(), entity)
    
    assert.NoError(t, err)
    assert.NotEmpty(t, entity.ID)
}
```

## Debugging

### Backend Debugging

```bash
# Run with delve debugger
dlv debug cmd/tenant-service/main.go

# Or use VS Code launch.json
{
    "type": "go",
    "request": "launch",
    "name": "Tenant Service",
    "program": "${workspaceFolder}/backend/cmd/tenant-service"
}
```

### Frontend Debugging

```bash
# Enable debug mode
DEBUG=* npm run dev

# Or use browser DevTools
# Chrome: F12 → Sources → Add breakpoint
```

## Common Tasks

### Reset Database

```bash
# Drop and recreate database
docker-compose down -v
docker-compose up -d postgres

# Run migrations
cd backend/migrations
migrate -path . -database $DATABASE_URL up
```

### Clear RabbitMQ Queues

```bash
# Access RabbitMQ management
open http://localhost:15672
# Login: guest/guest

# Or use CLI
docker exec -it rabbitmq rabbitmqctl purge_queue q.cashflow.commands.ingestion
```

### Rebuild Docker Images

```bash
cd infra/docker
docker-compose build --no-cache
docker-compose up -d
```

## Environment Variables

### Backend (.env)

```bash
# Database
DATABASE_URL=postgresql://cashflow:cashflow@localhost:5432/cashflow?sslmode=disable

# RabbitMQ
RABBITMQ_URL=amqp://guest:guest@localhost:5672/

# NATS
NATS_URL=nats://localhost:4222

# Server
PORT=8080
LOG_LEVEL=debug

# Authentication (removed)
# KEYCLOAK_URL=http://localhost:8081
# KEYCLOAK_REALM=cashflow
```

### Frontend (.env.local)

```bash
# API URL
NEXT_PUBLIC_API_URL=http://localhost:8080

# Development
NODE_ENV=development
```

## Code Style

### Go

- Follow [Effective Go](https://golang.org/doc/effective_go)
- Use `gofmt` for formatting
- Use `golangci-lint` for linting
- Write tests for all business logic

### TypeScript/React

- Follow [Airbnb Style Guide](https://github.com/airbnb/javascript)
- Use ESLint + Prettier
- Use TypeScript strict mode
- Write tests for components

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make commits
git add .
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/my-feature

# Create Pull Request on GitHub
```

### Commit Message Format

```
type(scope): subject

body

footer
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :8080

# Kill process
kill -9 <PID>
```

### Database Connection Failed

```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check connection
psql -h localhost -U cashflow -d cashflow
```

### Module Not Found (Go)

```bash
# Clean module cache
go clean -modcache

# Re-download dependencies
go mod download
```

### Module Not Found (Node)

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install
```
