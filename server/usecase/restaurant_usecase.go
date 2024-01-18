package usecase

import (
	"server/model"
	"server/repository"
)

// ビジネスロジックを実装
// 具体的には、クライアントからのリクエストデータを受け取り、必要な処理を行った後、クライアントへのレスポンスデータを生成する
// コントローラー層によってトリガーされる処理を実装

type IRestaurantUsecase interface {
	GetRestaurantsNearStation(cr model.ClientRequest) ([]model.ClientResponse, error)
}

type RestaurantUsecase struct {
	Repository repository.IRestaurantRepository
}

func NewRestaurantUsecase(rr repository.IRestaurantRepository) IRestaurantUsecase {
	return &RestaurantUsecase{rr}
}

func (uc *RestaurantUsecase) GetRestaurantsNearStation(cr model.ClientRequest) ([]model.ClientResponse, error) {
	// リポジトリからレストランデータを取得
	restaurants, err := uc.Repository.GetRestaurants(cr)
	if err != nil {
		return nil, err
	}

	return restaurants, nil
}
