package repository

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"

	"gorm.io/gorm"

	"server/model"
	"server/suggest/client/suggestpb"
)

// ホットペッパーグルメAPIへのリクエストとレスポンスの処理を行う
// 具体的には、クライアントからのリクエストデータをホットペッパーグルメAPIへのリクエストデータに変換し、ホットペッパーグルメAPIからのレスポンスデータをクライアントへのレスポンスデータに変換する。

type IRestaurantRepository interface {
	GetRestaurants(cr model.ClientRequest) ([]model.ClientResponse, error)
	SendRestaurantsToGRPC(ctx context.Context, restaurants []model.Station, option model.Option) (*suggestpb.SuggestResponse, error)
}

type RestaurantRepository struct {
	db         *gorm.DB
	apiKey     string
	grpcClient suggestpb.SuggestClient
}

// func NewRestaurantRepository(db *gorm.DB) (*RestaurantRepository, error) {
func NewRestaurantRepository(db *gorm.DB, serverAddress string) (*RestaurantRepository, error) {
	apiKey := os.Getenv("HOTPEPPER_API_KEY") // 環境変数からAPIキーを取得
	// return &RestaurantRepository{db: db, apiKey: apiKey}, nil
	rr := &RestaurantRepository{db: db, apiKey: apiKey}
	if err := rr.InitGRPCClient(serverAddress); err != nil {
		return nil, err
	}
	return rr, nil
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
	COUNT        = 10
)

func (rr *RestaurantRepository) GetRestaurants(cr model.ClientRequest) ([]model.ClientResponse, error) {
	// ホットペッパーグルメAPIへのリクエストデータを生成
	hr := rr.convertClientRequestToHotpepperRequest(cr)
	// mapの形式でstationsを定義
	responses := make([]model.ClientResponse, 0)

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
			return nil, err // panicからreturn nil, errに変更
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
			Stations:    result,
			StationPlan: model.StationPlan{},
		}
		responses = append(responses, newClientResponse)
	}
	return responses, nil
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

// gRPCクライアントの初期化
func (rr *RestaurantRepository) InitGRPCClient(serverAddress string) error {
	conn, err := grpc.Dial(serverAddress, grpc.WithTransportCredentials(insecure.NewCredentials()), grpc.WithBlock())
	// fmt.Println(conn)
	if err != nil {
		return fmt.Errorf("サーバーへの接続に失敗しました: %v", err)
	}
	rr.grpcClient = suggestpb.NewSuggestClient(conn)
	return nil
}

// gRPCサーバーに店舗情報を送信し、処理結果を受け取る
func (rr *RestaurantRepository) SendRestaurantsToGRPC(ctx context.Context, restaurants []model.Station, option model.Option) (*suggestpb.SuggestResponse, error) {
	// 送信する店舗情報をgRPCリクエストの形式に変換
	var stores []*suggestpb.Store
	for _, r := range restaurants {
		store := &suggestpb.Store{
			Name:      r.Name,
			Address:   r.Address,
			Access:    r.Access,
			Latitude:  r.Latitude,
			Longitude: r.Longitude,
			Budget:    r.Budget,
			Open:      r.Open,
			Genre: &suggestpb.Genre{
				Catch: r.Genre.Catch,
				Name:  r.Genre.Name,
			},
			CouponUrls: r.CouponUrls,
			ImageUrl:   r.ImageUrl,
		}
		stores = append(stores, store)
	}
	// fmt.Println(stores)

	// オプション設定の変換
	gRPCOption := &suggestpb.Option{
		PeopleNum:  int32(option.PeopleNum),
		ArriveTime: option.ArriveTime,
		Category:   option.Category,
	}

	// fmt.Println(gRPCOption)

	// gRPCリクエストの作成
	request := &suggestpb.SuggestRequest{
		Option: gRPCOption,
		Stores: []*suggestpb.Stores{
			{
				Stores: stores,
			},
		},
	}
	// fmt.Println(request)
	// gRPCサーバーにリクエストを送信し、レスポンスを受け取る
	response, err := rr.grpcClient.Suggest(ctx, request)
	// fmt.Println(response)
	if err != nil {
		return nil, fmt.Errorf("gRPCメソッドの呼び出しでエラーが発生しました: %w", err)
	}

	return response, nil
}
