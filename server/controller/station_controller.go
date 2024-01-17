package controller

import (
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
	su usecase.IStationUsecase
}

func NewStationController(su usecase.IStationUsecase) IStationController {
	return &stationController{su}
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