package usecase

import (
	"context"

	"github.com/finch-co/cashflow/internal/domain"
	"github.com/google/uuid"
)

type ForecastUsecase struct {
	repo   domain.TransactionRepository
	engine *ForecastEngine
}

func (u *ForecastUsecase) GetCurrentForecast(
	ctx context.Context,
	tenantID uuid.UUID,
	lookbackDays int,
) (*ForecastResponse, error)
