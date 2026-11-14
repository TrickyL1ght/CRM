package handlers

import (
	"github.com/gin-gonic/gin"
)

func (h *Handlers) GetSalesList(c *gin.Context) {
	salesList, err := h.service.GetSalesList()
	if err != nil {
		c.JSON(500, err)
	}

	c.JSON(200, salesList)
}
