package model

import (
	"time"
)

// データの構造を定義
// 具体的には、クライアントからのリクエストデータ、ホットペッパーグルメAPIへのリクエストデータ、ホットペッパーグルメAPIからのレスポンスデータ、クライアントへのレスポンスデータの各構造体を定義する

type StationCoordinates struct {
	Name      string
	Latitude  float64
	Longitude float64
}

type Genre struct {
	Catch string `json:"catch"`
	Name  string `json:"name"`
}

// クライアントからのリクエストデータを定義
type ClientRequest struct {
	Stations    []string  `json:"stations"`
	PeopleNum   int       `json:"people_num"`
	ArrivalTime time.Time `json:"arrival_time"`
	Purpose     string    `json:"purpose"`
}

// ホットペッパーグルメAPIへのリクエストデータを定義
type HotpepperRequest struct {
	Name []string  `json:"name"`
	Lat  []float64 `json:"lat"`
	Lng  []float64 `json:"lng"`
}

// ホットペッパーグルメAPIからのレスポンスデータを定義
// type HotpepperResponse struct {
// 	Name       string  `json:"name"`
// 	Address    string  `json:"address"`
// 	Access     string  `json:"access"`
// 	Latitude   float64 `json:"latitude"`
// 	Longitude  float64 `json:"longitude"`
// 	Budget     string  `json:"budget"`
// 	Open       string  `json:"open"`
// 	Genre      Genre   `json:"genre"`
// 	CouponUrls string  `json:"coupon_urls"`
// }

type Station struct {
	Name       string  `json:"name"`
	Address    string  `json:"address"`
	Access     string  `json:"access"`
	Latitude   float64 `json:"lat"`
	Longitude  float64 `json:"lng"`
	Budget     string  `json:"budget"`
	Open       string  `json:"open"`
	Genre      Genre   `json:"genre"`
	CouponUrls string  `json:"coupon_urls"`
	ImageUrl   string  `json:"image_url"`
}

// クライアントへのレスポンスデータを定義
type ClientResponse struct {
	Stations []Station `json:"stations"`
}
