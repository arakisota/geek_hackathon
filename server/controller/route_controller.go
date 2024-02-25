package controller

import (
	"encoding/json"
	"net/http"
	"server/model"
	"server/usecase"

	"github.com/labstack/echo/v4"
)

type IRouteController interface {
	GetRoutes(c echo.Context) error
}

type routeController struct {
	ru  usecase.IRouteUsecase
	Hub *model.Hub
}

func NewRouteController(ru usecase.IRouteUsecase, hub *model.Hub) IRouteController {
	return &routeController{ru, hub}
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
	routesJSON, err := json.Marshal(routes)
    if err != nil {
        return c.JSON(http.StatusInternalServerError, err.Error())
    }
	roomId := c.QueryParam("room_id")
    rc.Hub.BroadcastToRoom("routes", roomId, routesJSON)
	return c.JSON(http.StatusOK, routes)
}