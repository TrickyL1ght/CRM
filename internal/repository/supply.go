package repository

import (
	"CRM/internal/model"

	"gorm.io/gorm"
)

type SupplyRepository interface {
	CreateSupply(supply model.Supply) error
	ListSupplies() ([]model.Supply, error)
	GetSupply(id int) (model.Supply, error)
	UpdateSupply(supply model.Supply) error
	DeleteSupply(id int) error
}

type SupplyRepo struct {
	db *gorm.DB
}

func NewSupplyRepo(db *gorm.DB) *SupplyRepo {
	return &SupplyRepo{db: db}
}

func (r *SupplyRepo) CreateSupply(supply model.Supply) error {
	if err := r.db.Create(&supply).Error; err != nil {
		return err
	}
	return nil
}

func (r *SupplyRepo) ListSupplies() ([]model.Supply, error) {
	var supplyList []model.Supply
	if err := r.db.Preload("Offals").Preload("Sale").Find(&supplyList).Error; err != nil {
		return nil, err
	}
	return supplyList, nil
}

func (r *SupplyRepo) GetSupply(id int) (model.Supply, error) {
	var supply model.Supply
	if err := r.db.Where("id = ?", id).First(&supply).Error; err != nil {
		return model.Supply{}, err
	}
	return supply, nil
}

func (r *SupplyRepo) UpdateSupply(supply model.Supply) error {
	if err := r.db.Save(&supply).Error; err != nil {
		return err
	}
	return nil
}

func (r *SupplyRepo) DeleteSupply(id int) error {
	if err := r.db.Delete(&model.Supply{}, id).Error; err != nil {
		return err
	}
	return nil
}
