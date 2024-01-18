package controller

import (
	"encoding/json"
	"net/http"
	"server/model"
	"server/usecase"
)

// リクエストを受け取り、適切なUsecaseを呼び出し、レスポンスを生成する
// Usecase層からのデータをもとに、クライアントへ返すレスポンス（HTML、JSON、XMLなど）を生成

type IRestaurantController interface {
	GetRestaurantsNearStation(w http.ResponseWriter, r *http.Request)
}

type RestaurantController struct {
	Usecase usecase.IRestaurantUsecase
}

func (c *RestaurantController) GetRestaurantsNearStation(w http.ResponseWriter, r *http.Request) {
	var cr model.ClientRequest
	if err := json.NewDecoder(r.Body).Decode(&cr); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	restaurants, err := c.Usecase.GetRestaurantsNearStation(cr)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(restaurants)
}
