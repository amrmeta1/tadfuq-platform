package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	// ── Legacy RAG (existing endpoints — left untouched) ──────────
	legacyapi "github.com/rag-service/internal/api"
	"github.com/rag-service/internal/config"
	legacydb "github.com/rag-service/internal/db"
	"github.com/rag-service/internal/embeddings"
	"github.com/rag-service/internal/llm"
	legacyrag "github.com/rag-service/internal/rag"

	// ── Tadfuq RAG Phase 1 (tenant-scoped, clean arch) ───────────
	ragdomain "github.com/rag-service/internal/domain/rag"
	infradb "github.com/rag-service/internal/infrastructure/db"
	infraemb "github.com/rag-service/internal/infrastructure/embeddings"
	infrallm "github.com/rag-service/internal/infrastructure/llm"
	infraproc "github.com/rag-service/internal/infrastructure/processor"
	raghttp "github.com/rag-service/internal/interfaces/http/rag"

	// ── Tadfuq Insights Engine (deterministic, no LLM) ────────────
	insightsdomain "github.com/rag-service/internal/domain/insights"
	insightshttp "github.com/rag-service/internal/interfaces/http/insights"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("config: %v", err)
	}

	// ── Legacy RAG ───────────────────────────────────────────────
	legacyDatabase, err := legacydb.New(cfg.DSN())
	if err != nil {
		log.Fatalf("legacy db: %v", err)
	}
	defer legacyDatabase.Close()
	log.Println("✓ Legacy database connected")

	legacyClaude := llm.New(cfg.AnthropicAPIKey)
	legacyEmbedder := embeddings.New(cfg.VoyageAPIKey)

	legacyPipeline := legacyrag.New(legacyDatabase, legacyEmbedder, legacyClaude, legacyrag.Config{
		TopK:         cfg.TopK,
		ChunkSize:    cfg.ChunkSize,
		ChunkOverlap: cfg.ChunkOverlap,
	})

	// ── Tadfuq RAG Phase 1 ───────────────────────────────────────

	// Single RAGStore satisfies DocumentRepository + ChunkRepository + SessionRepository
	ragStore, err := infradb.NewRAGStore(cfg.DSN())
	if err != nil {
		log.Fatalf("tadfuq rag store: %v", err)
	}
	defer ragStore.Close()
	log.Println("✓ Tadfuq RAG store connected")

	ragEmbedder := infraemb.NewVoyageEmbedder(cfg.VoyageAPIKey)
	ragLLM := infrallm.NewClaudeLLM(cfg.AnthropicAPIKey)
	ragParser := infraproc.NewDocumentParser(ragLLM)

	ragService := ragdomain.NewService(
		ragStore,    // domain.DocumentRepository
		ragStore,    // domain.ChunkRepository
		ragStore,    // domain.SessionRepository
		ragEmbedder, // domain.Embedder
		ragLLM,      // domain.LLM
		ragParser,   // domain.Parser
		ragdomain.ServiceConfig{
			ChunkSize:    cfg.ChunkSize,
			ChunkOverlap: cfg.ChunkOverlap,
			TopK:         cfg.TopK,
		},
	)
	log.Println("✓ Tadfuq RAG service initialised (Phase 1)")

	// ── HTTP Router ──────────────────────────────────────────────
	legacyHandler := legacyapi.NewHandler(legacyPipeline)
	router := legacyapi.SetupRouter(legacyHandler) // returns *gin.Engine

	// Mount Phase-1 RAG routes
	raghttp.RegisterRoutes(router, raghttp.NewHandler(ragService))

	// ── Insights Engine (deterministic — reuses same DB DSN, zero LLM) ───
	// InsightsStore is separate from RAGStore: no coupling between subsystems.
	insightsStore, err := infradb.NewInsightsStoreFromDSN(cfg.DSN())
	if err != nil {
		log.Fatalf("insights store: %v", err)
	}
	log.Println("✓ Insights Engine store connected")

	insightsService := insightsdomain.NewService(insightsStore)
	insightshttp.RegisterRoutes(router, insightshttp.NewHandler(insightsService))
	log.Println("✓ Insights Engine registered — GET /api/v1/tenants/:tenantId/insights")

	// ── Server ───────────────────────────────────────────────────
	addr := cfg.ServerHost + ":" + cfg.ServerPort
	srv := &http.Server{
		Addr:         addr,
		Handler:      router,
		ReadTimeout:  10 * time.Minute,
		WriteTimeout: 10 * time.Minute,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		log.Printf("🚀 Tadfuq Financial RAG API → http://%s", addr)
		log.Printf("   RAG:      POST /api/v1/tenants/:tenantId/rag/query")
		log.Printf("   Insights: GET  /api/v1/tenants/:tenantId/insights")
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("server: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("shutting down…")
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Printf("force shutdown: %v", err)
	}
	log.Println("server exited")
}
