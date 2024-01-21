package usecase

import (
	"server/model"
	"server/repository"
)

type IStationUsecase interface {
	GetStations(departures model.StationsRequest) (model.StationsResponse, error)
	GetSuggestion(input model.SuggestionRequest) (model.SuggestionResponse, error)
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

	destinationMap := make(map[string]destinationInfo)

	for _, records := range recordsMap {
		for _, record := range records {
			destInfo, exists := destinationMap[record.Destination]
			if !exists {
				destInfo = destinationInfo{
					averageTime:  0.0,
					averageCount: 0.0,
					averageFare:  0.0,
				}
			}

			destInfo.averageTime += float64(record.Time)
			destInfo.averageCount += float64(record.Count)
			destInfo.averageFare += float64(record.Fare)

			destinationMap[record.Destination] = destInfo
		}
	}

	for dest, destInfo := range destinationMap {
		destInfo.averageTime /= float64(len(request.Departures))
		destInfo.averageCount /= float64(len(request.Departures))
		destInfo.averageFare /= float64(len(request.Departures))
		destinationMap[dest] = destInfo
	}

	fastestStation, fewestTransferStation, cheapestStation := FindStations(destinationMap)

	stations := model.StationsResponse{
		FastestStation:        fastestStation,
		FewestTransferStation: fewestTransferStation,
		CheapestStation:       cheapestStation,
	}

	return stations, nil
}

func (su *stationUsecase) GetSuggestion(input model.SuggestionRequest) (model.SuggestionResponse, error) {
	stations, err := su.sr.FindByPrefix(input.Input)
	if err != nil {
		return model.SuggestionResponse{}, err
	}

	var stationResponses []model.SuggestStation
	for _, station := range stations {
		stationResponses = append(stationResponses, model.SuggestStation{
			Name:      station.Name,
			Yomi:      station.Yomi,
			Longitude: station.Longitude,
			Latitude:  station.Latitude,
		})
	}

	return model.SuggestionResponse{Stations: stationResponses}, nil
}

type destinationInfo struct {
	averageTime  float64
	averageCount float64
	averageFare  float64
}

func FindStations(destinationMap map[string]destinationInfo) (string, string, string) {
	const inf = 100100.0

	fastestStation := ""
	fewestTransferStation := ""
	cheapestStation := ""

	fastestTime := inf
	fewestTransferCount := inf
	cheapestFare := inf

	for dest, destInfo := range destinationMap {
		if destInfo.averageTime < fastestTime {
			fastestTime = destInfo.averageTime
			fastestStation = dest
		}
		if destInfo.averageCount < fewestTransferCount {
			fewestTransferCount = destInfo.averageCount
			fewestTransferStation = dest
		}
		if destInfo.averageFare < cheapestFare {
			cheapestFare = destInfo.averageFare
			cheapestStation = dest
		}
	}

	return fastestStation, fewestTransferStation, cheapestStation
}
