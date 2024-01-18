package router

import (
	"net/http"
	"os"
	"server/controller"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

// URLパスとControllerのアクションをマッピング
// エンドポイントの定義

func NewRouter(uc controller.IUserController, sc controller.IStationController, rc controller.IRestaurantController) *echo.Echo {
	e := echo.New()
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"http://localhost:3000", os.Getenv("FE_URL")},
		AllowHeaders: []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept,
			echo.HeaderAccessControlAllowHeaders, echo.HeaderXCSRFToken},
		AllowMethods:     []string{"GET", "PUT", "POST", "DELETE"},
		AllowCredentials: true,
	}))
	e.Use(middleware.CSRFWithConfig(middleware.CSRFConfig{
		CookiePath:     "/",
		CookieDomain:   os.Getenv("API_DOMAIN"),
		CookieHTTPOnly: true,
		CookieSameSite: http.SameSiteDefaultMode, // postmanで確認する時
	}))
	e.POST("/signup", uc.SignUp)
	e.POST("/login", uc.LogIn)
	e.POST("/logout", uc.LogOut)
	e.GET("/csrf", uc.CsrfToken)

	e.POST("/stations", sc.GetStations)
	e.GET("/suggest", sc.GetSuggestion)
	e.POST("/restaurants", rc.GetRestaurants)
	return e
}
