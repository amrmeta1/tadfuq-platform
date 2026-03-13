package usecase

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/google/uuid"

	"github.com/finch-co/cashflow/internal/rag/adapter/llm"
	"github.com/finch-co/cashflow/internal/rag/domain"
	"github.com/finch-co/cashflow/internal/ragclient"
)

// RagQueryUseCase handles RAG query workflow
type RagQueryUseCase struct {
	chunkRepo     domain.ChunkRepository
	queryRepo     domain.QueryRepository
	searchUseCase *SearchChunksUseCase
	llmClient     llm.LLMClient
	ragClient     *ragclient.RagClient
}

// NewRagQueryUseCase creates a new RAG query use case
func NewRagQueryUseCase(
	chunkRepo domain.ChunkRepository,
	queryRepo domain.QueryRepository,
	searchUseCase *SearchChunksUseCase,
	llmClient llm.LLMClient,
	ragClient *ragclient.RagClient,
) *RagQueryUseCase {
	return &RagQueryUseCase{
		chunkRepo:     chunkRepo,
		queryRepo:     queryRepo,
		searchUseCase: searchUseCase,
		llmClient:     llmClient,
		ragClient:     ragClient,
	}
}

// RagQueryInput represents input for a RAG query
type RagQueryInput struct {
	TenantID uuid.UUID
	UserID   uuid.UUID
	Question string
}

// RagQueryOutput represents output from a RAG query
type RagQueryOutput struct {
	Answer    string            `json:"answer"`
	Citations []domain.Citation `json:"citations"`
}

// Execute performs a RAG query
func (uc *RagQueryUseCase) Execute(ctx context.Context, input RagQueryInput) (*RagQueryOutput, error) {
	// If external RAG client is configured, use it
	if uc.ragClient != nil {
		return uc.executeExternal(ctx, input)
	}

	// Otherwise, use embedded implementation
	return uc.executeEmbedded(ctx, input)
}

// executeExternal calls the external RAG service
func (uc *RagQueryUseCase) executeExternal(ctx context.Context, input RagQueryInput) (*RagQueryOutput, error) {
	// Call external service
	resp, err := uc.ragClient.Query(ctx, ragclient.QueryRequest{
		TenantID: input.TenantID.String(),
		Question: input.Question,
	})

	if err != nil {
		// Graceful fallback - return friendly message
		return &RagQueryOutput{
			Answer:    "AI assistant temporarily unavailable.",
			Citations: []domain.Citation{},
		}, nil
	}

	// Convert response to domain types
	citations := make([]domain.Citation, len(resp.Citations))
	for i, c := range resp.Citations {
		docID, _ := uuid.Parse(c.DocumentID)
		chunkID, _ := uuid.Parse(c.ChunkID)
		citations[i] = domain.Citation{
			DocumentID: docID,
			ChunkID:    chunkID,
			Content:    c.Content,
		}
	}

	// Store query (best effort)
	citationsJSON, _ := json.Marshal(citations)
	citationsMap := make(map[string]any)
	_ = json.Unmarshal(citationsJSON, &citationsMap)

	_, _ = uc.queryRepo.Create(ctx, domain.CreateQueryInput{
		TenantID:  input.TenantID,
		UserID:    input.UserID,
		Question:  input.Question,
		Answer:    resp.Answer,
		Citations: citationsMap,
	})

	return &RagQueryOutput{
		Answer:    resp.Answer,
		Citations: citations,
	}, nil
}

// executeEmbedded uses the embedded RAG implementation
func (uc *RagQueryUseCase) executeEmbedded(ctx context.Context, input RagQueryInput) (*RagQueryOutput, error) {
	// Validate dependencies
	if uc.searchUseCase == nil {
		return nil, fmt.Errorf("search use case not configured")
	}
	if uc.llmClient == nil {
		return nil, fmt.Errorf("LLM client not configured")
	}

	// Step 1: Search for relevant chunks
	searchResults, err := uc.searchUseCase.Execute(ctx, SearchChunksInput{
		TenantID: input.TenantID,
		Query:    input.Question,
		Limit:    5,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to search chunks: %w", err)
	}

	// Check if we have any results
	if len(searchResults.Chunks) == 0 {
		return &RagQueryOutput{
			Answer:    "I don't have enough information in the available documents.",
			Citations: []domain.Citation{},
		}, nil
	}

	// Step 2: Build context from chunks
	var contextBuilder strings.Builder
	contextBuilder.WriteString("Context:\n\n")
	for i, result := range searchResults.Chunks {
		contextBuilder.WriteString(fmt.Sprintf("[Document %d]\n%s\n\n", i+1, result.Chunk.Content))
	}

	// Step 3: Build prompt
	prompt := fmt.Sprintf(`You are a treasury AI assistant for the Tadfuq platform.

Use ONLY the provided context documents.
Do NOT invent facts.
If the answer is not found in the context, say:
"I don't have enough information in the available documents."

Answer clearly and concisely.
When relevant, reference the supporting documents.

%s
Question: %s`, contextBuilder.String(), input.Question)

	// Step 4: Call LLM
	llmResp, err := uc.llmClient.Complete(ctx, llm.CompletionRequest{
		Messages: []llm.Message{
			{Role: "user", Content: prompt},
		},
		MaxTokens: 1024,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to generate answer: %w", err)
	}

	// Step 5: Build citations
	citations := make([]domain.Citation, len(searchResults.Chunks))
	for i, result := range searchResults.Chunks {
		citations[i] = domain.Citation{
			DocumentID: result.Chunk.DocumentID,
			ChunkID:    result.Chunk.ID,
			Content:    result.Chunk.Content,
		}
	}

	// Step 6: Store query (optional - best effort)
	citationsJSON, _ := json.Marshal(citations)
	citationsMap := make(map[string]any)
	_ = json.Unmarshal(citationsJSON, &citationsMap)

	_, _ = uc.queryRepo.Create(ctx, domain.CreateQueryInput{
		TenantID:  input.TenantID,
		UserID:    input.UserID,
		Question:  input.Question,
		Answer:    llmResp.Content,
		Citations: citationsMap,
	})

	// Step 7: Return output
	return &RagQueryOutput{
		Answer:    llmResp.Content,
		Citations: citations,
	}, nil
}
