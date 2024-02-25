package model

import (
	"encoding/json"
	"fmt"
	"log"

	"github.com/gorilla/websocket"
)

type Client struct {
    WS     *websocket.Conn
    SendCh chan *Message
    UserId string
    RoomId string
}

func NewClient(ws *websocket.Conn, userId, roomId string) *Client {
    return &Client{
        WS:       ws,
        SendCh:   make(chan *Message),
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
			loginMessage := struct {
				Type    string `json:"type"`
				UserId  string `json:"userId"`
				Message string `json:"message"`
			}{
				Type:    receivedMessage.Type,
				UserId:  c.UserId,
				Message: fmt.Sprintf("User %s has logged in to room %s", c.UserId, c.RoomId),
			}
			jsonData, err := json.Marshal(loginMessage)
			if err != nil {
				log.Printf("error marshaling login message: %v", err)
				continue
			}
			broadCast <- &Message{RoomId: c.RoomId, Content: jsonData}

		case "logout":
			logoutMessage := struct {
				Type    string `json:"type"`
				UserId  string `json:"userId"`
				Message string `json:"message"`
			}{
				Type:    receivedMessage.Type,
				UserId:  c.UserId,
				Message: fmt.Sprintf("User %s has logged out from room %s", c.UserId, c.RoomId),
			}
			jsonData, err := json.Marshal(logoutMessage)
			if err != nil {
				log.Printf("error marshaling logout message: %v", err)
				continue
			}
			broadCast <- &Message{RoomId: c.RoomId, Content: jsonData}

		case "message":
			messageWithUserId := struct {
				Type    string `json:"type"`
				UserId string `json:"userId"`
				Message  string `json:"message"`
			}{
				Type:    receivedMessage.Type,
				UserId: c.UserId,
				Message:  receivedMessage.Content,
			}
			jsonData, err := json.Marshal(messageWithUserId)
			if err != nil {
				log.Printf("error marshaling message: %v", err)
				continue
			}
			broadCast <- &Message{RoomId: c.RoomId, Content: jsonData}
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
		w.Write(message.Content)

		n := len(c.SendCh)
		for i := 0; i < n; i++ {
			message, ok := <-c.SendCh
			if !ok {
				break
			}
			if _, err := w.Write(message.Content); err != nil {
				log.Printf("error writing message: %v", err)
				return
			}
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