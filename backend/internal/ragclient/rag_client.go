package ragclient

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/rs/zerolog/log"
)

// RagClient is an HTTP client for the external RAG service
type RagClient struct {
	baseURL    string
	httpClient *http.Client
}

// QueryRequest represents a query request to the external RAG service
type QueryRequest struct {
	TenantID string `json:"tenant_id"`
	Question string `json:"question"`
}

// QueryResponse represents a response from the external RAG service
type QueryResponse struct {
	Answer    string     `json:"answer"`
	Citations []Citation `json:"citations"`
}

// Citation represents a document citation
type Citation struct {
	DocumentID string `json:"document_id"`
	ChunkID    string `json:"chunk_id"`
	Content    string `json:"content,omitempty"`
}

// NewRagClient creates a new RAG client
func NewRagClient(baseURL string) *RagClient {
	return &RagClient{
		baseURL: baseURL,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// Query sends a query to the external RAG service
func (c *RagClient) Query(ctx context.Context, req QueryRequest) (*QueryResponse, error) {
	// Build request URL
	url := fmt.Sprintf("%s/query", c.baseURL)

	// Marshal request body
	body, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	// Create HTTP request
	httpReq, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	httpReq.Header.Set("Content-Type", "application/json")

	// Send request
	log.Debug().
		Str("url", url).
		Str("tenant_id", req.TenantID).
		Msg("Sending query to external RAG service")

	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		log.Warn().Err(err).Msg("External RAG service unavailable")
		return nil, fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	// Read response body
	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	// Check status code
	if resp.StatusCode != http.StatusOK {
		log.Warn().
			Int("status", resp.StatusCode).
			Str("body", string(respBody)).
			Msg("External RAG service returned error")
		return nil, fmt.Errorf("service returned status %d: %s", resp.StatusCode, string(respBody))
	}

	// Parse response
	var queryResp QueryResponse
	if err := json.Unmarshal(respBody, &queryResp); err != nil {
		return nil, fmt.Errorf("failed to parse response: %w", err)
	}

	log.Debug().
		Str("tenant_id", req.TenantID).
		Int("citations", len(queryResp.Citations)).
		Msg("Received response from external RAG service")

	return &queryResp, nil
}
