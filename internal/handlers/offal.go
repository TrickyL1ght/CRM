package handlers

import "github.com/gin-gonic/gin"

func (h *Handlers) GetOffalList(c *gin.Context) {
	offalList, err := h.service.GetOffalList()
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, offalList)
}
