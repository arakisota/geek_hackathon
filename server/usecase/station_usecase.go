package usecase

import (
	"server/model"
	"server/repository"
)

type IStationUsecase interface {
	GetStations(departures model.StationsRequest) (model.StationsResponse, error)
}

type stationUsecase struct {
	sr repository.IStationRepository
}

func NewStationUsecase(sr repository.IStationRepository) IStationUsecase {
	return &stationUsecase{sr}
}

func (su *stationUsecase) GetStations(request model.StationsRequest) (model.StationsResponse, error) {
	recordsMap := make(map[string][]model.TransportRecord)

	for _, departure := range request.Departures {
		if _, exists := recordsMap[departure]; exists {
			continue
		}
		records, err := su.sr.GetTransportRecordsByDeparture(departure)
		if err != nil {
			return model.StationsResponse{}, err
		}
		recordsMap[departure] = records
	}

	fastestStation, _ :=         FindFastestArrivalStation(recordsMap)
	fewestTrasitionStation, _ := FindFewestTransferStation(recordsMap)
	cheapestStation, _ :=        FindCheapestStation(recordsMap)

	stations := model.StationsResponse{
		FastestStation:         fastestStation,
		FewestTrasitionStation: fewestTrasitionStation,
		CheapestStation:        cheapestStation,
	}

	return stations, nil
}

func FindFastestArrivalStation(departuresMap map[string][]model.TransportRecord) (string, error) {
	return "", nil
}

func FindFewestTransferStation(departuresMap map[string][]model.TransportRecord) (string, error) {
	return "", nil
}

func FindCheapestStation(departuresMap map[string][]model.TransportRecord) (string, error) {
	return "", nil
}
