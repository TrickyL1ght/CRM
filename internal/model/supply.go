package model

type Supply struct {
	Id            int     `json:"id"`
	LivestockType int     `json:"livestockType,omitempty"`
	DateOfReceipt int64   `json:"dateOfReceipt,omitempty"`
	CommingFrom   string  `json:"commingFrom,omitempty"`
	Weight        int     `json:"weight,omitempty"`
	Offals        []Offal `json:"offals" gorm:"many2many:supply_offal"`
	Sale          []Sale  `json:"sale"`
}

type SupplyListResponse struct {
	Id            int     `json:"id"`
	LivestockType int     `json:"livestockType,omitempty"`
	DateOfReceipt int64   `json:"dateOfReceipt,omitempty"`
	CommingFrom   string  `json:"commingFrom,omitempty"`
	Weight        int     `json:"weight,omitempty"`
	Offals        []Offal `json:"offals" gorm:"many2many:supply_offal"`
	Sale          []Sale  `json:"sale"`
	Remainder     int     `json:"remainder"`
}

func (s Supply) TableName() string {
	return "supply"
}
