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

// TestAPIResponseValidation validates the API response structure and constraints
func TestAPIResponseValidation(t *testing.T) {
	tenantID := uuid.New()

	// Setup mocks
	mockForecast := NewMockForecastUseCaseForIntegration()
	mockTxnRepo := NewMockBankTransactionRepoForIntegration()

	// Create forecast that triggers all action types
	forecast := &domain.ForecastResult{
		TenantID:    tenantID,
		GeneratedAt: time.Now(),
		Metrics: domain.ForecastMetrics{
			CurrentCash:      2000000,
			AvgDailyInflow:   30000,
			AvgDailyOutflow:  70000,
			StdDev:           10000,
			TrendRate:        -0.03,
			TransactionCount: 80,
		},
		Forecast: []domain.ForecastPoint{
			{WeekNumber: 1, Baseline: 1800000, UpperBound: 1900000, LowerBound: 1700000},
			{WeekNumber: 2, Baseline: 1600000, UpperBound: 1700000, LowerBound: 1500000},
			{WeekNumber: 3, Baseline: 1400000, UpperBound: 1500000, LowerBound: 1300000},
			{WeekNumber: 4, Baseline: 1200000, UpperBound: 1300000, LowerBound: 1100000},
			{WeekNumber: 5, Baseline: 1000000, UpperBound: 1100000, LowerBound: 900000},
			{WeekNumber: 6, Baseline: -200000, UpperBound: -100000, LowerBound: -300000}, // NEGATIVE
		},
		Confidence: 0.68,
	}
	mockForecast.SetForecast(tenantID, forecast)

	// Add transactions showing revenue decline
	txns30 := []domain.BankTransaction{
		{Amount: 25000, TxnDate: time.Now().AddDate(0, 0, -20)},
		{Amount: 25000, TxnDate: time.Now().AddDate(0, 0, -15)},
	}
	txns90 := []domain.BankTransaction{
		{Amount: 100000, TxnDate: time.Now().AddDate(0, 0, -80)},
		{Amount: 100000, TxnDate: time.Now().AddDate(0, 0, -70)},
		{Amount: 100000, TxnDate: time.Now().AddDate(0, 0, -60)},
	}
	mockTxnRepo.SetTransactions(tenantID, append(txns30, txns90...))

	// Create handler
	engine := usecase.NewDecisionEngine(mockForecast, mockTxnRepo)
	handler := httpAdapter.NewDecisionHandler(engine)

	// Make request
	req := httptest.NewRequest(http.MethodGet, "/tenants/"+tenantID.String()+"/ai/actions", nil)
	rctx := chi.NewRouteContext()
	rctx.URLParams.Add("tenantID", tenantID.String())
	req = req.WithContext(context.WithValue(req.Context(), chi.RouteCtxKey, rctx))

	w := httptest.NewRecorder()
	handler.GetRecommendedActions(w, req)

	// Verify HTTP status
	assert.Equal(t, http.StatusOK, w.Code, "Should return 200 OK")

	// Parse response
	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	require.NoError(t, err, "Response should be valid JSON")

	// Validate response structure
	t.Run("ResponseStructure", func(t *testing.T) {
		assert.Contains(t, response, "data", "Response should have 'data' field")
		
		data, ok := response["data"].(map[string]interface{})
		require.True(t, ok, "'data' should be an object")
		
		assert.Contains(t, data, "actions", "'data' should have 'actions' field")
		
		actions, ok := data["actions"].([]interface{})
		require.True(t, ok, "'actions' should be an array")
		
		assert.NotNil(t, actions, "'actions' should not be nil")
	})

	// Validate max 5 actions
	t.Run("MaxFiveActions", func(t *testing.T) {
		data := response["data"].(map[string]interface{})
		actions := data["actions"].([]interface{})
		
		assert.LessOrEqual(t, len(actions), 5, "Should return max 5 actions")
	})

	// Validate action fields
	t.Run("ActionFields", func(t *testing.T) {
		data := response["data"].(map[string]interface{})
		actions := data["actions"].([]interface{})
		
		if len(actions) == 0 {
			t.Skip("No actions to validate")
		}

		for i, a := range actions {
			action, ok := a.(map[string]interface{})
			require.True(t, ok, "Action %d should be an object", i)

			// Required fields
			assert.Contains(t, action, "type", "Action %d should have 'type'", i)
			assert.Contains(t, action, "category", "Action %d should have 'category'", i)
			assert.Contains(t, action, "title", "Action %d should have 'title'", i)
			assert.Contains(t, action, "description", "Action %d should have 'description'", i)
			assert.Contains(t, action, "impact", "Action %d should have 'impact'", i)
			assert.Contains(t, action, "confidence", "Action %d should have 'confidence'", i)
			assert.Contains(t, action, "currency", "Action %d should have 'currency'", i)

			// Validate type
			actionType, ok := action["type"].(string)
			require.True(t, ok, "Action %d 'type' should be string", i)
			assert.NotEmpty(t, actionType, "Action %d 'type' should not be empty", i)

			// Validate category
			category, ok := action["category"].(string)
			require.True(t, ok, "Action %d 'category' should be string", i)
			validCategories := []string{"liquidity", "revenue", "cost_reduction"}
			assert.Contains(t, validCategories, category, "Action %d 'category' should be valid", i)

			// Validate title
			title, ok := action["title"].(string)
			require.True(t, ok, "Action %d 'title' should be string", i)
			assert.NotEmpty(t, title, "Action %d 'title' should not be empty", i)

			// Validate description
			description, ok := action["description"].(string)
			require.True(t, ok, "Action %d 'description' should be string", i)
			assert.NotEmpty(t, description, "Action %d 'description' should not be empty", i)

			// Validate impact
			impact, ok := action["impact"].(float64)
			require.True(t, ok, "Action %d 'impact' should be number", i)
			assert.Greater(t, impact, 0.0, "Action %d 'impact' should be positive", i)

			// Validate confidence
			confidence, ok := action["confidence"].(float64)
			require.True(t, ok, "Action %d 'confidence' should be number", i)
			assert.GreaterOrEqual(t, confidence, 0.0, "Action %d 'confidence' should be >= 0", i)
			assert.LessOrEqual(t, confidence, 1.0, "Action %d 'confidence' should be <= 1", i)

			// Validate currency
			currency, ok := action["currency"].(string)
			require.True(t, ok, "Action %d 'currency' should be string", i)
			assert.Equal(t, "SAR", currency, "Action %d 'currency' should be SAR", i)
		}
	})

	// Validate sorting by impact × confidence
	t.Run("ActionsSorted", func(t *testing.T) {
		data := response["data"].(map[string]interface{})
		actions := data["actions"].([]interface{})
		
		if len(actions) < 2 {
			t.Skip("Need at least 2 actions to verify sorting")
		}

		for i := 0; i < len(actions)-1; i++ {
			action1 := actions[i].(map[string]interface{})
			action2 := actions[i+1].(map[string]interface{})

			impact1 := action1["impact"].(float64)
			confidence1 := action1["confidence"].(float64)
			score1 := impact1 * confidence1

			impact2 := action2["impact"].(float64)
			confidence2 := action2["confidence"].(float64)
			score2 := impact2 * confidence2

			assert.GreaterOrEqual(t, score1, score2, 
				"Action %d (score %.2f) should have >= score than action %d (score %.2f)", 
				i, score1, i+1, score2)
		}
	})
}

// TestAPIResponseEmptyState validates empty response when no actions
func TestAPIResponseEmptyState(t *testing.T) {
	tenantID := uuid.New()

	// Setup mocks
	mockForecast := NewMockForecastUseCaseForIntegration()
	mockTxnRepo := NewMockBankTransactionRepoForIntegration()

	// Create healthy forecast (no actions needed)
	forecast := &domain.ForecastResult{
		TenantID:    tenantID,
		GeneratedAt: time.Now(),
		Metrics: domain.ForecastMetrics{
			CurrentCash:      20000000,
			AvgDailyInflow:   200000,
			AvgDailyOutflow:  150000,
			StdDev:           15000,
			TrendRate:        0.02,
			TransactionCount: 150,
		},
		Forecast: []domain.ForecastPoint{
			{WeekNumber: 1, Baseline: 20500000, UpperBound: 20700000, LowerBound: 20300000},
			{WeekNumber: 2, Baseline: 21000000, UpperBound: 21200000, LowerBound: 20800000},
		},
		Confidence: 0.75,
	}
	mockForecast.SetForecast(tenantID, forecast)

	// Create handler
	engine := usecase.NewDecisionEngine(mockForecast, mockTxnRepo)
	handler := httpAdapter.NewDecisionHandler(engine)

	// Make request
	req := httptest.NewRequest(http.MethodGet, "/tenants/"+tenantID.String()+"/ai/actions", nil)
	rctx := chi.NewRouteContext()
	rctx.URLParams.Add("tenantID", tenantID.String())
	req = req.WithContext(context.WithValue(req.Context(), chi.RouteCtxKey, rctx))

	w := httptest.NewRecorder()
	handler.GetRecommendedActions(w, req)

	// Verify response
	assert.Equal(t, http.StatusOK, w.Code, "Should return 200 OK even with no actions")

	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	require.NoError(t, err)

	data := response["data"].(map[string]interface{})
	actions := data["actions"].([]interface{})

	assert.Equal(t, 0, len(actions), "Should return empty array when no actions needed")
	assert.NotNil(t, actions, "Actions array should not be nil")
}

// TestAPIContentType validates response content type
func TestAPIContentType(t *testing.T) {
	tenantID := uuid.New()

	mockForecast := NewMockForecastUseCaseForIntegration()
	mockTxnRepo := NewMockBankTransactionRepoForIntegration()

	forecast := &domain.ForecastResult{
		TenantID:    tenantID,
		GeneratedAt: time.Now(),
		Metrics:     domain.ForecastMetrics{},
		Forecast:    []domain.ForecastPoint{},
		Confidence:  0.0,
	}
	mockForecast.SetForecast(tenantID, forecast)

	engine := usecase.NewDecisionEngine(mockForecast, mockTxnRepo)
	handler := httpAdapter.NewDecisionHandler(engine)

	req := httptest.NewRequest(http.MethodGet, "/tenants/"+tenantID.String()+"/ai/actions", nil)
	rctx := chi.NewRouteContext()
	rctx.URLParams.Add("tenantID", tenantID.String())
	req = req.WithContext(context.WithValue(req.Context(), chi.RouteCtxKey, rctx))

	w := httptest.NewRecorder()
	handler.GetRecommendedActions(w, req)

	contentType := w.Header().Get("Content-Type")
	assert.Contains(t, contentType, "application/json", "Content-Type should be application/json")
}
