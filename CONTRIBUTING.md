# Contributing to TadFuq.ai (CashFlow)

Thank you for your interest in contributing to TadFuq.ai! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

### Our Standards

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

### Prerequisites

- Go 1.21+
- Node.js 18+
- Docker & Docker Compose
- Git

### Setup Development Environment

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub
   git clone https://github.com/YOUR_USERNAME/tadfuq-platform.git
   cd tadfuq-platform
   ```

2. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/amrmeta1/tadfuq-platform.git
   ```

3. **Install dependencies**
   ```bash
   # Backend
   cd backend
   go mod download
   
   # Frontend
   cd ../frontend
   npm install
   ```

4. **Start local services**
   ```bash
   cd infra/docker
   docker-compose up -d
   ```

5. **Run migrations**
   ```bash
   cd backend/migrations
   export DATABASE_URL="postgresql://cashflow:cashflow@localhost:5432/cashflow?sslmode=disable"
   migrate -path . -database $DATABASE_URL up
   ```

See [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md) for detailed setup instructions.

## Development Workflow

### 1. Create a Feature Branch

```bash
# Update your fork
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes

- Follow the [coding standards](#coding-standards)
- Write tests for new functionality
- Update documentation as needed
- Keep commits atomic and focused

### 3. Test Your Changes

```bash
# Backend tests
cd backend
go test ./...

# Frontend tests
cd frontend
npm test

# Linting
make lint
```

### 4. Commit Your Changes

Follow the [commit guidelines](#commit-guidelines):

```bash
git add .
git commit -m "feat: add new feature"
```

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Coding Standards

### Go (Backend)

#### Style Guide

- Follow [Effective Go](https://golang.org/doc/effective_go)
- Use `gofmt` for formatting
- Use `golangci-lint` for linting
- Maximum line length: 120 characters

#### Clean Architecture

Follow the Clean Architecture pattern:

```
Domain → Use Case → Adapter → Handler
```

- **Domain**: Pure business logic, no external dependencies
- **Use Case**: Business logic orchestration
- **Adapter**: External integrations (DB, HTTP, MQ)
- **Handler**: HTTP request/response handling

#### Example

```go
// Domain entity
type Transaction struct {
    ID        string
    TenantID  string
    Amount    float64
    CreatedAt time.Time
}

// Repository interface (domain)
type TransactionRepository interface {
    Create(ctx context.Context, tx *Transaction) error
}

// Use case
type TransactionUseCase struct {
    repo domain.TransactionRepository
}

func (uc *TransactionUseCase) CreateTransaction(ctx context.Context, req CreateRequest) error {
    // Validate
    // Business logic
    // Call repository
}
```

#### Naming Conventions

- **Packages**: lowercase, single word (e.g., `domain`, `usecase`)
- **Files**: snake_case (e.g., `transaction_repo.go`)
- **Types**: PascalCase (e.g., `TransactionRepository`)
- **Functions**: PascalCase for exported, camelCase for private
- **Variables**: camelCase

#### Error Handling

```go
// Use domain errors
if err != nil {
    return domain.ErrNotFound
}

// Wrap errors with context
if err != nil {
    return fmt.Errorf("failed to create transaction: %w", err)
}
```

### TypeScript/React (Frontend)

#### Style Guide

- Follow [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- Use ESLint + Prettier
- TypeScript strict mode enabled
- Maximum line length: 100 characters

#### Component Structure

```typescript
// Use functional components with hooks
import { useState } from 'react';

interface MyComponentProps {
  title: string;
  onAction: () => void;
}

export function MyComponent({ title, onAction }: MyComponentProps) {
  const [state, setState] = useState(false);
  
  return (
    <div>
      <h1>{title}</h1>
      <button onClick={onAction}>Action</button>
    </div>
  );
}
```

#### Naming Conventions

- **Components**: PascalCase (e.g., `TransactionList.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useTransactions.ts`)
- **Utilities**: camelCase (e.g., `formatCurrency.ts`)
- **Types**: PascalCase (e.g., `Transaction`, `TransactionListProps`)

#### File Organization

```
components/
├── transaction-list/
│   ├── index.tsx           # Component
│   ├── transaction-item.tsx
│   └── use-transactions.ts # Custom hook
```

## Commit Guidelines

### Commit Message Format

```
type(scope): subject

body

footer
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, no logic change)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples

```bash
feat(api): add transaction filtering endpoint

Add GET /api/v1/transactions with query parameters for filtering
by date range, amount, and category.

Closes #123
```

```bash
fix(frontend): resolve transaction list pagination issue

The pagination was not resetting when filters changed.
Now resets to page 1 when any filter is applied.

Fixes #456
```

### Scope

- `api`: Backend API changes
- `frontend`: Frontend changes
- `db`: Database changes
- `infra`: Infrastructure changes
- `docs`: Documentation

## Pull Request Process

### Before Submitting

- [ ] Code follows style guidelines
- [ ] Tests pass locally
- [ ] New tests added for new functionality
- [ ] Documentation updated
- [ ] Commit messages follow guidelines
- [ ] No merge conflicts with main

### PR Title

Use the same format as commit messages:

```
feat(api): add transaction filtering
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How to test these changes

## Checklist
- [ ] Tests pass
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

### Review Process

1. **Automated Checks**: CI/CD pipeline runs tests and linting
2. **Code Review**: At least one maintainer reviews the code
3. **Feedback**: Address review comments
4. **Approval**: Maintainer approves PR
5. **Merge**: Squash and merge to main

## Testing

### Backend Tests

#### Unit Tests

```go
func TestTransaction_Validate(t *testing.T) {
    tests := []struct {
        name    string
        tx      *Transaction
        wantErr bool
    }{
        {
            name: "valid transaction",
            tx: &Transaction{
                Amount: 100.0,
                TenantID: "tenant-1",
            },
            wantErr: false,
        },
        {
            name: "negative amount",
            tx: &Transaction{
                Amount: -100.0,
            },
            wantErr: true,
        },
    }
    
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            err := tt.tx.Validate()
            if (err != nil) != tt.wantErr {
                t.Errorf("Validate() error = %v, wantErr %v", err, tt.wantErr)
            }
        })
    }
}
```

#### Integration Tests

```go
func TestTransactionRepo_Create(t *testing.T) {
    db := setupTestDB(t)
    defer db.Close()
    
    repo := NewTransactionRepo(db)
    tx := &domain.Transaction{
        Amount: 100.0,
        TenantID: "tenant-1",
    }
    
    err := repo.Create(context.Background(), tx)
    assert.NoError(t, err)
    assert.NotEmpty(t, tx.ID)
}
```

### Frontend Tests

#### Component Tests

```typescript
import { render, screen } from '@testing-library/react';
import { TransactionList } from './transaction-list';

describe('TransactionList', () => {
  it('renders transactions', () => {
    const transactions = [
      { id: '1', amount: 100, description: 'Test' }
    ];
    
    render(<TransactionList transactions={transactions} />);
    
    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByText('$100.00')).toBeInTheDocument();
  });
});
```

### Running Tests

```bash
# Backend
cd backend
go test ./...
go test -cover ./...

# Frontend
cd frontend
npm test
npm test -- --coverage
```

## Documentation

### Code Documentation

#### Go

```go
// TransactionRepository defines the interface for transaction data access.
// All methods must be safe for concurrent use.
type TransactionRepository interface {
    // Create inserts a new transaction into the database.
    // Returns an error if the transaction is invalid or if the database operation fails.
    Create(ctx context.Context, tx *Transaction) error
    
    // GetByID retrieves a transaction by its ID.
    // Returns ErrNotFound if the transaction doesn't exist.
    GetByID(ctx context.Context, id string) (*Transaction, error)
}
```

#### TypeScript

```typescript
/**
 * Formats a number as currency with the specified locale and currency code.
 * 
 * @param amount - The amount to format
 * @param currency - The currency code (e.g., 'USD', 'SAR')
 * @param locale - The locale for formatting (default: 'en-US')
 * @returns Formatted currency string
 * 
 * @example
 * formatCurrency(1234.56, 'SAR', 'ar-SA') // "١٬٢٣٤٫٥٦ ر.س."
 */
export function formatCurrency(
  amount: number,
  currency: string,
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}
```

### Documentation Files

When adding new features, update:

- **README.md**: If it affects project overview
- **docs/ARCHITECTURE.md**: If it changes system design
- **docs/DEVELOPMENT.md**: If it affects development workflow
- **docs/DEPLOYMENT.md**: If it affects deployment

## Questions?

- **Documentation**: Check [docs/](./docs/)
- **Issues**: Search existing issues or create a new one
- **Discussions**: Use GitHub Discussions for questions

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to TadFuq.ai! 🎉
