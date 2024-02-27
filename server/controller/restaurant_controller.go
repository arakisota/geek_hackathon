package controller

import (
	"encoding/json"
	"net/http"
	"server/model"
	"server/usecase"

	"github.com/labstack/echo/v4"
)

// リクエストを受け取り、適切なUsecaseを呼び出し、レスポンスを生成する
// Usecase層からのデータをもとに、クライアントへ返すレスポンス（HTML、JSON、XMLなど）を生成

type IRestaurantController interface {
	GetRestaurants(ctx echo.Context) error
}

type RestaurantController struct {
	Usecase usecase.IRestaurantUsecase
	hub     *model.Hub
}

func NewRestaurantController(uc usecase.IRestaurantUsecase, hub *model.Hub) IRestaurantController {
	return &RestaurantController{uc, hub}
}

func (rc *RestaurantController) GetRestaurants(ctx echo.Context) error {
	// cr := new(model.ClientRequest)
	cr := model.ClientRequest{}
	if err := ctx.Bind(&cr); err != nil {
		return ctx.JSON(http.StatusBadRequest, err.Error())
	}

	restaurants, err := rc.Usecase.GetRestaurantsNearStation(cr)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, err.Error())
	}

	crJSON, err := json.Marshal(cr)
    if err != nil {
        return ctx.JSON(http.StatusInternalServerError, err.Error())
    }
	restaurantsJSON, err := json.Marshal(restaurants)
    if err != nil {
        return ctx.JSON(http.StatusInternalServerError, err.Error())
    }

	roomId := ctx.QueryParam("room_id")
    rc.hub.BroadcastToRoom("restaurants", roomId, restaurantsJSON, crJSON)

	return ctx.JSON(http.StatusOK, restaurants)
}
