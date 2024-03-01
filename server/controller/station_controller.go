package controller

import (
	"encoding/json"
	"net/http"
	"server/model"
	"server/usecase"

	"github.com/labstack/echo/v4"
)

type IStationController interface {
	GetStations(c echo.Context) error
	GetSuggestion(c echo.Context) error
}

type stationController struct {
	su  usecase.IStationUsecase
	hub *model.Hub
}

func NewStationController(su usecase.IStationUsecase, hub *model.Hub) IStationController {
	return &stationController{su, hub}
}

func (sc *stationController) GetStations(c echo.Context) error {
	departures := model.StationsRequest{}
	if err := c.Bind(&departures); err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	stations, err := sc.su.GetStations(departures)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err.Error())
	}
	srJSON, err := json.Marshal(departures)
    if err != nil {
        return c.JSON(http.StatusInternalServerError, err.Error())
    }
	roomId := c.QueryParam("room_id")
    sc.hub.BroadcastToRoom("stations", roomId, srJSON, nil)
	return c.JSON(http.StatusOK, stations)
}

func (sc *stationController) GetSuggestion(c echo.Context) error {
	input := c.QueryParam("input")
	request := model.SuggestionRequest{
        Input: input,
    }
	suggestion, err := sc.su.GetSuggestion(request)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err.Error())
	}
	return c.JSON(http.StatusOK, suggestion)
}