package main

import (
	"encoding/csv"
	"fmt"
	"log"
	"os"
	"server/database"
	"server/model"
	"strconv"
	"strings"

	"gorm.io/gorm"
)

func main() {
	db := database.NewDB()
	defer fmt.Println("Successfully Migrated")
	defer database.CloseDB(db)
	db.AutoMigrate(&model.User{}, &model.TransportRecord{})
	initializeTransportRecord(db)
}

func initializeTransportRecord(db *gorm.DB) {
	file, err := os.Open("./data/station_info_all.csv")
	if err != nil {
		log.Fatal("Failed to load the CSV file", err)
	}
	defer file.Close()

	reader := csv.NewReader(file)
	reader.Comma = '\t'
	records, err := reader.ReadAll()
	if err != nil {
		log.Fatal("An error occurred while reading the CSV file", err)
	}

	for _, record := range records[1:] {
		record := strings.Split(record[0], ",")
		time, _ := strconv.ParseUint(record[2], 10, 64)
		count, _ := strconv.ParseUint(record[3], 10, 64)
		fare, _ := strconv.ParseUint(record[4], 10, 64)

		transportRecord := model.TransportRecord{
			Departure:     record[0],
			Destination:   record[1],
			Time:          uint(time),
			Count:         uint(count),
			Fare:          uint(fare),
		}

		if err := db.Create(&transportRecord).Error; err != nil {
			log.Fatal("Failed to create the data", err)
		}
	}

	fmt.Println("Successfully Initialized")
}
