package model

// 駅コードを取得するために使用するAPIのリクエスト
type LightInformationRequest struct {
	Format         string `json:"format"`
	APIKEY         string `json:"apikey"`
	Name           string `json:"name"`
	Type           string `json:"type"`
	PrefectureCode uint   `json:"prefectureCode"`
}

// 駅コードを取得するために使用するAPIのレスポンス
type LightInformationResponse struct {
	Code string `json:"code"`
}

// 経路を検索するために使用するAPIのリクエスト
type RouteRequest struct {
	Format  string `json:"format"`
	APIKEY  string `json:"apikey"`
	ViaList string `json:"viaList"`
}

// クライアントからのリクエスト
type ClientRequestRoute struct {
	DepartureStations   []string `json:"departure_stations"`
	DestinationStations []string `json:"destination_staions"`
}

type Station2 struct {
	Name      string  `json:"name"`
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
}

type Route struct {
	Stations []Station `json:"stations"`
}

// クライアントへのレスポンス
type ClientResponseRoute struct {
	Routes []Route `json:"routes"`
}
