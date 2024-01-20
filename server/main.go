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
	routeRepository := repository.NewRouteRepository(db)
	userUsecase := usecase.NewUserUsecase(userRepository, userValidator)
	stationUsecase := usecase.NewStationUsecase(stationRepository)
	restaurantUsecase := usecase.NewRestaurantUsecase(restaurantRepository)
	routeUsecase := usecase.NewRouteUsecase(routeRepository)
	userController := controller.NewUserController(userUsecase)
	stationController := controller.NewStationController(stationUsecase)
	restaurantController := controller.NewRestaurantController(restaurantUsecase)
	routeController := controller.NewRouteController(routeUsecase)
	e := router.NewRouter(userController, stationController, restaurantController, routeController)
	e.Logger.Fatal(e.Start(":8080"))
}
