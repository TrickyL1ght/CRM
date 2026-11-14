package handlers

import (
	"CRM/internal/service"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type Handlers struct {
	service service.Service
}

func NewHandler(service service.Service) *Handlers {
	return &Handlers{service: service}
}

func (h *Handlers) InitRoutes() *gin.Engine {
	router := gin.New()

	router.Use(gin.Recovery(), gin.Logger())
	router.Use(cors.Default())

	supplyApi := router.Group("/supply")
	{
		supplyApi.POST("", h.CreateSupply)
		supplyApi.GET("", h.ListSupplies)
		supplyApi.GET("/:id", h.GetSupply)
		supplyApi.PUT("/:id", h.UpdateSupply)
		supplyApi.DELETE("/:id", h.DeleteSupply)
	}

	offalApi := router.Group("/offal")
	{
		offalApi.GET("", h.GetOffalList)
	}

	salesApi := router.Group("/sales")
	{
		salesApi.GET("", h.GetSalesList)
	}

	return router
}
