package handlers

import (
	"CRM/internal/model"

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
		c.JSON(400, err)
		return
	}

	var salesList []model.Sale
	for _, sale := range request.Sales {
		salesList = append(salesList, sale)
	}

	if err := h.service.CreateOrder(salesList); err != nil {
		c.JSON(400, err)
		return
	}

	c.JSON(200, gin.H{})
}
