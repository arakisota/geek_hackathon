package model

type NeighborDistance struct {
	Station1 string
	Station2 string
	Distance float64
}

type RouteRequest struct {
	DepartureStations   []string `json:"departure_stations"`
	DestinationStations []string `json:"destination_stations"`
}

type RouteResponse struct {
	Destinations []Destination `json:"destinations"`
}

type Destination struct {
	Destination string  `json:"destination"`
	Routes      []Route `json:"routes"`
}

type Route struct {
	Stations []LatLng `json:"stations"`
}

type LatLng struct {
	Lat float64 `json:"lat"`
	Lng float64 `json:"lng"`
}
