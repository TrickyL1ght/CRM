package handlers

import (
	"CRM/internal/model"
	"fmt"

	"github.com/gin-gonic/gin"
)

func (h *Handlers) GetSalesList(c *gin.Context) {
	salesList, err := h.service.GetSalesList()
	if err != nil {
		c.JSON(500, err)
	}

	c.JSON(200, salesList)
}

func (h *Handlers) CreateOrder(c *gin.Context) {
	var request model.CreateOrderRequest
	err := c.ShouldBindJSON(&request)
	if err != nil {
		c.JSON(400, map[string]string{"error": "Некорректное тело запроса"})
		return
	}

	var salesList []model.Sale
	for _, sale := range request.Sales {
		salesList = append(salesList, sale)
	}

	if err := h.service.CreateOrder(salesList); err != nil {
		c.JSON(400, gin.H{"error": fmt.Sprintf("Ошибка при сохранении продажи: %s", err.Error())})
		return
	}

	c.JSON(200, gin.H{})
}
