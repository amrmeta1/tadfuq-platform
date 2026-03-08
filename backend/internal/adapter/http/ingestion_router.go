package http

import (
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	chimw "github.com/go-chi/chi/v5/middleware"

	"github.com/finch-co/cashflow/internal/auth"
	"github.com/finch-co/cashflow/internal/domain"
	"github.com/finch-co/cashflow/internal/middleware"
)

// IngestionRouterDeps holds dependencies for the ingestion service router.
type IngestionRouterDeps struct {
	Validator   *auth.Validator // Optional - can be nil for demo mode
	Users       domain.UserRepository
	Memberships domain.MembershipRepository
	AuditRepo   domain.AuditLogRepository
	Ingestion   *IngestionHandler
	Analysis    *AnalysisHandler
	Forecast    *ForecastHandler
}

// NewIngestionRouter builds the chi router for the ingestion service.
func NewIngestionRouter(deps IngestionRouterDeps) http.Handler {
	r := chi.NewRouter()

	// Global middleware
	r.Use(chimw.RequestID)
	r.Use(chimw.RealIP)
	r.Use(middleware.RequestLogging)
	r.Use(chimw.Recoverer)
	r.Use(corsMiddleware)

	// Health check (unauthenticated)
	r.Get("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(`{"status":"ok","service":"ingestion-service"}`))
	})

	// API routes (no authentication - demo mode)
	r.Group(func(r chi.Router) {
		r.Use(middleware.DemoMode(deps.Users))
		r.Use(middleware.TenantFromHeader)

		r.Route("/tenants/{tenantID}", func(r chi.Router) {
			r.Use(middleware.TenantFromRouteParam("tenantID"))
			r.Use(middleware.TenantRateLimit(100, time.Minute))

			// CSV import
			r.Post("/imports/bank-csv", deps.Ingestion.ImportBankCSV)

			// Transactions
			r.Get("/transactions", deps.Ingestion.ListTransactions)

			// Cash position (treasury/forecast read)
			r.Get("/cash-position", deps.Ingestion.GetCashPosition)

			// Bank accounts
			r.Post("/bank-accounts", deps.Ingestion.CreateBankAccount)

			// Sync commands
			r.Post("/sync/bank", deps.Ingestion.SyncBank)
			r.Post("/sync/accounting", deps.Ingestion.SyncAccounting)

			// Cash analysis (run and get latest)
			r.Get("/analysis/latest", deps.Analysis.GetLatest)
			r.Post("/analysis/run", deps.Analysis.RunAnalysis)

			// Cash forecast (13-week deterministic forecast)
			r.Get("/forecast/current", deps.Forecast.GetCurrentForecast)
		})
	})

	return r
}
