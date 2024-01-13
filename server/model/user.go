package model

import "time"

type User struct {
	UserId    string    `json:"id" gorm:"primaryKey;unique"`
	Password  string    `json:"password"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type UserResponse struct {
	UserId    string    `json:"id" gorm:"primaryKey;unique"`
}