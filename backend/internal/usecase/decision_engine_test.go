package usecase

import (
	"context"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"

	"github.com/finch-co/cashflow/internal/domain"
)

// MockForecastUseCase mocks the ForecastUseCase
type MockForecastUseCase struct {
	mock.Mock
}

func (m *MockForecastUseCase) GenerateForecast(ctx context.Context, tenantID uuid.UUID) (*domain.ForecastResult, error) {
	args := m.Called(ctx, tenantID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.ForecastResult), args.Error(1)
}

// MockBankTransactionRepository mocks the BankTransactionRepository
type MockBankTransactionRepository struct {
	mock.Mock
}

func (m *MockBankTransactionRepository) BulkUpsert(ctx context.Context, tenantID uuid.UUID, txns []domain.BankTransaction) (int, error) {
	args := m.Called(ctx, tenantID, txns)
	return args.Int(0), args.Error(1)
}

func (m *MockBankTransactionRepository) List(ctx context.Context, filter domain.TransactionFilter) ([]domain.BankTransaction, int, error) {
	args := m.Called(ctx, filter)
	if args.Get(0) == nil {
		return nil, args.Int(1), args.Error(2)
	}
	return args.Get(0).([]domain.BankTransaction), args.Int(1), args.Error(2)
}

func (m *MockBankTransactionRepository) SumBalancesByAccountUpTo(ctx context.Context, tenantID uuid.UUID, asOf time.Time) (map[uuid.UUID]float64, error) {
	args := m.Called(ctx, tenantID, asOf)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(map[uuid.UUID]float64), args.Error(1)
}

// TestDecisionEngine_LiquidityRisk tests liquidity risk detection
func TestDecisionEngine_LiquidityRisk(t *testing.T) {
	ctx := context.Background()
	tenantID := uuid.New()

	// Create mocks
	mockForecast := new(MockForecastUseCase)
	mockTxnRepo := new(MockBankTransactionRepository)

	// Mock forecast with negative balance in week 6
	forecast := &domain.ForecastResult{
		TenantID:    tenantID,
		GeneratedAt: time.Now(),
		Metrics: domain.ForecastMetrics{
			CurrentCash:      5000000,
			AvgDailyInflow:   50000,
			AvgDailyOutflow:  80000,
			StdDev:           10000,
			TrendRate:        -0.01,
			TransactionCount: 100,
		},
		Forecast: []domain.ForecastPoint{
			{WeekNumber: 1, Baseline: 4500000, UpperBound: 4600000, LowerBound: 4400000},
			{WeekNumber: 2, Baseline: 4000000, UpperBound: 4100000, LowerBound: 3900000},
			{WeekNumber: 3, Baseline: 3500000, UpperBound: 3600000, LowerBound: 3400000},
			{WeekNumber: 4, Baseline: 3000000, UpperBound: 3100000, LowerBound: 2900000},
			{WeekNumber: 5, Baseline: 2500000, UpperBound: 2600000, LowerBound: 2400000},
			{WeekNumber: 6, Baseline: -500000, UpperBound: -400000, LowerBound: -600000}, // NEGATIVE
			{WeekNumber: 7, Baseline: -1000000, UpperBound: -900000, LowerBound: -1100000},
		},
		Confidence: 0.68,
	}

	mockForecast.On("GenerateForecast", ctx, tenantID).Return(forecast, nil)
	mockTxnRepo.On("List", ctx, mock.Anything).Return([]domain.BankTransaction{}, 0, nil)

	// Create decision engine
	engine := NewDecisionEngine(mockForecast, mockTxnRepo)

	// Execute
	actions, err := engine.RecommendActions(ctx, tenantID)

	// Verify
	assert.NoError(t, err)
	assert.NotNil(t, actions)
	assert.LessOrEqual(t, len(actions), 5, "Should return max 5 actions")

	// Check that liquidity actions are included
	hasDelayPayments := false
	hasMoveLiquidity := false
	for _, action := range actions {
		if action.Type == domain.ActionDelayVendorPayments {
			hasDelayPayments = true
			assert.Equal(t, domain.CategoryLiquidity, action.Category)
			assert.Greater(t, action.Impact, 0.0)
			assert.GreaterOrEqual(t, action.Confidence, 0.0)
			assert.LessOrEqual(t, action.Confidence, 1.0)
		}
		if action.Type == domain.ActionMoveLiquidity {
			hasMoveLiquidity = true
			assert.Equal(t, domain.CategoryLiquidity, action.Category)
		}
	}

	assert.True(t, hasDelayPayments, "Should include delay_vendor_payments action")
	assert.True(t, hasMoveLiquidity, "Should include move_liquidity action")

	mockForecast.AssertExpectations(t)
	mockTxnRepo.AssertExpectations(t)
}

// TestDecisionEngine_RevenueWeakness tests revenue weakness detection
func TestDecisionEngine_RevenueWeakness(t *testing.T) {
	ctx := context.Background()
	tenantID := uuid.New()

	// Create mocks
	mockForecast := new(MockForecastUseCase)
	mockTxnRepo := new(MockBankTransactionRepository)

	// Mock forecast with healthy cash but declining inflows
	forecast := &domain.ForecastResult{
		TenantID:    tenantID,
		GeneratedAt: time.Now(),
		Metrics: domain.ForecastMetrics{
			CurrentCash:      10000000,
			AvgDailyInflow:   100000,
			AvgDailyOutflow:  80000,
			StdDev:           10000,
			TrendRate:        0.01,
			TransactionCount: 100,
		},
		Forecast: []domain.ForecastPoint{
			{WeekNumber: 1, Baseline: 10500000, UpperBound: 10600000, LowerBound: 10400000},
			{WeekNumber: 2, Baseline: 11000000, UpperBound: 11100000, LowerBound: 10900000},
		},
		Confidence: 0.68,
	}

	// Mock transactions showing revenue decline
	// Last 90 days: high inflows
	txns90 := []domain.BankTransaction{
		{Amount: 100000, TxnDate: time.Now().AddDate(0, 0, -80)},
		{Amount: 100000, TxnDate: time.Now().AddDate(0, 0, -70)},
		{Amount: 100000, TxnDate: time.Now().AddDate(0, 0, -60)},
		{Amount: 100000, TxnDate: time.Now().AddDate(0, 0, -50)},
		{Amount: 100000, TxnDate: time.Now().AddDate(0, 0, -40)},
	}

	// Last 30 days: low inflows (< 85% of 90-day average)
	txns30 := []domain.BankTransaction{
		{Amount: 40000, TxnDate: time.Now().AddDate(0, 0, -25)},
		{Amount: 40000, TxnDate: time.Now().AddDate(0, 0, -20)},
		{Amount: 40000, TxnDate: time.Now().AddDate(0, 0, -15)},
	}

	mockForecast.On("GenerateForecast", ctx, tenantID).Return(forecast, nil)
	
	// Mock for 30-day transactions
	mockTxnRepo.On("List", ctx, mock.MatchedBy(func(f domain.TransactionFilter) bool {
		return f.From != nil && f.From.After(time.Now().AddDate(0, 0, -31))
	})).Return(txns30, len(txns30), nil)

	// Mock for 90-day transactions
	mockTxnRepo.On("List", ctx, mock.MatchedBy(func(f domain.TransactionFilter) bool {
		return f.From != nil && f.From.Before(time.Now().AddDate(0, 0, -31))
	})).Return(txns90, len(txns90), nil)

	// Create decision engine
	engine := NewDecisionEngine(mockForecast, mockTxnRepo)

	// Execute
	actions, err := engine.RecommendActions(ctx, tenantID)

	// Verify
	assert.NoError(t, err)
	assert.NotNil(t, actions)
	assert.LessOrEqual(t, len(actions), 5, "Should return max 5 actions")

	// Check that revenue action is included
	hasAccelerateReceivables := false
	for _, action := range actions {
		if action.Type == domain.ActionAccelerateReceivables {
			hasAccelerateReceivables = true
			assert.Equal(t, domain.CategoryRevenue, action.Category)
			assert.Greater(t, action.Impact, 0.0)
			assert.GreaterOrEqual(t, action.Confidence, 0.0)
			assert.LessOrEqual(t, action.Confidence, 1.0)
		}
	}

	assert.True(t, hasAccelerateReceivables, "Should include accelerate_receivables action")

	mockForecast.AssertExpectations(t)
	mockTxnRepo.AssertExpectations(t)
}

// TestDecisionEngine_CostPressure tests cost pressure detection
func TestDecisionEngine_CostPressure(t *testing.T) {
	ctx := context.Background()
	tenantID := uuid.New()

	// Create mocks
	mockForecast := new(MockForecastUseCase)
	mockTxnRepo := new(MockBankTransactionRepository)

	// Mock forecast with high outflows (> 120% of inflows)
	forecast := &domain.ForecastResult{
		TenantID:    tenantID,
		GeneratedAt: time.Now(),
		Metrics: domain.ForecastMetrics{
			CurrentCash:      8000000,
			AvgDailyInflow:   50000,  // Low inflows
			AvgDailyOutflow:  70000,  // High outflows (140% of inflows)
			StdDev:           10000,
			TrendRate:        -0.02,
			TransactionCount: 100,
		},
		Forecast: []domain.ForecastPoint{
			{WeekNumber: 1, Baseline: 7500000, UpperBound: 7600000, LowerBound: 7400000},
			{WeekNumber: 2, Baseline: 7000000, UpperBound: 7100000, LowerBound: 6900000},
		},
		Confidence: 0.68,
	}

	mockForecast.On("GenerateForecast", ctx, tenantID).Return(forecast, nil)
	mockTxnRepo.On("List", ctx, mock.Anything).Return([]domain.BankTransaction{}, 0, nil)

	// Create decision engine
	engine := NewDecisionEngine(mockForecast, mockTxnRepo)

	// Execute
	actions, err := engine.RecommendActions(ctx, tenantID)

	// Verify
	assert.NoError(t, err)
	assert.NotNil(t, actions)
	assert.LessOrEqual(t, len(actions), 5, "Should return max 5 actions")

	// Check that cost reduction actions are included
	hasReduceMarketing := false
	hasDelayHiring := false
	hasCutDiscretionary := false
	for _, action := range actions {
		if action.Type == domain.ActionReduceMarketingSpend {
			hasReduceMarketing = true
			assert.Equal(t, domain.CategoryCostReduction, action.Category)
		}
		if action.Type == domain.ActionDelayHiring {
			hasDelayHiring = true
			assert.Equal(t, domain.CategoryCostReduction, action.Category)
		}
		if action.Type == domain.ActionCutDiscretionarySpend {
			hasCutDiscretionary = true
			assert.Equal(t, domain.CategoryCostReduction, action.Category)
		}
	}

	assert.True(t, hasReduceMarketing, "Should include reduce_marketing_spend action")
	assert.True(t, hasDelayHiring, "Should include delay_hiring action")
	assert.True(t, hasCutDiscretionary, "Should include cut_discretionary_spend action")

	mockForecast.AssertExpectations(t)
	mockTxnRepo.AssertExpectations(t)
}

// TestDecisionEngine_ActionsSortedByScore tests that actions are sorted by impact × confidence
func TestDecisionEngine_ActionsSortedByScore(t *testing.T) {
	ctx := context.Background()
	tenantID := uuid.New()

	// Create mocks
	mockForecast := new(MockForecastUseCase)
	mockTxnRepo := new(MockBankTransactionRepository)

	// Mock forecast that triggers all conditions
	forecast := &domain.ForecastResult{
		TenantID:    tenantID,
		GeneratedAt: time.Now(),
		Metrics: domain.ForecastMetrics{
			CurrentCash:      2000000,  // Low cash
			AvgDailyInflow:   40000,    // Low inflows
			AvgDailyOutflow:  60000,    // High outflows (150% of inflows)
			StdDev:           10000,
			TrendRate:        -0.03,
			TransactionCount: 100,
		},
		Forecast: []domain.ForecastPoint{
			{WeekNumber: 1, Baseline: 1800000, UpperBound: 1900000, LowerBound: 1700000},
			{WeekNumber: 2, Baseline: 1600000, UpperBound: 1700000, LowerBound: 1500000},
			{WeekNumber: 3, Baseline: 1400000, UpperBound: 1500000, LowerBound: 1300000},
			{WeekNumber: 4, Baseline: 1200000, UpperBound: 1300000, LowerBound: 1100000},
			{WeekNumber: 5, Baseline: 1000000, UpperBound: 1100000, LowerBound: 900000},
			{WeekNumber: 6, Baseline: -100000, UpperBound: 0, LowerBound: -200000}, // NEGATIVE
		},
		Confidence: 0.68,
	}

	mockForecast.On("GenerateForecast", ctx, tenantID).Return(forecast, nil)
	mockTxnRepo.On("List", ctx, mock.Anything).Return([]domain.BankTransaction{}, 0, nil)

	// Create decision engine
	engine := NewDecisionEngine(mockForecast, mockTxnRepo)

	// Execute
	actions, err := engine.RecommendActions(ctx, tenantID)

	// Verify
	assert.NoError(t, err)
	assert.NotNil(t, actions)
	assert.LessOrEqual(t, len(actions), 5, "Should return max 5 actions")

	// Verify actions are sorted by impact × confidence (descending)
	for i := 0; i < len(actions)-1; i++ {
		scoreI := actions[i].Impact * actions[i].Confidence
		scoreJ := actions[i+1].Impact * actions[i+1].Confidence
		assert.GreaterOrEqual(t, scoreI, scoreJ, "Actions should be sorted by impact × confidence")
	}

	mockForecast.AssertExpectations(t)
	mockTxnRepo.AssertExpectations(t)
}

// TestDecisionEngine_EmptyForecast tests graceful handling of empty forecast
func TestDecisionEngine_EmptyForecast(t *testing.T) {
	ctx := context.Background()
	tenantID := uuid.New()

	// Create mocks
	mockForecast := new(MockForecastUseCase)
	mockTxnRepo := new(MockBankTransactionRepository)

	// Mock empty forecast
	forecast := &domain.ForecastResult{
		TenantID:    tenantID,
		GeneratedAt: time.Now(),
		Metrics:     domain.ForecastMetrics{},
		Forecast:    []domain.ForecastPoint{},
		Confidence:  0.0,
	}

	mockForecast.On("GenerateForecast", ctx, tenantID).Return(forecast, nil)

	// Create decision engine
	engine := NewDecisionEngine(mockForecast, mockTxnRepo)

	// Execute
	actions, err := engine.RecommendActions(ctx, tenantID)

	// Verify - should return empty array, not error
	assert.NoError(t, err)
	assert.NotNil(t, actions)
	assert.Equal(t, 0, len(actions), "Should return empty array for empty forecast")

	mockForecast.AssertExpectations(t)
}

// TestDecisionEngine_MaxFiveActions tests that max 5 actions are returned
func TestDecisionEngine_MaxFiveActions(t *testing.T) {
	ctx := context.Background()
	tenantID := uuid.New()

	// Create mocks
	mockForecast := new(MockForecastUseCase)
	mockTxnRepo := new(MockBankTransactionRepository)

	// Mock forecast that triggers all conditions (should generate 6+ actions)
	forecast := &domain.ForecastResult{
		TenantID:    tenantID,
		GeneratedAt: time.Now(),
		Metrics: domain.ForecastMetrics{
			CurrentCash:      1000000,  // Very low cash
			AvgDailyInflow:   30000,    // Low inflows
			AvgDailyOutflow:  80000,    // Very high outflows
			StdDev:           10000,
			TrendRate:        -0.05,
			TransactionCount: 100,
		},
		Forecast: []domain.ForecastPoint{
			{WeekNumber: 1, Baseline: 800000, UpperBound: 900000, LowerBound: 700000},
			{WeekNumber: 2, Baseline: 600000, UpperBound: 700000, LowerBound: 500000},
			{WeekNumber: 3, Baseline: -200000, UpperBound: -100000, LowerBound: -300000}, // NEGATIVE
		},
		Confidence: 0.68,
	}

	// Mock transactions showing revenue decline
	txns30 := []domain.BankTransaction{
		{Amount: 20000, TxnDate: time.Now().AddDate(0, 0, -25)},
	}
	txns90 := []domain.BankTransaction{
		{Amount: 100000, TxnDate: time.Now().AddDate(0, 0, -80)},
		{Amount: 100000, TxnDate: time.Now().AddDate(0, 0, -70)},
	}

	mockForecast.On("GenerateForecast", ctx, tenantID).Return(forecast, nil)
	mockTxnRepo.On("List", ctx, mock.MatchedBy(func(f domain.TransactionFilter) bool {
		return f.From != nil && f.From.After(time.Now().AddDate(0, 0, -31))
	})).Return(txns30, len(txns30), nil)
	mockTxnRepo.On("List", ctx, mock.MatchedBy(func(f domain.TransactionFilter) bool {
		return f.From != nil && f.From.Before(time.Now().AddDate(0, 0, -31))
	})).Return(txns90, len(txns90), nil)

	// Create decision engine
	engine := NewDecisionEngine(mockForecast, mockTxnRepo)

	// Execute
	actions, err := engine.RecommendActions(ctx, tenantID)

	// Verify
	assert.NoError(t, err)
	assert.NotNil(t, actions)
	assert.LessOrEqual(t, len(actions), 5, "Should return max 5 actions even when more are generated")

	mockForecast.AssertExpectations(t)
	mockTxnRepo.AssertExpectations(t)
}
