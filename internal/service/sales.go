package service

import (
	"CRM/internal/model"
	"CRM/internal/repository"
	"errors"
)

type SalesService interface {
	GetSalesList() ([]model.Sale, error)
	GetReminderById(id int) (int, error)
	CreateOrder(sales []model.Sale) error
}

type SalesServ struct {
	repository repository.Repository
}

func NewSalesServ(repository repository.Repository) *SalesServ {
	return &SalesServ{repository}
}

func (s *SalesServ) GetSalesList() ([]model.Sale, error) {
	salesList, err := s.repository.GetSalesList()
	if err != nil {
		return []model.Sale{}, err
	}
	return salesList, nil
}

func (s *SalesServ) GetReminderById(id int) (int, error) {
	var sales []model.Sale
	sales, err := s.repository.GetSalesById(id)
	if err != nil {
		return 0, err
	}

	if len(sales) == 0 {
		return 0, errors.New("Продажи по данной отгрузке не найдены")
	}

	totalWeight := 0
	for _, sale := range sales {
		totalWeight += sale.Weight
	}

	var supply model.Supply
	supply, err = s.repository.GetSupply(id)
	if err != nil {
		return 0, err
	}

	reminder := supply.Weight - totalWeight

	return reminder, nil
}

func (s *SalesServ) CreateOrder(sales []model.Sale) error {
	return s.repository.CreateOrder(sales)
}
