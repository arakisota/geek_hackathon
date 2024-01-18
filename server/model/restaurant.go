package model

import (
	"net/url"
	"strconv"
	"time"
)

// データの構造を定義
// 具体的には、クライアントからのリクエストデータ、ホットペッパーグルメAPIへのリクエストデータ、ホットペッパーグルメAPIからのレスポンスデータ、クライアントへのレスポンスデータの各構造体を定義する

// クライアントからのリクエストデータを定義
type ClientRequest struct {
	Stations    []string  `json:"stations"`
	PeopleNum   int       `json:"people_num"`
	ArrivalTime time.Time `json:"arrival_time"`
	Purpose     string    `json:"purpose"`
}

// ホットペッパーグルメAPIへのリクエストデータを定義
type HotpepperRequest struct {
	Name    string  `json:"name"`
	Keyword string  `json:"keyword"`
	Lat     float64 `json:"lat"`
	Lng     float64 `json:"lng"`
	Range   int     `json:"range"`
	Budget  string  `json:"budget"`
	Order   int     `json:"order"`
	Format  string  `json:"format"`
}

func (hr *HotpepperRequest) ToURLValues() url.Values {
	values := url.Values{}
	values.Add("name", hr.Name)
	values.Add("keyword", hr.Keyword)
	values.Add("lat", strconv.FormatFloat(hr.Lat, 'f', -1, 64))
	values.Add("lng", strconv.FormatFloat(hr.Lng, 'f', -1, 64))
	values.Add("range", strconv.Itoa(hr.Range))
	values.Add("budget", hr.Budget)
	values.Add("order", strconv.Itoa(hr.Order))
	values.Add("format", hr.Format)

	return values
}

// ホットペッパーグルメAPIからのレスポンスデータを定義
type HotpepperResponse struct {
	Name         string    `json:"name"`
	Access       string    `json:"access"`
	Rating       float64   `json:"rating"`
	Price        float64   `json:"price"`
	Availability bool      `json:"availability"`
	OpenTime     time.Time `json:"open_time"`
	Genre        string    `json:"genre"`
	CouponUrls   string    `json:"coupon_urls"`
}

// クライアントへのレスポンスデータを定義
type ClientResponse struct {
	Name         string    `json:"name"`
	Access       string    `json:"access"`
	Rating       float64   `json:"rating"`
	Price        float64   `json:"price"`
	Availability bool      `json:"availability"`
	OpenTime     time.Time `json:"open_time"`
	Genre        string    `json:"genre"`
	CouponUrls   string    `json:"coupon_urls"`
}

type StationCoordinates struct {
	Name      string
	Latitude  float64
	Longitude float64
}
