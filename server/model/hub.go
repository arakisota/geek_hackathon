package model

import (
	"encoding/json"
	"log"
)

type Hub struct {
	Rooms        map[string]map[*Client]bool
	RegisterCh   chan *Client
	UnRegisterCh chan *Client
	BroadcastCh  chan *Message
}

type Message struct {
	RoomId  string
	Content json.RawMessage
}

func NewHub() *Hub {
	return &Hub{
		Rooms:        make(map[string]map[*Client]bool),
		RegisterCh:   make(chan *Client),
		UnRegisterCh: make(chan *Client),
		BroadcastCh:  make(chan *Message),
	}
}

func (h *Hub) RunLoop() {
	for {
		select {
		case client := <-h.RegisterCh:
			if _, ok := h.Rooms[client.RoomId]; !ok {
				h.Rooms[client.RoomId] = make(map[*Client]bool)
			}
			h.Rooms[client.RoomId][client] = true

		case client := <-h.UnRegisterCh:
			delete(h.Rooms[client.RoomId], client)
			if len(h.Rooms[client.RoomId]) == 0 {
				delete(h.Rooms, client.RoomId)
			}

		case message := <-h.BroadcastCh:
			for client := range h.Rooms[message.RoomId] {
				select {
				case client.SendCh <- message:
				default:
					close(client.SendCh)
					delete(h.Rooms[message.RoomId], client)
					if len(h.Rooms[message.RoomId]) == 0 {
						delete(h.Rooms, message.RoomId)
					}
				}
			}
		}
	}
}

func (h *Hub) BroadcastToRoom(apitype string, roomId string, content []byte) {
	var message *Message

	switch apitype {
	case "restaurants":
		var stations interface{}
		err := json.Unmarshal(content, &stations)
		if err != nil {
			log.Printf("error unmarshaling stations: %v", err)
			return
		}
		messageContent := struct {
			Type     string      `json:"type"`
			Stations interface{} `json:"stations"`
		}{
			Type:     apitype,
			Stations: stations,
		}
		jsonData, err := json.Marshal(messageContent)
		if err != nil {
			log.Printf("error marshaling message: %v", err)
			return
		}
		message = &Message{RoomId: roomId, Content: jsonData}

	case "routes":
		var routes interface{}
		err := json.Unmarshal(content, &routes)
		if err != nil {
			log.Printf("error unmarshaling stations: %v", err)
			return
		}
		messageContent := struct {
			Type   string      `json:"type"`
			Routes interface{} `json:"routes"`
		}{
			Type:   apitype,
			Routes: routes,
		}
		jsonData, err := json.Marshal(messageContent)
		if err != nil {
			log.Printf("error marshaling message: %v", err)
			return
		}
		message = &Message{RoomId: roomId, Content: jsonData}

	default:
		log.Printf("Unknown apitype: %s", apitype)
		return
	}

	for client := range h.Rooms[roomId] {
		select {
		case client.SendCh <- message:
		default:
			close(client.SendCh)
			delete(h.Rooms[roomId], client)
			if len(h.Rooms[roomId]) == 0 {
				delete(h.Rooms, roomId)
			}
		}
	}
}
