package model

type Sales struct {
	Id    int
	Sales []Sale
}
type Sale struct {
	SalesId       int   `json:"sales_id"`
	Weight        int   `json:"weight"`
	Date          int64 `json:"date"`
	LivestockType int   `json:"livestockType"`
	SupplyId      int   `json:"supplyId"`
}

func (s Sale) TableName() string {
	return "sales"
}
