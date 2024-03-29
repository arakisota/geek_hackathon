package model

type TransportRecord struct {
	InformationId uint `gorm:"primaryKey;unique"`
	Departure     string
	Destination   string
	Time          uint
	Count         uint
	Fare          uint
}

type StationsRequest struct {
	Departures []string `json:"departures"`
}

type StationsResponse struct {
	FastestStation        string `json:"fastest_station"`
	FewestTransferStation string `json:"fewest_transfer_station"`
	CheapestStation       string `json:"cheapest_station"`
}

type StationInfo struct {
	Name           string
	Yomi           string
	Longitude      float64
	Latitude       float64
	StationCode    uint `gorm:"primaryKey;unique"`
	PrefectureCode uint
}

type SuggestStation struct {
	Name      string  `json:"Name"`
	Yomi      string  `json:"Yomi"`
	Longitude float64 `json:"Longitude"`
	Latitude  float64 `json:"Latitude"`
}

type SuggestionRequest struct {
	Input string `json:"input"`
}

type SuggestionResponse struct {
	Stations []SuggestStation `json:"stations"`
}
