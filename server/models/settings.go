package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Setting struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Key       string             `bson:"key" json:"key"`
	Value     interface{}        `bson:"value" json:"value"`
	Category  string             `bson:"category" json:"category"`
	UpdatedAt time.Time          `bson:"updatedAt" json:"updatedAt"`
}

type BusinessHours struct {
	Day   string `json:"day"`
	Start string `json:"start"`
	End   string `json:"end"`
}

type AppointmentSettings struct {
	FeePerService         int `json:"feePerService"`
	MaxAppointmentFee     int `json:"maxAppointmentFee"`
	MaxServicesPerBooking int `json:"maxServicesPerBooking"`
	OTPExpiryMinutes      int `json:"otpExpiryMinutes"`
	MaxDaysAdvance        int `json:"maxDaysAdvance"`
}
