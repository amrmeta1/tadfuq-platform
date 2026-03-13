package http

import (
	"fmt"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/rs/zerolog/log"

	"github.com/finch-co/cashflow/internal/domain"
	"github.com/finch-co/cashflow/internal/usecase"
)

// DecisionHandler handles HTTP requests for AI treasury action recommendations
type DecisionHandler struct {
	decisionEngine *usecase.DecisionEngine
}

// NewDecisionHandler creates a new decision handler
func NewDecisionHandler(engine *usecase.DecisionEngine) *DecisionHandler {
	return &DecisionHandler{
		decisionEngine: engine,
	}
}

// GetRecommendedActions handles GET /api/v1/tenants/{tenantID}/ai/actions
// Returns recommended treasury actions based on forecast and transaction analysis
func (h *DecisionHandler) GetRecommendedActions(w http.ResponseWriter, r *http.Request) {
	// Get tenant ID from URL
	tenantID, err := uuid.Parse(chi.URLParam(r, "tenantID"))
	if err != nil {
		writeErrorResponse(w, fmt.Errorf("%w: invalid tenant ID", domain.ErrValidation))
		return
	}

	// Get recommended actions
	actions, err := h.decisionEngine.RecommendActions(r.Context(), tenantID)
	if err != nil {
		log.Error().Err(err).Msg("Failed to generate recommended actions")
		// Return empty array on error (graceful degradation)
		actions = []domain.TreasuryAction{}
	}

	// Ensure we never return nil (always return empty array)
	if actions == nil {
		actions = []domain.TreasuryAction{}
	}

	// Return response
	response := map[string]interface{}{
		"data": map[string]interface{}{
			"actions": actions,
		},
	}

	writeJSON(w, http.StatusOK, response)
}
