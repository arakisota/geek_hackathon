package main

import (
	"fmt"
	"server/database"
	"server/model"
)

func main() {
	dbConn := database.NewDB()
	defer fmt.Println("Successfully Migrated")
	defer database.CloseDB(dbConn)
	dbConn.AutoMigrate(&model.User{})
}