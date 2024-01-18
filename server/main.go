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
	stationRepository := repository.NewStationRepository(db)
	userUsecase := usecase.NewUserUsecase(userRepository, userValidator)
	stationUsecase := usecase.NewStationUsecase(stationRepository)
	userController := controller.NewUserController(userUsecase)
	stationController := controller.NewStationController(stationUsecase)
	e := router.NewRouter(userController, stationController)
	e.Logger.Fatal(e.Start(":8080"))
}