package controller

import (
	"net/http"
	"os"
	"server/model"
	"server/usecase"

	"github.com/golang-jwt/jwt"
	"github.com/gorilla/websocket"
	"github.com/labstack/echo/v4"
)

type IWebsocketController interface {
	HandleWebSocketConnections(c echo.Context) error
}

type WebsocketController struct {
	hub *model.Hub
	rm model.RoomManager
}

func NewWebsocketController(hub *model.Hub, rm model.RoomManager) *WebsocketController {
	return &WebsocketController{hub, rm}
}

func (wc *WebsocketController) HandleWebSocketConnections(c echo.Context) error {
	tokenString := c.QueryParam("token")
	claims := jwt.MapClaims{}
    _, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
        return []byte(os.Getenv("SECRET")), nil
    })
	if err != nil {
        return c.JSON(http.StatusBadRequest, err.Error())
    }
	userId := claims["user_id"].(string) 

	roomId := c.QueryParam("room_id")
	room, exists := wc.rm.Rooms[roomId]
    if !exists || !room.Clients[userId] {
        return c.JSON(http.StatusForbidden, "Access denied")
    }
	
	upgrader := websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			return true 
		},
	}
	ws, err := upgrader.Upgrade(c.Response(), c.Request(), nil)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err.Error())
	}
	
	websocketHandler := usecase.NewWebsocketUsecase(wc.hub, ws)
	go websocketHandler.HandleClient(userId, roomId)
	return nil
}