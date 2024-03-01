package usecase

import (
	"fmt"
	"os"
	"server/model"
	"server/repository"
	"server/validator"
	"time"

	"github.com/golang-jwt/jwt/v4"
	"golang.org/x/crypto/bcrypt"
)

type IUserUsecase interface {
	SignUp(user model.User) (model.UserResponse, error)
	Login(user model.User) (string, error)
	CreateRoom(userId string)
	JoinRoom(userId string, roomId string) error
	DeleteRoom(roomId string)
}

type userUsecase struct {
	ur repository.IUserRepository
	uv validator.IUserValidator
	rm model.RoomManager
}

func NewUserUsecase(ur repository.IUserRepository, uv validator.IUserValidator, rm model.RoomManager) IUserUsecase {
	return &userUsecase{ur, uv, rm}
}


func (uu *userUsecase) SignUp(user model.User) (model.UserResponse, error) {
	if err := uu.uv.UserValidate(user); err != nil {
		return model.UserResponse{}, err
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(user.Password), 10)
	if err != nil {
		return model.UserResponse{}, err
	}
	newUser := model.User{UserId: user.UserId, Password: string(hash)}
	if err := uu.ur.CreateUser(&newUser); err != nil {
		return model.UserResponse{}, err
	}
	resUser := model.UserResponse{
		UserId: newUser.UserId,
	}
	return resUser, nil
}

func (uu *userUsecase) Login(user model.User) (string, error) {
	if err := uu.uv.UserValidate(user); err != nil {
		return "", err
	}
	storedUser := model.User{}
	if err := uu.ur.GetUserByUserId(&storedUser, user.UserId); err != nil {
		return "", err
	}
	err := bcrypt.CompareHashAndPassword([]byte(storedUser.Password), []byte(user.Password))
	if err != nil {
		return "", err
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": storedUser.UserId,
		"exp":     time.Now().Add(time.Hour * 12).Unix(),
	})
	tokenString, err := token.SignedString([]byte(os.Getenv("SECRET")))
	if err != nil {
		return "", err
	}
	return tokenString, nil
}

func (uu *userUsecase) CreateRoom(userId string) {
    room := model.NewRoom(userId)
    uu.rm.Rooms[room.RoomId] = room
}

func (uu *userUsecase) JoinRoom(userId string, roomID string) error {
    room, exists := uu.rm.Rooms[roomID]
    if !exists {
        return fmt.Errorf("room not found")
    }
    room.Clients[userId] = true
    return nil
}

func (uu *userUsecase) DeleteRoom(roomId string) {
	delete(uu.rm.Rooms, roomId)
}