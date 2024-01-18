package repository

import (
	"encoding/json"
	"net/http"
	"net/url"
	"strconv"
	"strings"

	"server/model"
)

// ホットペッパーグルメAPIへのリクエストとレスポンスの処理を行う
// 具体的には、クライアントからのリクエストデータをホットペッパーグルメAPIへのリクエストデータに変換し、ホットペッパーグルメAPIからのレスポンスデータをクライアントへのレスポンスデータに変換する。

type IRestaurantRepository interface {
	GetRestaurants(cr model.ClientRequest) ([]model.ClientResponse, error)
}

type RestaurantRepository struct {
	apiKey string
}

func NewRestaurantRepository(apiKey string) *RestaurantRepository {
	return &RestaurantRepository{apiKey: apiKey}
	RailRepo IRailRepository
}

func (hr *HotpepperRequest) toURLValues() url.Values {
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

func (rr *RestaurantRepository) GetRestaurants(cr model.ClientRequest) ([]model.ClientResponse, error) {
	hr := rr.convertClientRequestToHotpepperRequest(cr)

	u := "http://webservice.recruit.co.jp/hotpepper/gourmet/v1/?key=" + rr.apiKey + "&" + hr.toURLValues().Encode()

	resp, err := http.Get(u)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var hres model.HotpepperResponse
	if err := json.NewDecoder(resp.Body).Decode(&hres); err != nil {
		return nil, err
	}

	return rr.convertHotpepperResponseToClientResponse(hres), nil
}

// ここでクライアントからのリクエストデータをホットペッパーグルメAPIへのリクエストデータに変換する
func (rr *RestaurantRepository) convertClientRequestToHotpepperRequest(cr model.ClientRequest) model.HotpepperRequest {
	return model.HotpepperRequest{
		Name:    strings.Join(cr.Stations, ","),
		Keyword: cr.Purpose,
		Range:   cr.PeopleNum,
		Format:  "json",
	}
}

// ホットペッパーグルメAPIからのレスポンスデータを加工せずにクライアントへのレスポンスデータとして返す
func (rr *RestaurantRepository) convertHotpepperResponseToClientResponse(hr model.HotpepperResponse) []model.ClientResponse {
	return []model.ClientResponse{
		{
			Name:         hr.Name,
			Access:       hr.Access,
			Rating:       hr.Rating,
			Price:        hr.Price,
			Availability: hr.Availability,
			OpenTime:     hr.OpenTime,
			Genre:        hr.Genre,
			CouponUrls:   hr.CouponUrls,
		},
	}
}
