package main

import (
	"server/controller"
	"server/database"
	"server/repository"
	"server/router"
	"server/usecase"
	"server/validator"
)

func main() {
	db := database.NewDB()
	userValidator := validator.NewUserValidator()
	userRepository := repository.NewUserRepository(db)
	userUsecase := usecase.NewUserUsecase(userRepository, userValidator)
	userController := controller.NewUserController(userUsecase)
	e := router.NewRouter(userController)
	e.Logger.Fatal(e.Start(":8080"))
}