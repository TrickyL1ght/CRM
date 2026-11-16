package model

type Order struct {
	Id     int
	SaleId int
}
type Sale struct {
	Id            int   `json:"sales_id"`
	Weight        int   `json:"weight"`
	Date          int64 `json:"date"`
	LivestockType int   `json:"livestockType"`
	OffalId       int   `json:"offalId"`
	SupplyId      int   `json:"supplyId"`
}

func (s Sale) TableName() string {
	return "sales"
}

type CreateOrderRequest struct {
	Sales []Sale `json:"sales"`
}
