package repository

import (
	"server/model"

	"gorm.io/gorm"
)

type IUserRepository interface {
	GetUserByUserId(user *model.User, userId string) error
	CreateUser(user *model.User) error
}

type userRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) IUserRepository {
	return &userRepository{db}
}

func (ur *userRepository) GetUserByUserId(user *model.User, userId string) error {
	if err := ur.db.Where("user_id=?", userId).First(user).Error; err != nil {
		return err
	}
	return nil
}

func (ur *userRepository) CreateUser(user *model.User) error {
	if err := ur.db.Create(user).Error; err != nil {
		return err
	}
	return nil
}