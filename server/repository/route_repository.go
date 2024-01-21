package repository

import (
	"server/model"

	"gorm.io/gorm"
)

type IRouteRepository interface {
	GetAllStation() ([]model.StationInfo, error)
	GetAllNeighborDistance() ([]model.NeighborDistance, error)
}

type routeRepository struct {
	db *gorm.DB
}

func NewRouteRepository(db *gorm.DB) IRouteRepository {
	return &routeRepository{db}
}

func (rr *routeRepository) GetAllStation() ([]model.StationInfo, error) {
    var records []model.StationInfo
    if err := rr.db.Find(&records).Error; err != nil {
        return nil, err
    }
    return records, nil
}

func (rr *routeRepository) GetAllNeighborDistance() ([]model.NeighborDistance, error) {
    var records []model.NeighborDistance
    if err := rr.db.Find(&records).Error; err != nil {
        return nil, err
    }
    return records, nil
}