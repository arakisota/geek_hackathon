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
	FastestStation         string `json:"fastest_station"`
	FewestTrasitionStation string `json:"fewest_trasition_station"`
	CheapestStation        string `json:"cheapest_station"`
}
