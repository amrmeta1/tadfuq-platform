# CashFlow.ai Frontend

Production-grade Next.js dashboard for CashFlow.ai — agentic financial management for GCC SMEs.

## Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Data Fetching**: TanStack Query (React Query)
- **Auth**: Keycloak OIDC via NextAuth.js
- **Charts**: Recharts
- **Validation**: Zod
- **i18n**: Arabic + English with full RTL support

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy env file and configure
cp .env.example .env.local

# 3. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `KEYCLOAK_ISSUER` | Keycloak realm URL | `http://localhost:8180/realms/cashflow` |
| `KEYCLOAK_CLIENT_ID` | OIDC client ID | `cashflow-api` |
| `KEYCLOAK_CLIENT_SECRET` | OIDC client secret | `cashflow-api-secret` |
| `NEXTAUTH_URL` | NextAuth callback base URL | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Session encryption secret | (generate a random string) |
| `NEXT_PUBLIC_API_BASE_URL` | Tenant service API | `http://localhost:8080` |
| `NEXT_PUBLIC_INGESTION_API_BASE_URL` | Ingestion service API | `http://localhost:8081` |
| `NEXT_PUBLIC_ENABLE_MOCKS` | Enable mock data for dev | `true` |

## Keycloak Setup

The frontend expects a Keycloak instance with:

- **Realm**: `cashflow`
- **Client**: `cashflow-api` (confidential, standard flow enabled)
- **Redirect URIs**: `http://localhost:3000/*`
- **Web Origins**: `http://localhost:3000`

The realm is pre-configured in `deploy/keycloak/realm-export.json`.

### Test Users

| Email | Password | Role |
|---|---|---|
| `admin@demo.com` | `admin123` | `tenant_admin` |
| `owner@demo.com` | `owner123` | `owner` |
| `accountant@demo.com` | `accountant123` | `accountant_readonly` |

## Running with Backend

```bash
# From the repo root, start all services:
cd deploy/docker
docker-compose up -d

# Then start the frontend:
cd frontend
npm run dev
```

Services:
- **Keycloak**: http://localhost:8180
- **Tenant API**: http://localhost:8080
- **Ingestion API**: http://localhost:8081
- **Frontend**: http://localhost:3000

## Project Structure

```
frontend/
├── app/
│   ├── (marketing)/            # Public marketing pages
│   │   ├── home/               # Landing page
│   │   ├── pricing/            # Pricing plans
│   │   ├── security/           # Security overview
│   │   ├── partners/           # Partner program
│   │   └── demo/               # Demo request form
│   ├── api/
│   │   ├── auth/               # NextAuth API route
│   │   └── leads/              # Demo lead capture API
│   ├── login/                  # Keycloak login page
│   ├── logout/                 # Logout handler
│   └── app/                    # Protected app routes
│       ├── dashboard/          # Cash dashboard with charts
│       ├── forecast/           # 13-week/30-day forecast + scenarios
│       ├── alerts/             # Alert inbox + detail view
│       ├── agents/             # AI agent cards + daily brief
│       ├── transactions/       # Transaction table + filters
│       ├── import/             # CSV upload page
│       ├── reports/            # Monthly reports + preview
│       ├── onboarding/         # Guided setup wizard
│       ├── billing/            # Plan, usage, invoices
│       ├── settings/           # Org, Members, Roles, Integrations, Security
│       └── audit/              # Audit log (admin only)
├── components/
│   ├── ui/                     # shadcn/ui primitives
│   └── layout/                 # App shell, sidebar, navbar
├── lib/
│   ├── api/                    # Typed API client + endpoint functions
│   ├── auth/                   # Auth options + RBAC permissions
│   ├── config/                 # Pricing plans config
│   ├── hooks/                  # Tenant context, permissions hook
│   └── i18n/                   # EN/AR dictionaries + context
└── .env.example
```

## Features

### Core Platform
- **Keycloak OIDC**: Redirect login, JWT token refresh, secure session via httpOnly cookie
- **Multi-tenancy**: Tenant switcher in navbar, X-Tenant-ID header on all API calls, cache reset on switch
- **RBAC**: Permission matrix mirroring backend, UI elements hidden/disabled per role
- **i18n**: Arabic/English toggle with full RTL layout support, GCC currency formatting (SAR/AED/QAR)
- **Observability**: `x-request-id` header on every API call for trace correlation
- **Mock Data**: Dev-mode mock data behind `NEXT_PUBLIC_ENABLE_MOCKS` flag

### MVP Pages
- **Onboarding Wizard**: 5-step guided setup (country, currency, bank account, CSV import, confirmation)
- **Forecast**: 13-week/30-day area charts, base/optimistic/pessimistic scenarios, editable assumptions
- **Alerts**: Inbox with severity/status filters, detail view with acknowledge/resolve/snooze actions
- **AI Agents**: Agent status cards (Raqib, Mutawaqi, Mustashar) + daily morning brief
- **Reports**: Monthly report list, generate, preview with chart + narrative, PDF export placeholder
- **CSV Import**: Upload page wired to `POST /tenants/{id}/imports/bank-csv`, shows dedup results
- **Transactions**: Table with date/amount/account filters, CSV export
- **Audit Log**: Admin-only security event viewer

### SaaS Pages
- **Billing**: Current plan card, usage meters (accounts/users/integrations), invoice history
- **Integrations**: CSV (active), bank providers (Lean, Tarabut — coming soon), accounting (Zoho, Wafeq, QuickBooks — coming soon)
- **Security**: Active sessions, allowed domains placeholder, 2FA placeholder, audit log link

### Public Marketing
- **Landing Page** (`/home`): Hero, features grid, social proof, CTA
- **Pricing** (`/pricing`): 4-tier plan cards with feature lists
- **Security** (`/security`): Enterprise security feature cards
- **Partners** (`/partners/accounting-firms`): Partner program benefits
- **Demo** (`/demo`): Lead capture form → `/api/leads`

### UX Polish
- **404 page**: Custom not-found with navigation links
- **Error boundaries**: Root + app-level error pages with retry
- **Loading states**: Skeleton loader for app routes

## Scripts

```bash
npm run dev     # Start development server
npm run build   # Production build
npm run start   # Start production server
npm run lint    # Run ESLint
```
