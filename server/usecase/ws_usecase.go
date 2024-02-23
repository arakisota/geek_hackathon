package usecase

import (
	"server/model"

	"github.com/gorilla/websocket"
)

type IWebsocketUsecase interface {
	HandleClient(userId string, roomId string)
}

type WebsocketUsecase struct {
	hub *model.Hub
	ws  *websocket.Conn
}

func NewWebsocketUsecase(hub *model.Hub, ws *websocket.Conn) *WebsocketUsecase {
	return &WebsocketUsecase{hub, ws}
}

func (wu *WebsocketUsecase) HandleClient(userId string, roomId string) {
	client := model.NewClient(wu.ws, userId, roomId)

	go client.ReadLoop(wu.hub.BroadcastCh, wu.hub.UnRegisterCh)
	go client.WriteLoop()
	wu.hub.RegisterCh <- client
}