package model

type Hub struct {
    Rooms        map[string]map[*Client]bool  
    RegisterCh   chan *Client
    UnRegisterCh chan *Client
    BroadcastCh  chan *Message  
}

type Message struct {
    RoomId  string
    Content []byte
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
                case client.SendCh <- message.Content:
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
