package controller

import (
	"fmt"
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
}

func NewRestaurantController(uc usecase.IRestaurantUsecase) IRestaurantController {
	return &RestaurantController{uc}
}

func (rc *RestaurantController) GetRestaurants(ctx echo.Context) error {
	// cr := new(model.ClientRequest)
	cr := model.ClientRequest{}
	if err := ctx.Bind(&cr); err != nil {
		return ctx.JSON(http.StatusBadRequest, err.Error())
	}
	fmt.Println(cr)

	restaurants, err := rc.Usecase.GetRestaurantsNearStation(cr)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, err.Error())
	}

	return ctx.JSON(http.StatusOK, restaurants)
}
