package handlers

import (
	"CRM/internal/model"
	"strconv"

	"github.com/gin-gonic/gin"
)

func (h Handlers) CreateSupply(c *gin.Context) {

	var request model.Supply
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(400, map[string]string{"message": err.Error()})
		return
	}

	err := h.service.CreateSupply(request)
	if err != nil {
		c.JSON(400, map[string]interface{}{"error": err.Error()})
		return
	}

	c.JSON(200, gin.H{})
}

func (h Handlers) ListSupplies(c *gin.Context) {
	supplyList, err := h.service.ListSupplies()
	if err != nil {
		c.JSON(400, err)
		return
	}

	c.JSON(200, supplyList)
}

func (h Handlers) GetSupply(c *gin.Context) {
	supplyId, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(400, map[string]string{"message": "incorrect id"})
	}

	supply, err := h.service.GetSupply(supplyId)
	if err != nil {
		c.JSON(400, err)
		return
	}

	reminder, err := h.service.GetReminderById(supplyId)
	if err != nil {
		c.JSON(500, err)
		return
	}

	response := model.SupplyListResponse{
		Id:            supply.Id,
		LivestockType: supply.LivestockType,
		DateOfReceipt: supply.DateOfReceipt,
		CommingFrom:   supply.CommingFrom,
		Weight:        supply.Weight,
		Offals:        supply.Offals,
		Sale:          supply.Sale,
		Remainder:     reminder,
	}
	c.JSON(200, response)
}

func (h Handlers) UpdateSupply(c *gin.Context) {
	var request model.Supply
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(400, gin.H{})
	}

	supplyId, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(400, map[string]string{"message": "incorrect id"})
	}

	request.Id = supplyId

	err = h.service.UpdateSupply(request)
	if err != nil {
		c.JSON(400, err)
	}

	c.JSON(200, gin.H{})
}

func (h Handlers) DeleteSupply(c *gin.Context) {
	supplyId, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(400, map[string]string{"message": "incorrect id"})
	}

	err = h.service.DeleteSupply(supplyId)
	if err != nil {
		c.JSON(400, err)
	}

	c.JSON(200, gin.H{})
}
