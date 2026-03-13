package domain

import (
	"time"

	"github.com/google/uuid"
)

// DocumentType represents the type of financial document
type DocumentType string

const (
	DocumentTypePolicy    DocumentType = "policy"
	DocumentTypeContract  DocumentType = "contract"
	DocumentTypeReport    DocumentType = "report"
	DocumentTypeStatement DocumentType = "statement"
	DocumentTypeFAQ       DocumentType = "faq"
)

// DocumentStatus represents the processing status of a document
type DocumentStatus string

const (
	DocumentStatusProcessing DocumentStatus = "processing"
	DocumentStatusReady      DocumentStatus = "ready"
	DocumentStatusFailed     DocumentStatus = "failed"
)

// Document represents a financial document uploaded for RAG
type Document struct {
	ID         uuid.UUID      `json:"id"`
	TenantID   uuid.UUID      `json:"tenant_id"`
	Title      string         `json:"title"`
	Type       DocumentType   `json:"type"`
	FileName   string         `json:"file_name,omitempty"`
	MimeType   string         `json:"mime_type,omitempty"`
	Source     string         `json:"source,omitempty"`
	UploadedBy uuid.UUID      `json:"uploaded_by,omitempty"`
	Status     DocumentStatus `json:"status"`
	CreatedAt  time.Time      `json:"created_at"`
}

// CreateDocumentInput represents input for creating a document
type CreateDocumentInput struct {
	TenantID   uuid.UUID    `json:"tenant_id"`
	Title      string       `json:"title"`
	Type       DocumentType `json:"type"`
	FileName   string       `json:"file_name,omitempty"`
	MimeType   string       `json:"mime_type,omitempty"`
	Source     string       `json:"source,omitempty"`
	UploadedBy uuid.UUID    `json:"uploaded_by,omitempty"`
}

// UpdateDocumentInput represents input for updating a document
type UpdateDocumentInput struct {
	Title  *string         `json:"title,omitempty"`
	Status *DocumentStatus `json:"status,omitempty"`
}
