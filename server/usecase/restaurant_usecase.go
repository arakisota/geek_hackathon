package usecase

import (
	"context"
	"fmt"
	"reflect"
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

	option := model.Option{
		PeopleNum:  cr.PeopleNum,
		ArriveTime: cr.ArrivalTime.Format("15:04"), // 時間フォーマットは要確認
		Category:   cr.Purpose,                     // 例としてPurposeをカテゴリーに使用
	}

	var stations []model.Station
	for _, clientResponse := range restaurants {
		for _, station := range clientResponse.Stations {
			stations = append(stations, station)
		}
	}

	// grpcResponse, err := uc.Repository.SendRestaurantsToGRPC(ctx, stations, option)
	response, err := uc.Repository.SendRestaurantsToGRPC(ctx, stations, option)
	if err != nil {
		return nil, err
	}
	// fmt.Println(reflect.TypeOf(response))                                           // *suggestpb.SuggestResponse
	// fmt.Println(reflect.TypeOf(response.Station))                                      //[]*suggestpb.StationPlan
	// fmt.Println(reflect.TypeOf(response.Station[0]))                                   // *suggestpb.StationPlan
	// fmt.Println(reflect.TypeOf(response.Station[0].Plans))                             // []*suggestpb.Plan
	// fmt.Println(reflect.TypeOf(response.Station[0].Plans[0]))                          // *suggestpb.Plan
	// fmt.Println(reflect.TypeOf(response.Station[0].Plans[0].Plan))                     // string
	// fmt.Println(reflect.TypeOf(response.Station[0].Plans[0].Stores))                   // []*suggestpb.Stores
	// fmt.Println(reflect.TypeOf(response.Station[0].Plans[0].Stores[0].Stores))         // []*suggestpb.Store
	// fmt.Println(reflect.TypeOf(response.Station[0].Plans[0].Stores[0].Stores[0]))      // *suggestpb.Store
	// fmt.Println(reflect.TypeOf(response.Station[0].Plans[0].Stores[0].Stores[0].Name)) // string

	// fmt.Println(response)

	// limit := 5
	// if len(restaurants[0].Stations) < 5 {
	// 	limit = len(restaurants[0].Stations)
	// }

	// fmt.Println(response)
	// restaurantsTop5 := make([]model.ClientResponse, 0)
	// var plans model.Plans
	var stationPlan_ []model.Plans
	for _, stationPlan := range response.Station {
		var Plans_ []model.Plan
		for _, plan := range stationPlan.Plans {
			fmt.Println(plan)
			// fmt.Println(plan.Plan)
			fmt.Println(reflect.TypeOf(plan.Plan))
			// stationPlan := model.StationPlan{}
			// fmt.Println(reflect.TypeOf(stationPlan.StationPlan))
			// stationPlan.StationPlan = append(stationPlan.StationPlan, plan)

			// stationPlan.StationPlan = append(stationPlan.StationPlan, plan.Plan)
			// fmt.Println(reflect.TypeOf(stationPlan.StationPlan[0]))
			// stationPlan.StationPlan.Plans = plan.Plan
			// stationPlan.Plan = plan.Plan
			// clientResponse := model.ClientResponse{}
			// clientResponse.StationPlan = model.ClientResponse{
			// 	StationPlan: plan.Plan,
			// }
			// fmt.Println(clientResponse)
			var Plan_ model.Plan
			for _, stores := range plan.Stores {
				storeStations := make([]model.Station, 0)
				for _, store := range stores.Stores {
					// fmt.Println(store)
					// fmt.Println(store.Name)
					// restaurants := []model.ClientResponse{
					// 	{
					// 		Stations:    store.Stores.Stores[:limit],
					// 		StationPlan: station.Plan, // 注: StationPlanは空です。必要に応じて適切な値を設定してください。
					// 	},
					// }
					// restaurantsTop5 = append(restaurantsTop5, restaurants...)
					station := model.Station{} // 適切にフィールドを設定
					station.Name = store.Name
					station.Address = store.Address
					station.Access = store.Access
					station.Latitude = store.Latitude
					station.Longitude = store.Longitude
					station.Budget = store.Budget
					station.Open = store.Open
					station.Genre = model.Genre{
						Catch: store.Genre.Catch,
						Name:  store.Genre.Name,
					}
					station.CouponUrls = store.CouponUrls
					station.ImageUrl = store.ImageUrl
					storeStations = append(storeStations, station)
					// fmt.Println(station)
				}
				Plan_ = model.Plan{
					Plan:   plan.Plan,
					Stores: storeStations,
				}
			}
			Plans_ = append(Plans_, Plan_)
		}
		stationPlan_ = append(stationPlan_, model.Plans{
			Plans: Plans_,
		})
	}
	StationPlan := model.StationPlan{
		StationPlan: stationPlan_,
	}
	clientResponses := make([]model.ClientResponse, 0)
	for _, station := range restaurants {
		clientResponses = append(clientResponses, model.ClientResponse{
			Stations:    station.Stations,
			StationPlan: StationPlan,
		})
	}

	// ClientResponseを生成
	// 注: このロジックは、最初のレストランから上位5件のステーションのみを含むClientResponseを返します。

	// clientResponses := make([]model.ClientResponse, 0)
	// for _, station := range restaurants {
	// 	fmt.Println(station)
	// 	station_top5 := station.Stations[:5]
	// 	fmt.Println(station_top5)
	// 	for _, stationPlan := range grpcResponse.Station {
	// 		fmt.Println(stationPlan)
	// 		clientResponses = append(clientResponses, model.ClientResponse{
	// 			Stations:    station_top5,
	// 			StationPlan: stationPlan.Plan,
	// 		})
	// 	}
	// }
	// return restaurantsTop5, nil
	return clientResponses, nil
}
