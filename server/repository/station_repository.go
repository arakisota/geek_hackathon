package repository

import (
	"server/model"

	"gorm.io/gorm"
)

type IStationRepository interface {
	GetTransportRecordsByDeparture(departure string) ([]model.TransportRecord, error)
}

type stationRepository struct {
	db *gorm.DB
}

func NewStationRepository(db *gorm.DB) IStationRepository {
	return &stationRepository{db}
}

func (sr *stationRepository) GetTransportRecordsByDeparture(departure string) ([]model.TransportRecord, error) {
    var records []model.TransportRecord
    if err := sr.db.Where("departure=?", departure).Find(&records).Error; err != nil {
        return nil, err
    }
    return records, nil
}