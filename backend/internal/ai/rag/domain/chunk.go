package domain

import (
	"time"

	"github.com/google/uuid"
)

// DocumentChunk represents a text chunk from a document with its embedding
type DocumentChunk struct {
	ID         uuid.UUID      `json:"id"`
	TenantID   uuid.UUID      `json:"tenant_id"`
	DocumentID uuid.UUID      `json:"document_id"`
	Index      int            `json:"chunk_index"`
	Content    string         `json:"content"`
	Embedding  []float32      `json:"embedding,omitempty"`
	Metadata   map[string]any `json:"metadata,omitempty"`
	CreatedAt  time.Time      `json:"created_at"`
}

// CreateChunkInput represents input for creating a document chunk
type CreateChunkInput struct {
	TenantID   uuid.UUID      `json:"tenant_id"`
	DocumentID uuid.UUID      `json:"document_id"`
	Index      int            `json:"chunk_index"`
	Content    string         `json:"content"`
	Embedding  []float32      `json:"embedding,omitempty"`
	Metadata   map[string]any `json:"metadata,omitempty"`
}

// ChunkSearchResult represents a chunk with similarity score
type ChunkSearchResult struct {
	Chunk      DocumentChunk `json:"chunk"`
	Similarity float64       `json:"similarity"`
}
