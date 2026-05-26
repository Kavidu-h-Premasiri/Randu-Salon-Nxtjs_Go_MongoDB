package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Booking struct {
	ID             primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name           string             `bson:"name" json:"name" validate:"required"`
	Email          string             `bson:"email" json:"email" validate:"required,email"`
	Phone          string             `bson:"phone" json:"phone" validate:"required"`
	Service        string             `bson:"service" json:"service"`
	Services       []ServiceItem      `bson:"services" json:"services"`
	Stylist        string             `bson:"stylist" json:"stylist" validate:"required"`
	Date           string             `bson:"date" json:"date" validate:"required"`
	Time           string             `bson:"time" json:"time" validate:"required"`
	FinishingTime  string             `bson:"finishingTime" json:"finishingTime"`
	Notes          string             `bson:"notes" json:"notes"`
	Status         string             `bson:"status" json:"status"` // pending, confirmed, cancelled
	OTP            string             `bson:"otp" json:"otp"`
	OTPVerified    bool               `bson:"otpVerified" json:"otpVerified"`
	OTPExpiry      time.Time          `bson:"otpExpiry" json:"otpExpiry"`
	TotalPrice     int                `bson:"totalPrice" json:"totalPrice"`
	AppointmentFee int                `bson:"appointmentFee" json:"appointmentFee"`
	ServicesTotal  int                `bson:"servicesTotal" json:"servicesTotal"`
	TotalDuration  int                `bson:"totalDuration" json:"totalDuration"`
	CreatedAt      time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt      time.Time          `bson:"updatedAt" json:"updatedAt"`
}

type ServiceItem struct {
	Name     string `bson:"name" json:"name"`
	Price    int    `bson:"price" json:"price"`
	Category string `bson:"category" json:"category"`
	Duration int    `bson:"duration" json:"duration"`
}

type OTPRequest struct {
	Email string `json:"email" validate:"required,email"`
}

type OTPVerifyRequest struct {
	Email string `json:"email" validate:"required,email"`
	OTP   string `json:"otp" validate:"required,len=6"`
}

type BookingRequest struct {
	Services       []ServiceItem `json:"services"`
	Stylist        string        `json:"stylist"`
	Date           string        `json:"date"`
	Time           string        `json:"time"`
	FinishingTime  string        `json:"finishingTime"`
	Name           string        `json:"name"`
	Email          string        `json:"email"`
	Phone          string        `json:"phone"`
	Notes          string        `json:"notes"`
	TotalPrice     int           `json:"totalPrice"`
	AppointmentFee int           `json:"appointmentFee"`
	ServicesTotal  int           `json:"servicesTotal"`
	TotalDuration  int           `json:"totalDuration"`
}

type BookingResponse struct {
	Success bool    `json:"success"`
	Message string  `json:"message"`
	Booking Booking `json:"booking,omitempty"`
	ID      string  `json:"id,omitempty"`
}
