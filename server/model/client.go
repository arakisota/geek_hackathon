package model

import (
	"encoding/json"
	"fmt"
	"log"

	"github.com/gorilla/websocket"
)

type Client struct {
    WS     *websocket.Conn
    SendCh chan []byte
    UserId string
    RoomId string
}

func NewClient(ws *websocket.Conn, userId, roomId string) *Client {
    return &Client{
        WS:       ws,
        SendCh:   make(chan []byte),
        UserId:   userId,
        RoomId:   roomId,
    }
}

func (c *Client) ReadLoop(broadCast chan<- *Message, unregister chan<- *Client) {
	defer func() {
		c.disconnect(unregister)
	}()
	for {
		_, msg, err := c.WS.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("unexpected close error: %v", err)
			}
			break
		}

		var receivedMessage struct {
			Type    string `json:"type"`
			Content string `json:"content"`
		}
		if err := json.Unmarshal(msg, &receivedMessage); err != nil {
			log.Printf("error unmarshaling message: %v", err)
			continue
		}

		switch receivedMessage.Type {
		case "login":
			messageLogin := fmt.Sprintf("User %s login to room %s", c.UserId, c.RoomId)
			broadCast <- &Message{RoomId: c.RoomId, Content: []byte(messageLogin)}
		case "logout":
			messageLogout := fmt.Sprintf("User %s logout from room %s", c.UserId, c.RoomId)
			broadCast <- &Message{RoomId: c.RoomId, Content: []byte(messageLogout)}
		case "message":
			messageWithUsername := fmt.Sprintf("{\"username\": \"%s\", \"message\": \"%s\"}", c.UserId, receivedMessage.Content)
			broadCast <- &Message{RoomId: c.RoomId, Content: []byte(messageWithUsername)}
		default:
			log.Printf("Unknown message type: %s", receivedMessage.Type)
		}
	}
}

func (c *Client) WriteLoop() {
	defer func() {
		c.WS.Close()
	}()
	for {
		message := <-c.SendCh
		w, err := c.WS.NextWriter(websocket.TextMessage)
		if err != nil {
			return
		}
		w.Write(message)

		for i := 0; i < len(c.SendCh); i++ {
			w.Write(<-c.SendCh)
		}
		if err := w.Close(); err != nil {
			return
		}
	}
}

func (c *Client) disconnect(unregister chan<- *Client) {
	unregister <- c
	c.WS.Close()
}