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
	Id        uint `gorm:"primaryKey;unique"`
	Name      string
	Yomi      string
	Longitude float64
	Latitude  float64
}

type SuggestionRequest struct {
	Input string `json:"input"`
}

type SuggestionResponse struct {
	Stations []string `json:"stations"`
}
