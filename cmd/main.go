package main

import (
	"CRM/internal/db"
	"CRM/internal/handlers"
	"CRM/internal/repository"
	"CRM/internal/service"
)

func main() {
	db, err := db.InitDB()
	if err != nil {
		panic("")
	}

	repository := repository.NewRepository(db)
	service := service.NewService(repository)
	handler := handlers.NewHandler(service)

	router := handler.InitRoutes()

	router.Run()
}
