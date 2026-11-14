package repository

import (
	"CRM/internal/model"

	"gorm.io/gorm"
)

type OffalRepository interface {
	GetOffalList() ([]model.Offal, error)
}
type OffalRepo struct {
	db *gorm.DB
}

func NewOffalRepo(db *gorm.DB) *OffalRepo {
	return &OffalRepo{db: db}
}

func (r *OffalRepo) GetOffalList() ([]model.Offal, error) {
	var offalList []model.Offal
	if err := r.db.Find(&offalList).Error; err != nil {
		return nil, err
	}
	return offalList, nil
}

func (r *OffalRepo) UpdateOffal() error {
	if err := r.db.Save(&model.Offal{}).Error; err != nil {
		return err
	}
	return nil
}
