package model

import (
	"fmt"
	"log"

	"github.com/gorilla/websocket"
)

type Client struct {
    WS     *websocket.Conn
    SendCh chan []byte
    UserId string
    RoomId string  // クライアントが属する部屋のID
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

		messageWithUsername := fmt.Sprintf("{\"username\": \"%s\", \"message\": \"%s\"}", c.UserId, string(msg))
        broadCast <- &Message{RoomId: c.RoomId, Content: []byte(messageWithUsername)}
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