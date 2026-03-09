package rag

import (
	"context"
	"fmt"
	"strings"

	"github.com/google/uuid"
)

// ----------------------------------------------------------------
// Service interface (input port / use-case boundary)
// ----------------------------------------------------------------

// Service is the primary port callers (HTTP handlers, CLI) use.
// It exposes only the operations allowed in Phase 1.
type Service interface {
	// IngestDocument parses, chunks, embeds, and stores one document.
	// Returns the persisted Document on success.
	IngestDocument(ctx context.Context, req UploadRequest) (*Document, error)

	// Query answers a question using tenant-scoped vector retrieval.
	// Returns the answer plus citations (source chunks).
	Query(ctx context.Context, req QueryRequest) (*QueryResult, error)

	// ListDocuments returns all documents ingested for a tenant.
	ListDocuments(ctx context.Context, tenantID uuid.UUID) ([]Document, error)

	// DeleteDocument removes a document and all its chunks.
	DeleteDocument(ctx context.Context, tenantID, docID uuid.UUID) error
}

// ----------------------------------------------------------------
// Chunker  (pure domain helper — no external dependency)
// ----------------------------------------------------------------

type chunker struct {
	chunkSize    int
	chunkOverlap int
}

func newChunker(size, overlap int) *chunker {
	if size <= 0 {
		size = 800
	}
	if overlap < 0 || overlap >= size {
		overlap = 100
	}
	return &chunker{chunkSize: size, chunkOverlap: overlap}
}

// chunkPages splits multi-page text into overlapping Chunk objects.
func (c *chunker) chunkPages(pages []string) []rawChunk {
	var out []rawChunk
	idx := 0
	for pageNum, page := range pages {
		page = normaliseText(page)
		if page == "" {
			continue
		}
		sentences := splitSentences(page)
		var cur strings.Builder

		for i, sent := range sentences {
			if cur.Len() > 0 && cur.Len()+len(sent) > c.chunkSize {
				text := strings.TrimSpace(cur.String())
				if text != "" {
					out = append(out, rawChunk{Content: text, Index: idx, Page: pageNum + 1})
					idx++
				}
				// start next chunk with overlap
				overlapStart := overlapIndex(sentences[:i], c.chunkOverlap)
				cur.Reset()
				for _, s := range sentences[overlapStart:i] {
					cur.WriteString(s)
					cur.WriteRune(' ')
				}
			}
			cur.WriteString(sent)
			cur.WriteRune(' ')
		}
		if remaining := strings.TrimSpace(cur.String()); remaining != "" {
			out = append(out, rawChunk{Content: remaining, Index: idx, Page: pageNum + 1})
			idx++
		}
	}
	return out
}

type rawChunk struct {
	Content string
	Index   int
	Page    int
}

// ----------------------------------------------------------------
// Service implementation
// ----------------------------------------------------------------

// ServiceConfig holds tuning parameters injected at construction.
type ServiceConfig struct {
	ChunkSize    int
	ChunkOverlap int
	TopK         int
}

type service struct {
	docs     DocumentRepository
	chunks   ChunkRepository
	sessions SessionRepository
	embedder Embedder
	llm      LLM
	parser   Parser
	chunker  *chunker
	topK     int
}

// NewService constructs the RAG use-case implementation.
// All dependencies are injected via their domain interfaces —
// no infrastructure package is imported.
func NewService(
	docs     DocumentRepository,
	chunks   ChunkRepository,
	sessions SessionRepository,
	embedder Embedder,
	llm      LLM,
	parser   Parser,
	cfg      ServiceConfig,
) Service {
	topK := cfg.TopK
	if topK <= 0 {
		topK = 5
	}
	return &service{
		docs:     docs,
		chunks:   chunks,
		sessions: sessions,
		embedder: embedder,
		llm:      llm,
		parser:   parser,
		chunker:  newChunker(cfg.ChunkSize, cfg.ChunkOverlap),
		topK:     topK,
	}
}

// ----------------------------------------------------------------
// Use case: IngestDocument
// ----------------------------------------------------------------

func (s *service) IngestDocument(ctx context.Context, req UploadRequest) (*Document, error) {
	// 1. Guard: verify tenant exists
	ok, err := s.docs.TenantExists(ctx, req.TenantID)
	if err != nil {
		return nil, fmt.Errorf("rag.IngestDocument: checking tenant: %w", err)
	}
	if !ok {
		return nil, ErrTenantNotFound
	}

	// 2. Guard: category must be in the allowed RAG set
	if !AllowedCategories[req.Category] {
		return nil, ErrForbiddenCategory
	}

	// 3. Persist the document record in "processing" state
	doc := &Document{
		ID:       uuid.New(),
		TenantID: req.TenantID,
		Name:     req.FileName,
		FileType: req.FileType,
		Category: req.Category,
		FileSize: req.FileSize,
		Status:   StatusProcessing,
		Metadata: map[string]any{},
	}
	if err := s.docs.Save(ctx, doc); err != nil {
		return nil, fmt.Errorf("rag.IngestDocument: saving document record: %w", err)
	}

	// 4. Parse the binary file into pages
	parsed, err := s.parser.Parse(ctx, req.FileName, req.Data)
	if err != nil {
		_ = s.docs.UpdateStatus(ctx, req.TenantID, doc.ID, StatusFailed)
		return nil, fmt.Errorf("rag.IngestDocument: parsing: %w", err)
	}
	if len(parsed.Pages) == 0 {
		_ = s.docs.UpdateStatus(ctx, req.TenantID, doc.ID, StatusFailed)
		return nil, ErrEmptyDocument
	}
	doc.PageCount = parsed.PageCount

	// 5. Chunk the pages
	rawChunks := s.chunker.chunkPages(parsed.Pages)
	if len(rawChunks) == 0 {
		_ = s.docs.UpdateStatus(ctx, req.TenantID, doc.ID, StatusFailed)
		return nil, ErrEmptyDocument
	}

	// 6. Embed all chunks (voyage-finance-2)
	texts := make([]string, len(rawChunks))
	for i, rc := range rawChunks {
		texts[i] = rc.Content
	}
	vectors, err := s.embedder.EmbedDocuments(ctx, texts)
	if err != nil {
		_ = s.docs.UpdateStatus(ctx, req.TenantID, doc.ID, StatusFailed)
		return nil, fmt.Errorf("rag.IngestDocument: embedding: %w", err)
	}

	// 7. Build domain Chunk objects
	domainChunks := make([]Chunk, len(rawChunks))
	for i, rc := range rawChunks {
		domainChunks[i] = Chunk{
			ID:         uuid.New(),
			TenantID:   req.TenantID,
			DocumentID: doc.ID,
			Content:    rc.Content,
			ChunkIndex: rc.Index,
			PageNumber: rc.Page,
			Embedding:  vectors[i],
			Metadata:   map[string]any{},
		}
	}

	// 8. Batch-insert chunks
	if err := s.chunks.SaveBatch(ctx, domainChunks); err != nil {
		_ = s.docs.UpdateStatus(ctx, req.TenantID, doc.ID, StatusFailed)
		return nil, fmt.Errorf("rag.IngestDocument: saving chunks: %w", err)
	}

	// 9. Mark document as ready; persist updated page count
	doc.Status = StatusReady
	if err := s.docs.Save(ctx, doc); err != nil {
		return nil, fmt.Errorf("rag.IngestDocument: finalising document: %w", err)
	}

	return doc, nil
}

// ----------------------------------------------------------------
// Use case: Query
// ----------------------------------------------------------------

func (s *service) Query(ctx context.Context, req QueryRequest) (*QueryResult, error) {
	// 1. Guard: tenant must exist
	ok, err := s.docs.TenantExists(ctx, req.TenantID)
	if err != nil {
		return nil, fmt.Errorf("rag.Query: checking tenant: %w", err)
	}
	if !ok {
		return nil, ErrTenantNotFound
	}

	// 2. Embed the query
	queryVec, err := s.embedder.EmbedQuery(ctx, req.Question)
	if err != nil {
		return nil, fmt.Errorf("rag.Query: embedding query: %w", err)
	}

	// 3. Tenant-scoped similarity search
	scored, err := s.chunks.SearchSimilar(ctx, req.TenantID, queryVec, s.topK)
	if err != nil {
		return nil, fmt.Errorf("rag.Query: similarity search: %w", err)
	}

	if len(scored) == 0 {
		return &QueryResult{
			Answer:    "I could not find relevant information in your documents to answer this question.",
			Citations: []Citation{},
			TenantID:  req.TenantID,
		}, nil
	}

	// 4. Get / create session + load history
	var sessionID uuid.UUID
	var history []LLMMessage

	if req.SessionID != nil {
		sessionID = *req.SessionID
		history, _ = s.sessions.GetHistory(ctx, req.TenantID, sessionID, 10)
	} else {
		sessionID, err = s.sessions.CreateSession(ctx, req.TenantID, "")
		if err != nil {
			return nil, fmt.Errorf("rag.Query: creating session: %w", err)
		}
	}

	// 5. Build grounded context for the LLM
	contextText := buildContext(scored)

	// 6. Generate answer — only grounded in the retrieved context
	answer, err := s.llm.Answer(ctx, req.Question, contextText, history)
	if err != nil {
		return nil, fmt.Errorf("rag.Query: llm answer: %w", err)
	}

	// 7. Persist conversation turn
	_ = s.sessions.SaveMessage(ctx, sessionID, req.TenantID, "user", req.Question)
	_ = s.sessions.SaveMessage(ctx, sessionID, req.TenantID, "assistant", answer)

	// 8. Build citations
	citations := makeCitations(scored)

	return &QueryResult{
		Answer:    answer,
		Citations: citations,
		SessionID: sessionID,
		TenantID:  req.TenantID,
	}, nil
}

func (s *service) ListDocuments(ctx context.Context, tenantID uuid.UUID) ([]Document, error) {
	ok, err := s.docs.TenantExists(ctx, tenantID)
	if err != nil {
		return nil, err
	}
	if !ok {
		return nil, ErrTenantNotFound
	}
	return s.docs.ListByTenant(ctx, tenantID)
}

func (s *service) DeleteDocument(ctx context.Context, tenantID, docID uuid.UUID) error {
	return s.docs.Delete(ctx, tenantID, docID)
}

// ----------------------------------------------------------------
// Helpers (pure, no I/O)
// ----------------------------------------------------------------

func buildContext(chunks []ScoredChunk) string {
	var sb strings.Builder
	for i, c := range chunks {
		sb.WriteString(fmt.Sprintf(
			"[Source %d | %s | page %d | %.0f%% match]\n%s\n\n",
			i+1, c.DocumentName, c.PageNumber, c.Similarity*100, c.Content,
		))
	}
	return sb.String()
}

func makeCitations(chunks []ScoredChunk) []Citation {
	out := make([]Citation, len(chunks))
	for i, c := range chunks {
		excerpt := c.Content
		if len(excerpt) > 300 {
			excerpt = excerpt[:300] + "…"
		}
		out[i] = Citation{
			DocumentID:   c.DocumentID,
			DocumentName: c.DocumentName,
			PageNumber:   c.PageNumber,
			ChunkIndex:   c.ChunkIndex,
			Excerpt:      excerpt,
			Similarity:   c.Similarity,
		}
	}
	return out
}

// splitSentences splits on sentence boundaries, preserving tables & newlines.
func splitSentences(text string) []string {
	var sentences []string
	var cur strings.Builder
	runes := []rune(text)
	for i, r := range runes {
		cur.WriteRune(r)
		if r == '\n' && cur.Len() > 40 {
			sentences = append(sentences, cur.String())
			cur.Reset()
			continue
		}
		if (r == '.' || r == '!' || r == '?') && i+1 < len(runes) {
			next := runes[i+1]
			if (next == ' ' || next == '\n') && cur.Len() > 20 {
				sentences = append(sentences, cur.String())
				cur.Reset()
			}
		}
	}
	if rest := strings.TrimSpace(cur.String()); rest != "" {
		sentences = append(sentences, rest)
	}
	return sentences
}

func overlapIndex(sentences []string, overlapSize int) int {
	total := 0
	for i := len(sentences) - 1; i >= 0; i-- {
		total += len(sentences[i])
		if total >= overlapSize {
			return i
		}
	}
	return 0
}

func normaliseText(s string) string {
	var sb strings.Builder
	prev := false
	for _, r := range s {
		if r == ' ' || r == '\t' || r == '\r' {
			if !prev {
				sb.WriteRune(' ')
			}
			prev = true
		} else {
			sb.WriteRune(r)
			prev = false
		}
	}
	return strings.TrimSpace(sb.String())
}
