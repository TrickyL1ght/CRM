package service

import (
	"CRM/internal/model"
	"CRM/internal/repository"
)

type SupplyService interface {
	CreateSupply(supply model.Supply) error
	ListSupplies() ([]model.Supply, error)
	GetSupply(id int) (model.Supply, error)
	UpdateSupply(supply model.Supply) error
	DeleteSupply(id int) error
}

type SupplyServ struct {
	repository repository.Repository
}

func NewSupplyServ(repository repository.Repository) *SupplyServ {
	return &SupplyServ{repository}
}

func (s SupplyServ) CreateSupply(supply model.Supply) error {
	return s.repository.CreateSupply(supply)
}

func (s SupplyServ) ListSupplies() ([]model.Supply, error) {
	return s.repository.ListSupplies()
}

func (s SupplyServ) GetSupply(id int) (model.Supply, error) {
	return s.repository.GetSupply(id)
}

func (s SupplyServ) UpdateSupply(supply model.Supply) error {
	return s.repository.UpdateSupply(supply)
}

func (s SupplyServ) DeleteSupply(id int) error {
	return s.repository.DeleteSupply(id)
}
