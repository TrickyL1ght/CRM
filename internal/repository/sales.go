package repository

import (
	"CRM/internal/model"
	"errors"

	"github.com/jackc/pgx/v5/pgconn"
	"gorm.io/gorm"
)

type SalesRepository interface {
	GetSalesList() ([]model.Sale, error)
	GetSalesById(id int) ([]model.Sale, error)
	CreateOrder(sales []model.Sale) error
}

type SalesRepo struct {
	db *gorm.DB
}

func NewSalesRepo(db *gorm.DB) *SalesRepo {
	return &SalesRepo{db}
}

func (r *SalesRepo) GetSalesList() ([]model.Sale, error) {
	var salesList []model.Sale
	if err := r.db.Find(&salesList).Error; err != nil {
		return []model.Sale{}, err
	}
	return salesList, nil
}

func (r *SalesRepo) GetSalesById(id int) ([]model.Sale, error) {
	var salesList []model.Sale
	if err := r.db.Where("supply_id = ?", id).Find(&salesList).Error; err != nil {
		return nil, err
	}
	return salesList, nil
}

func (r *SalesRepo) CreateOrder(sales []model.Sale) error {
	err := r.db.Transaction(func(tx *gorm.DB) error {
		var salesId []int
		for _, sale := range sales {
			if err := tx.Create(&sale).Error; err != nil {
				var errNotFound *pgconn.PgError
				if errors.As(err, &errNotFound) && errNotFound.ConstraintName == "sales_supply_id_fkey" && errNotFound.Code == "23503" {
					return model.ErrSupplyNotFound
				}
				return err
			}
			salesId = append(salesId, sale.Id)
		}

		for _, id := range salesId {
			order := model.Order{SaleId: id}
			if err := tx.Create(&order).Error; err != nil {
				return err
			}
		}
		return nil
	})

	if err != nil {
		return err
	}
	return nil
}
