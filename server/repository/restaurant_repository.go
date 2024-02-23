package repository

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"

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

func (rr *RestaurantRepository) GetStationCoordinates(station string) ([]model.StationInfo, error) {
	var sc []model.StationInfo
	if err := rr.db.Where("name=?", station).Find(&sc).Error; err != nil {
		return nil, err
	}
	return sc, nil
}

const (
	URL_TEMPLATE = "http://webservice.recruit.co.jp/hotpepper/gourmet/v1/?key=%s&format=json&lat=%f&lng=%f&range=%d&count=%d&order=4"
	RANGE        = "2"
	COUNT        = 5
)

func (rr *RestaurantRepository) GetRestaurants(cr model.ClientRequest) ([]model.ClientResponse, error) {
	// ホットペッパーグルメAPIへのリクエストデータを生成
	hr := rr.convertClientRequestToHotpepperRequest(cr)
	// mapの形式でstationsを定義
	stations := make([]model.ClientResponse, 0)

	for idx := range hr.Name {
		Latitude := hr.Lat[idx]
		Longitude := hr.Lng[idx]
		url := fmt.Sprintf(URL_TEMPLATE, rr.apiKey, Latitude, Longitude, RANGE, COUNT)

		resp, err := http.Get(url)
		if err != nil {
			return nil, err
		}
		defer resp.Body.Close()

		body, _ := io.ReadAll(resp.Body)

		var apiResult interface{}
		if err := json.Unmarshal(body, &apiResult); err != nil {
			panic(err)
		}

		result := make([]model.Station, 0)
		for _, shop := range apiResult.(map[string]interface{})["results"].(map[string]interface{})["shop"].([]interface{}) {
			Genre := model.Genre{
				Catch: shop.(map[string]interface{})["genre"].(map[string]interface{})["catch"].(string),
				Name:  shop.(map[string]interface{})["genre"].(map[string]interface{})["name"].(string),
			}
			newResponse := model.Station{
				Name:       shop.(map[string]interface{})["name"].(string),
				Address:    shop.(map[string]interface{})["address"].(string),
				Access:     shop.(map[string]interface{})["access"].(string),
				Latitude:   shop.(map[string]interface{})["lat"].(float64),
				Longitude:  shop.(map[string]interface{})["lng"].(float64),
				Budget:     shop.(map[string]interface{})["budget"].(map[string]interface{})["average"].(string),
				Open:       shop.(map[string]interface{})["open"].(string),
				Genre:      Genre,
				CouponUrls: shop.(map[string]interface{})["coupon_urls"].(map[string]interface{})["pc"].(string),
				ImageUrl:   shop.(map[string]interface{})["photo"].(map[string]interface{})["pc"].(map[string]interface{})["l"].(string),
			}
			result = append(result, newResponse)
		}
		newClientResponse := model.ClientResponse{
			Stations: result,
		}
		stations = append(stations, newClientResponse)
	}
	return stations, nil
}

// ここでクライアントからのリクエストデータをホットペッパーグルメAPIへのリクエストデータに変換する
func (rr *RestaurantRepository) convertClientRequestToHotpepperRequest(cr model.ClientRequest) model.HotpepperRequest {
	names := make([]string, 0)
	lats := make([]float64, 0)
	lngs := make([]float64, 0)
	for _, station := range cr.Stations {
		// ここで駅名から緯度経度を取得する
		coor, _ := rr.GetStationCoordinates(station)
		longitude := coor[0].Longitude
		latitude := coor[0].Latitude
		names = append(names, station)
		lats = append(lats, latitude)
		lngs = append(lngs, longitude)
	}

	return model.HotpepperRequest{
		Name: names,
		Lat:  lats,
		Lng:  lngs,
	}
}
