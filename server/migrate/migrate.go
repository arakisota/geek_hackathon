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
	db.AutoMigrate(&model.User{}, &model.TransportRecord{}, &model.StationInfo{})
	// initializeTransportRecord(db)
	initializeStationInfo(db)
}

func initializeTransportRecord(db *gorm.DB) {
	db.Model(&model.TransportRecord{}).Where("1 = 1").Delete(&model.TransportRecord{})
	file, err := os.Open("./data/transport_record.csv")
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
			// InformationId: uint(idx),
			Departure:   record[0],
			Destination: record[1],
			Time:        uint(time),
			Count:       uint(count),
			Fare:        uint(fare),
		}

		if err := db.Create(&transportRecord).Error; err != nil {
			log.Fatal("Failed to create the data", err)
		}
	}

	fmt.Println("Successfully Initialized Transport Record")
}

func initializeStationInfo(db *gorm.DB) {
	db.Model(&model.StationInfo{}).Where("1 = 1").Delete(&model.StationInfo{})
	file, err := os.Open("./data/unique_station.csv")
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
		longitude, _ := strconv.ParseFloat(record[1], 64)
		latitude, _ := strconv.ParseFloat(record[2], 64)
		stationCode, _ := strconv.ParseUint(record[3], 10, 64)
		prefectureCode, _ := strconv.ParseUint(record[5], 10, 64)

		fmt.Println(record[0], record[1], record[2], record[3], record[4], record[5])

		stationInfo := model.StationInfo{
			Name:           record[0],
			Yomi:           record[4],
			Longitude:      longitude,
			Latitude:       latitude,
			StationCode:    uint(stationCode),
			PrefectureCode: uint(prefectureCode),
		}

		if err := db.Create(&stationInfo).Error; err != nil {
			log.Fatal("Failed to create the data", err)
		}
	}
	fmt.Println("Successfully Initialized Station Info")
}
