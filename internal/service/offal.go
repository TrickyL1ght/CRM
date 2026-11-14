package service

import (
	"CRM/internal/model"
	"CRM/internal/repository"
)

type OffalService interface {
	GetOffalList() ([]model.Offal, error)
}
type OffalServ struct {
	repository repository.Repository
}

func NewOffalServ(repository repository.Repository) *OffalServ {
	return &OffalServ{repository: repository}
}

func (s *OffalServ) GetOffalList() ([]model.Offal, error) {
	return s.repository.GetOffalList()
}
