package service

import "CRM/internal/repository"

type Service struct {
	SupplyService
	OffalService
	SalesService
}

func NewService(repository repository.Repository) Service {
	return Service{
		NewSupplyServ(repository),
		NewOffalServ(repository),
		NewSalesServ(repository),
	}
}
