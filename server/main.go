package main

import (
	"server/controller"
	"server/database"
	"server/model"
	"server/repository"
	"server/router"
	"server/usecase"
	"server/validator"
)

func main() {
	db := database.NewDB()
	roomManager := *model.NewRoomManager()
	hub := model.NewHub()
	go hub.RunLoop()

	userValidator := validator.NewUserValidator()
	userRepository := repository.NewUserRepository(db)
	stationRepository := repository.NewStationRepository(db)
	restaurantRepository := repository.NewRestaurantRepository(db)
	routeRepository := repository.NewRouteRepository(db)
	userUsecase := usecase.NewUserUsecase(userRepository, userValidator, roomManager)
	stationUsecase := usecase.NewStationUsecase(stationRepository)
	restaurantUsecase := usecase.NewRestaurantUsecase(restaurantRepository)
	routeUsecase := usecase.NewRouteUsecase(routeRepository)
	userController := controller.NewUserController(userUsecase)
	stationController := controller.NewStationController(stationUsecase, hub)
	restaurantController := controller.NewRestaurantController(restaurantUsecase, hub)
	routeController := controller.NewRouteController(routeUsecase, hub)

	websocketController := controller.NewWebsocketController(hub, roomManager)

	e := router.NewRouter(userController, stationController, restaurantController, routeController, websocketController)
	e.Logger.Fatal(e.Start(":8080"))
}
