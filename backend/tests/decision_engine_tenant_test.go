package tests

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	httpAdapter "github.com/finch-co/cashflow/internal/adapter/http"
	"github.com/finch-co/cashflow/internal/domain"
	"github.com/finch-co/cashflow/internal/usecase"
)

// MockForecastUseCaseForIntegration provides different forecasts per tenant
type MockForecastUseCaseForIntegration struct {
	tenantForecasts map[uuid.UUID]*domain.ForecastResult
}

func NewMockForecastUseCaseForIntegration() *MockForecastUseCaseForIntegration {
	return &MockForecastUseCaseForIntegration{
		tenantForecasts: make(map[uuid.UUID]*domain.ForecastResult),
	}
}

func (m *MockForecastUseCaseForIntegration) SetForecast(tenantID uuid.UUID, forecast *domain.ForecastResult) {
	m.tenantForecasts[tenantID] = forecast
}

func (m *MockForecastUseCaseForIntegration) GenerateForecast(ctx context.Context, tenantID uuid.UUID) (*domain.ForecastResult, error) {
	if forecast, ok := m.tenantForecasts[tenantID]; ok {
		return forecast, nil
	}
	// Return empty forecast for unknown tenants
	return &domain.ForecastResult{
		TenantID:    tenantID,
		GeneratedAt: time.Now(),
		Metrics:     domain.ForecastMetrics{},
		Forecast:    []domain.ForecastPoint{},
		Confidence:  0.0,
	}, nil
}

// MockBankTransactionRepoForIntegration provides different transactions per tenant
type MockBankTransactionRepoForIntegration struct {
	tenantTransactions map[uuid.UUID][]domain.BankTransaction
}

func NewMockBankTransactionRepoForIntegration() *MockBankTransactionRepoForIntegration {
	return &MockBankTransactionRepoForIntegration{
		tenantTransactions: make(map[uuid.UUID][]domain.BankTransaction),
	}
}

func (m *MockBankTransactionRepoForIntegration) SetTransactions(tenantID uuid.UUID, txns []domain.BankTransaction) {
	m.tenantTransactions[tenantID] = txns
}

func (m *MockBankTransactionRepoForIntegration) List(ctx context.Context, filter domain.TransactionFilter) ([]domain.BankTransaction, int, error) {
	if txns, ok := m.tenantTransactions[filter.TenantID]; ok {
		return txns, len(txns), nil
	}
	return []domain.BankTransaction{}, 0, nil
}

func (m *MockBankTransactionRepoForIntegration) BulkUpsert(ctx context.Context, tenantID uuid.UUID, txns []domain.BankTransaction) (int, error) {
	return 0, nil
}

func (m *MockBankTransactionRepoForIntegration) SumBalancesByAccountUpTo(ctx context.Context, tenantID uuid.UUID, asOf time.Time) (map[uuid.UUID]float64, error) {
	return make(map[uuid.UUID]float64), nil
}

// TestMultiTenantIsolation verifies that each tenant sees only their own recommendations
func TestMultiTenantIsolation(t *testing.T) {
	// Create two distinct tenants
	tenantA := uuid.New()
	tenantB := uuid.New()

	// Setup mocks
	mockForecast := NewMockForecastUseCaseForIntegration()
	mockTxnRepo := NewMockBankTransactionRepoForIntegration()

	// Tenant A: Has liquidity risk (negative forecast)
	forecastA := &domain.ForecastResult{
		TenantID:    tenantA,
		GeneratedAt: time.Now(),
		Metrics: domain.ForecastMetrics{
			CurrentCash:      3000000,
			AvgDailyInflow:   40000,
			AvgDailyOutflow:  70000,
			StdDev:           10000,
			TrendRate:        -0.02,
			TransactionCount: 50,
		},
		Forecast: []domain.ForecastPoint{
			{WeekNumber: 1, Baseline: 2500000, UpperBound: 2600000, LowerBound: 2400000},
			{WeekNumber: 2, Baseline: 2000000, UpperBound: 2100000, LowerBound: 1900000},
			{WeekNumber: 3, Baseline: 1500000, UpperBound: 1600000, LowerBound: 1400000},
			{WeekNumber: 4, Baseline: 1000000, UpperBound: 1100000, LowerBound: 900000},
			{WeekNumber: 5, Baseline: 500000, UpperBound: 600000, LowerBound: 400000},
			{WeekNumber: 6, Baseline: -500000, UpperBound: -400000, LowerBound: -600000}, // NEGATIVE
		},
		Confidence: 0.68,
	}
	mockForecast.SetForecast(tenantA, forecastA)

	// Tenant B: Healthy cash position (no negative forecast)
	forecastB := &domain.ForecastResult{
		TenantID:    tenantB,
		GeneratedAt: time.Now(),
		Metrics: domain.ForecastMetrics{
			CurrentCash:      15000000,
			AvgDailyInflow:   200000,
			AvgDailyOutflow:  150000,
			StdDev:           20000,
			TrendRate:        0.01,
			TransactionCount: 100,
		},
		Forecast: []domain.ForecastPoint{
			{WeekNumber: 1, Baseline: 15500000, UpperBound: 15700000, LowerBound: 15300000},
			{WeekNumber: 2, Baseline: 16000000, UpperBound: 16200000, LowerBound: 15800000},
			{WeekNumber: 3, Baseline: 16500000, UpperBound: 16700000, LowerBound: 16300000},
		},
		Confidence: 0.72,
	}
	mockForecast.SetForecast(tenantB, forecastB)

	// Create decision engine
	engine := usecase.NewDecisionEngine(mockForecast, mockTxnRepo)
	handler := httpAdapter.NewDecisionHandler(engine)

	// Test Tenant A
	t.Run("TenantA_HasLiquidityRisk", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/tenants/"+tenantA.String()+"/ai/actions", nil)
		rctx := chi.NewRouteContext()
		rctx.URLParams.Add("tenantID", tenantA.String())
		req = req.WithContext(context.WithValue(req.Context(), chi.RouteCtxKey, rctx))

		w := httptest.NewRecorder()
		handler.GetRecommendedActions(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var response map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		require.NoError(t, err)

		data := response["data"].(map[string]interface{})
		actions := data["actions"].([]interface{})

		// Tenant A should have liquidity actions
		assert.Greater(t, len(actions), 0, "Tenant A should have recommendations")

		hasLiquidityAction := false
		for _, a := range actions {
			action := a.(map[string]interface{})
			if action["category"] == "liquidity" {
				hasLiquidityAction = true
				break
			}
		}
		assert.True(t, hasLiquidityAction, "Tenant A should have liquidity actions")
	})

	// Test Tenant B
	t.Run("TenantB_NoLiquidityRisk", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/tenants/"+tenantB.String()+"/ai/actions", nil)
		rctx := chi.NewRouteContext()
		rctx.URLParams.Add("tenantID", tenantB.String())
		req = req.WithContext(context.WithValue(req.Context(), chi.RouteCtxKey, rctx))

		w := httptest.NewRecorder()
		handler.GetRecommendedActions(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var response map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		require.NoError(t, err)

		data := response["data"].(map[string]interface{})
		actions := data["actions"].([]interface{})

		// Tenant B should have no actions (healthy cash position)
		assert.Equal(t, 0, len(actions), "Tenant B should have no recommendations (healthy position)")
	})

	// Test data isolation - verify Tenant A doesn't see Tenant B's data
	t.Run("DataIsolation_NoLeakage", func(t *testing.T) {
		ctx := context.Background()

		// Get actions for Tenant A
		actionsA, err := engine.RecommendActions(ctx, tenantA)
		require.NoError(t, err)

		// Get actions for Tenant B
		actionsB, err := engine.RecommendActions(ctx, tenantB)
		require.NoError(t, err)

		// Actions should be different
		assert.NotEqual(t, len(actionsA), len(actionsB), "Tenants should have different action counts")

		// Tenant A should have actions (liquidity risk)
		assert.Greater(t, len(actionsA), 0, "Tenant A should have actions")

		// Tenant B should have no actions (healthy)
		assert.Equal(t, 0, len(actionsB), "Tenant B should have no actions")
	})

	// Test invalid tenant ID
	t.Run("InvalidTenantID_ReturnsError", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/tenants/invalid-uuid/ai/actions", nil)
		rctx := chi.NewRouteContext()
		rctx.URLParams.Add("tenantID", "invalid-uuid")
		req = req.WithContext(context.WithValue(req.Context(), chi.RouteCtxKey, rctx))

		w := httptest.NewRecorder()
		handler.GetRecommendedActions(w, req)

		assert.Equal(t, http.StatusBadRequest, w.Code)
	})

	// Test non-existent tenant (should return empty actions, not error)
	t.Run("NonExistentTenant_ReturnsEmptyActions", func(t *testing.T) {
		nonExistentTenant := uuid.New()
		req := httptest.NewRequest(http.MethodGet, "/tenants/"+nonExistentTenant.String()+"/ai/actions", nil)
		rctx := chi.NewRouteContext()
		rctx.URLParams.Add("tenantID", nonExistentTenant.String())
		req = req.WithContext(context.WithValue(req.Context(), chi.RouteCtxKey, rctx))

		w := httptest.NewRecorder()
		handler.GetRecommendedActions(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var response map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		require.NoError(t, err)

		data := response["data"].(map[string]interface{})
		actions := data["actions"].([]interface{})

		assert.Equal(t, 0, len(actions), "Non-existent tenant should return empty actions")
	})
}
