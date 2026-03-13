package http

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/rs/zerolog/log"

	"github.com/finch-co/cashflow/internal/ai/router"
	domain "github.com/finch-co/cashflow/internal/domain"
	ragDomain "github.com/finch-co/cashflow/internal/rag/domain"
	ragUsecase "github.com/finch-co/cashflow/internal/rag/usecase"
)

// RagHandler handles HTTP requests for RAG queries
type RagHandler struct {
	queryRepo    ragDomain.QueryRepository
	ragUseCase   *ragUsecase.RagQueryUseCase
	hybridRouter *router.HybridRouter
}

// NewRagHandler creates a new RAG handler
func NewRagHandler(
	queryRepo ragDomain.QueryRepository,
	ragUseCase *ragUsecase.RagQueryUseCase,
	hybridRouter *router.HybridRouter,
) *RagHandler {
	return &RagHandler{
		queryRepo:    queryRepo,
		ragUseCase:   ragUseCase,
		hybridRouter: hybridRouter,
	}
}

// RegisterRoutes registers RAG query routes
func (h *RagHandler) RegisterRoutes(r chi.Router) {
	r.Post("/query", h.Query)
	r.Get("/queries", h.ListQueries)
	r.Get("/queries/{queryID}", h.GetQuery)
}

// Query handles RAG query requests
func (h *RagHandler) Query(w http.ResponseWriter, r *http.Request) {
	// Get tenant ID from context
	tenantID, ok := domain.TenantIDFromContext(r.Context())
	if !ok {
		writeErrorResponse(w, http.StatusBadRequest, "tenant_id required")
		return
	}

	// Parse request body
	var req struct {
		Question string `json:"question"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeErrorResponse(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.Question == "" {
		writeErrorResponse(w, http.StatusBadRequest, "question is required")
		return
	}

	// Route through hybrid router if available
	if h.hybridRouter != nil {
		result, err := h.hybridRouter.Route(r.Context(), router.RouterInput{
			TenantID: tenantID,
			Question: req.Question,
		})
		if err != nil {
			log.Error().Err(err).Msg("Hybrid router failed")
			writeErrorResponse(w, http.StatusInternalServerError, "failed to process query")
			return
		}

		// Convert to RAG response format (exclude metadata from public API)
		response := &ragUsecase.RagQueryOutput{
			Answer:    result.Answer,
			Citations: result.Citations,
		}
		writeJSON(w, http.StatusOK, response)
		return
	}

	// Fallback to existing RAG use case
	result, err := h.ragUseCase.Execute(r.Context(), ragUsecase.RagQueryInput{
		TenantID: tenantID,
		Question: req.Question,
	})
	if err != nil {
		log.Error().Err(err).Msg("RAG query failed")
		writeErrorResponse(w, http.StatusInternalServerError, "failed to process query")
		return
	}

	// Return response
	writeJSON(w, http.StatusOK, result)
}

// ListQueries handles listing query history
func (h *RagHandler) ListQueries(w http.ResponseWriter, r *http.Request) {
	tenantID, ok := domain.TenantIDFromContext(r.Context())
	if !ok {
		writeErrorResponse(w, http.StatusBadRequest, "tenant_id required")
		return
	}

	limit := 20
	offset := 0

	queries, total, err := h.queryRepo.ListByTenant(r.Context(), tenantID, limit, offset)
	if err != nil {
		writeErrorResponse(w, http.StatusInternalServerError, "failed to list queries")
		return
	}

	response := map[string]interface{}{
		"queries": queries,
		"total":   total,
		"limit":   limit,
		"offset":  offset,
	}
	writeJSON(w, http.StatusOK, response)
}

// GetQuery handles getting a single query
func (h *RagHandler) GetQuery(w http.ResponseWriter, r *http.Request) {
	tenantID, ok := domain.TenantIDFromContext(r.Context())
	if !ok {
		writeErrorResponse(w, http.StatusBadRequest, "tenant_id required")
		return
	}

	queryID, err := uuid.Parse(chi.URLParam(r, "queryID"))
	if err != nil {
		writeErrorResponse(w, http.StatusBadRequest, "invalid query ID")
		return
	}

	query, err := h.queryRepo.GetByID(r.Context(), tenantID, queryID)
	if err != nil {
		writeErrorResponse(w, http.StatusNotFound, "query not found")
		return
	}

	writeJSON(w, http.StatusOK, query)
}
