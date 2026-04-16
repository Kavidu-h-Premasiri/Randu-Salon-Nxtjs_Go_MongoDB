package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Service represents a selected service
type Service struct {
	Name     string `json:"name" bson:"name"`
	Price    int    `json:"price" bson:"price"`
	Category string `json:"category" bson:"category"`
	Duration int    `json:"duration" bson:"duration"`
}

// Booking represents the appointment booking
type Booking struct {
	ID             primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Services       []Service          `json:"services" bson:"services"`
	Stylist        string             `json:"stylist" bson:"stylist"`
	Date           string             `json:"date" bson:"date"`
	Time           string             `json:"time" bson:"time"`
	FinishingTime  string             `json:"finishingTime" bson:"finishingTime"`
	Name           string             `json:"name" bson:"name"`
	Email          string             `json:"email" bson:"email"`
	Phone          string             `json:"phone" bson:"phone"`
	Notes          string             `json:"notes" bson:"notes"`
	TotalPrice     int                `json:"totalPrice" bson:"totalPrice"`
	AppointmentFee int                `json:"appointmentFee" bson:"appointmentFee"`
	ServicesTotal  int                `json:"servicesTotal" bson:"servicesTotal"`
	TotalDuration  int                `json:"totalDuration" bson:"totalDuration"`
	Status         string             `json:"status" bson:"status"`
	CreatedAt      time.Time          `json:"createdAt" bson:"createdAt"`
	UpdatedAt      time.Time          `json:"updatedAt" bson:"updatedAt"`
}

// BookingRequest represents the request body for creating a booking
type BookingRequest struct {
	Services       []Service `json:"services" binding:"required"`
	Stylist        string    `json:"stylist"`
	Date           string    `json:"date" binding:"required"`
	Time           string    `json:"time" binding:"required"`
	FinishingTime  string    `json:"finishingTime"`
	Name           string    `json:"name" binding:"required"`
	Email          string    `json:"email" binding:"required"`
	Phone          string    `json:"phone" binding:"required"`
	Notes          string    `json:"notes"`
	TotalPrice     int       `json:"totalPrice" binding:"required"`
	AppointmentFee int       `json:"appointmentFee"`
	ServicesTotal  int       `json:"servicesTotal"`
	TotalDuration  int       `json:"totalDuration"`
}

// BookingResponse represents the response after creating a booking
type BookingResponse struct {
	Success   bool   `json:"success"`
	Message   string `json:"message"`
	BookingID string `json:"bookingId,omitempty"`
}
