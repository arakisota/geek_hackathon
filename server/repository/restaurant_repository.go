package repository

import (
	"encoding/json"
	"net/http"
	"os"
	"strings"

	"gorm.io/gorm"

	"server/model"
)

// ホットペッパーグルメAPIへのリクエストとレスポンスの処理を行う
// 具体的には、クライアントからのリクエストデータをホットペッパーグルメAPIへのリクエストデータに変換し、ホットペッパーグルメAPIからのレスポンスデータをクライアントへのレスポンスデータに変換する。

type IRestaurantRepository interface {
	GetRestaurants(cr model.ClientRequest) ([]model.ClientResponse, error)
}

type RestaurantRepository struct {
	db     *gorm.DB
	apiKey string
}

func NewRestaurantRepository(db *gorm.DB) *RestaurantRepository {
	apiKey := os.Getenv("HOTPEPPER_API_KEY") // 環境変数からAPIキーを取得
	return &RestaurantRepository{db: db, apiKey: apiKey}
}

func (rr *RestaurantRepository) GetStationCoordinates(station string) ([]model.StationCoordinates, error) {
	var sc []model.StationCoordinates
	if err := rr.db.Where("name=?", station).Find(&sc).Error; err != nil {
		return nil, err
	}
	return sc, nil
}

func (rr *RestaurantRepository) GetRestaurants(cr model.ClientRequest) ([]model.ClientResponse, error) {
	hr := rr.convertClientRequestToHotpepperRequest(cr)

	u := "http://webservice.recruit.co.jp/hotpepper/gourmet/v1/?key=" + rr.apiKey + "&" + hr.ToURLValues().Encode()

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
