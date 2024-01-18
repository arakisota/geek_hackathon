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
	restaurantRepository := repository.NewRestaurantRepository(db)
	userUsecase := usecase.NewUserUsecase(userRepository, userValidator)
	stationUsecase := usecase.NewStationUsecase(stationRepository)
	restaurantUsecase := usecase.NewRestaurantUsecase(restaurantRepository)
	userController := controller.NewUserController(userUsecase)
	stationController := controller.NewStationController(stationUsecase)
	restaurantController := controller.NewRestaurantController(restaurantUsecase)
	e := router.NewRouter(userController, stationController, restaurantController)
	e.Logger.Fatal(e.Start(":8080"))
}
