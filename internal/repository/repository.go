package repository

import "gorm.io/gorm"

type Repository struct {
	SupplyRepository
	OffalRepository
	SalesRepository
}

func NewRepository(db *gorm.DB) Repository {
	return Repository{
		NewSupplyRepo(db),
		NewOffalRepo(db),
		NewSalesRepo(db),
	}
}
