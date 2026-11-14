package db

import (
	"log"
	"os"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func InitDB() (*gorm.DB, error) {
	if err := godotenv.Load(); err != nil {
		panic(".env file not found")
	}

	dsn := os.Getenv("DATABASECONNECT")

	var err error
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("could not init DB: %v", err)
	}

	return db, nil
}
