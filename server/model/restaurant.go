package model

import (
	"time"
)

// データの構造を定義
// 具体的には、クライアントからのリクエストデータ、ホットペッパーグルメAPIへのリクエストデータ、ホットペッパーグルメAPIからのレスポンスデータ、クライアントへのレスポンスデータの各構造体を定義する
// 100こ取ってきて、そのうち上から5こは別個で分ける必要がある

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

type Option struct {
	PeopleNum  int    `json:"people_num"`
	ArriveTime string `json:"arrive_time"`
	Category   string `json:"category"`
}

// ホットペッパーグルメAPIへのリクエストデータを定義
type HotpepperRequest struct {
	Name []string  `json:"name"`
	Lat  []float64 `json:"lat"`
	Lng  []float64 `json:"lng"`
}

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

type Plan struct {
	Plan   string    `json:"plan"`
	Stores []Station `json:"stores"`
}

type Plans struct {
	Plans []Plan `json:"plans"`
}

type StationPlan struct {
	StationPlan []Plans `json:"station_plan"`
}

// gRPCサービスから受け取るレストラン情報を表す構造体
type GrpcResponse struct {
	StationPlans []StationPlan `json:"station_plans"`
}

type RestaurantResponse struct {
	Stations []Station `json:"stations"`
}

// クライアントへのレスポンスデータを定義
type ClientResponse struct {
	Stations    []Station   `json:"stations"`
	StationPlan StationPlan `json:"station_plans"`
}
