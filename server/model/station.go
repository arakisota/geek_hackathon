package model

type TransportRecord struct {
    InformationId uint   `gorm:"primaryKey;autoIncrement"`
    Departure     string
    Destination   string
    Time          uint
    Count         uint
    Fare          uint
}