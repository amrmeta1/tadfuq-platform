package http

import (
	"fmt"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"

	"github.com/finch-co/cashflow/internal/domain"
	"github.com/finch-co/cashflow/internal/usecase"
)

// CashStoryHandler handles HTTP requests for cash story generation
type CashStoryHandler struct {
	uc *usecase.CashStoryUseCase
}

// NewCashStoryHandler creates a new cash story HTTP handler
func NewCashStoryHandler(uc *usecase.CashStoryUseCase) *CashStoryHandler {
	return &CashStoryHandler{uc: uc}
}

// GetCashStory handles GET /api/v1/tenants/{tenantID}/cash-story
// Returns an AI-generated narrative explaining recent cash movements
func (h *CashStoryHandler) GetCashStory(w http.ResponseWriter, r *http.Request) {
	tenantID, err := uuid.Parse(chi.URLParam(r, "tenantID"))
	if err != nil {
		writeErrorResponse(w, fmt.Errorf("%w: invalid tenant ID", domain.ErrValidation))
		return
	}

	result, err := h.uc.GenerateCashStory(r.Context(), tenantID)
	if err != nil {
		writeErrorResponse(w, err)
		return
	}

	writeJSON(w, http.StatusOK, result)
}
