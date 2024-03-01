package usecase

import (
	"context"
	"server/model"
	"server/repository"
)

// ビジネスロジックを実装
// 具体的には、クライアントからのリクエストデータを受け取り、必要な処理を行った後、クライアントへのレスポンスデータを生成する
// コントローラー層によってトリガーされる処理を実装

type IRestaurantUsecase interface {
	GetRestaurantsNearStation(ctx context.Context, cr model.ClientRequest) ([]model.ClientResponse, error)
}

type RestaurantUsecase struct {
	Repository repository.IRestaurantRepository
}

func NewRestaurantUsecase(rr repository.IRestaurantRepository) IRestaurantUsecase {
	return &RestaurantUsecase{rr}
}

func (uc *RestaurantUsecase) GetRestaurantsNearStation(ctx context.Context, cr model.ClientRequest) ([]model.ClientResponse, error) {
	// リポジトリからレストランデータを取得
	restaurants, err := uc.Repository.GetRestaurants(cr)
	if err != nil {
		return nil, err
	}

	limit := 5
	if len(restaurants[0].Stations) < 5 {
		limit = len(restaurants[0].Stations)
	}

	restaurantsTop5 := make([]model.ClientResponse, 0)
	// 最初のレストランのみを対象に上位5件を取得
	for _, station := range restaurants {
		restaurants := []model.ClientResponse{
			{
				Stations:    station.Stations[:limit],
				StationPlan: model.StationPlan{}, // 注: StationPlanは空です。必要に応じて適切な値を設定してください。
			},
		}
		restaurantsTop5 = append(restaurantsTop5, restaurants...)
	}
	// stationsTop5 = append(stationsTop5, restaurants[0].Stations[:limit]...)

	// ClientResponseを生成
	// 注: このロジックは、最初のレストランから上位5件のステーションのみを含むClientResponseを返します。

	// option := model.Option{
	// 	PeopleNum:  cr.PeopleNum,
	// 	ArriveTime: cr.ArrivalTime.Format("15:04"), // 時間フォーマットは要確認
	// 	Category:   cr.Purpose,                     // 例としてPurposeをカテゴリーに使用
	// }

	// var stations []model.Station
	// for _, clientResponse := range restaurants {
	// 	for _, station := range clientResponse.Stations {
	// 		stations = append(stations, station)
	// 	}
	// }

	// grpcResponse, err := uc.Repository.SendRestaurantsToGRPC(ctx, stations, option)
	// if err != nil {
	// 	return nil, err
	// }

	// clientResponses := make([]model.ClientResponse, 0)
	// for _, station := range restaurants {
	// 	fmt.Println(station)
	// 	station_top5 := station.Stations[:5]
	// 	fmt.Println(station_top5)
	// 	for _, stationPlan := range grpcResponse.Station {
	// 		fmt.Println(stationPlan)
	// 		// clientResponses = append(clientResponses, model.ClientResponse{
	// 		// 	Stations:    station_top5,
	// 		// 	StationPlan: stationPlan.Plan,
	// 		// })
	// 	}
	// }
	return restaurantsTop5, nil
	// return clientResponses, nil
}
