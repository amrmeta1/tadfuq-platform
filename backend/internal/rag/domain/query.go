package domain

import (
	"time"

	"github.com/google/uuid"
)

// RagQuery represents a RAG query with answer and citations
type RagQuery struct {
	ID        uuid.UUID      `json:"id"`
	TenantID  uuid.UUID      `json:"tenant_id"`
	UserID    uuid.UUID      `json:"user_id,omitempty"`
	Question  string         `json:"question"`
	Answer    string         `json:"answer,omitempty"`
	Citations map[string]any `json:"citations,omitempty"`
	CreatedAt time.Time      `json:"created_at"`
}

// CreateQueryInput represents input for creating a RAG query
type CreateQueryInput struct {
	TenantID  uuid.UUID      `json:"tenant_id"`
	UserID    uuid.UUID      `json:"user_id,omitempty"`
	Question  string         `json:"question"`
	Answer    string         `json:"answer,omitempty"`
	Citations map[string]any `json:"citations,omitempty"`
}

// Citation represents a reference to a source document chunk
type Citation struct {
	DocumentID uuid.UUID `json:"document_id"`
	ChunkID    uuid.UUID `json:"chunk_id"`
	Content    string    `json:"content,omitempty"`
}
