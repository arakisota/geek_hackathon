package main

import (
	"server/controller"
	"server/database"
	"server/repository"
	"server/router"
	"server/usecase"
)

func main() {
	db := database.NewDB()
	userRepository := repository.NewUserRepository(db)
	userUsecase := usecase.NewUserUsecase(userRepository)
	userController := controller.NewUserController(userUsecase)
	e := router.NewRouter(userController)
	e.Logger.Fatal(e.Start(":8080"))
}