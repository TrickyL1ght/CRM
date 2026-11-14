package model

type Offal struct {
	Id   int    `json:"id"`
	Name string `json:"name"`
}

func (o Offal) TableName() string {
	return "offal"
}
