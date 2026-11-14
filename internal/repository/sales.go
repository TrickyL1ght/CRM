package repository

import (
	"CRM/internal/model"

	"gorm.io/gorm"
)

type SalesRepository interface {
	GetSalesList() (model.Sales, error)
	GetSalesById(id int) ([]model.Sale, error)
}

type SalesRepo struct {
	db *gorm.DB
}

func NewSalesRepo(db *gorm.DB) *SalesRepo {
	return &SalesRepo{db}
}

func (r *SalesRepo) GetSalesList() (model.Sales, error) {
	var salesList []model.Sale
	if err := r.db.Find(&salesList).Error; err != nil {
		return model.Sales{}, err
	}
	return model.Sales{salesList}, nil
}

func (r *SalesRepo) GetSalesById(id int) ([]model.Sale, error) {
	var salesList []model.Sale
	if err := r.db.Where("supply_id = ?", id).Find(&salesList).Error; err != nil {
		return nil, err
	}
	return salesList, nil
}
