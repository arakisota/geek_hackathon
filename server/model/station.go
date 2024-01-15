package model

type TransportRecord struct {
	InformationId uint `gorm:"primaryKey;autoIncrement"`
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
