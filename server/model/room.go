package model

type Room struct {
	RoomId  string
	Clients map[string]bool
}

func NewRoom(userId string) *Room {
    return &Room{
        RoomId:  userId,
        Clients: make(map[string]bool),
    }
}

type RoomManager struct {
    Rooms map[string]*Room
}

func NewRoomManager() *RoomManager {
    return &RoomManager{
        Rooms: make(map[string]*Room),
    }
}