package controller

import (
	"net/http"
	"server/model"
	"server/usecase"

	"github.com/labstack/echo/v4"
)

type IRouteController interface {
	GetRoutes(c echo.Context) error
}

type routeController struct {
	ru usecase.IRouteUsecase
}

func NewRouteController(ru usecase.IRouteUsecase) IRouteController {
	return &routeController{ru}
}

func (rc *routeController) GetRoutes(c echo.Context) error {
	request := model.RouteRequest{}
	if err := c.Bind(&request); err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	routes, err := rc.ru.GetRoute(request)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err.Error())
	}
	return c.JSON(http.StatusOK, routes)
}