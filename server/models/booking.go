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
	Services       []ServiceItem      `bson:"services" json:"services"`
	StylistID      primitive.ObjectID `bson:"stylistId,omitempty" json:"stylistId,omitempty"`
	StylistName    string             `bson:"stylistName" json:"stylistName"`
	TimeSlotID     primitive.ObjectID `bson:"timeSlotId,omitempty" json:"timeSlotId,omitempty"`
	Date           string             `bson:"date" json:"date"`
	StartTime      string             `bson:"startTime" json:"startTime"`
	EndTime        string             `bson:"endTime" json:"endTime"`
	TotalDuration  int                `bson:"totalDuration" json:"totalDuration"`
	TotalPrice     int                `bson:"totalPrice" json:"totalPrice"`
	AppointmentFee int                `bson:"appointmentFee" json:"appointmentFee"`
	ServicesTotal  int                `bson:"servicesTotal" json:"servicesTotal"`
	Status         string             `bson:"status" json:"status"`
	OTP            string             `bson:"otp" json:"otp"`
	OTPVerified    bool               `bson:"otpVerified" json:"otpVerified"`
	OTPExpiry      time.Time          `bson:"otpExpiry" json:"otpExpiry"`
	Notes          string             `bson:"notes" json:"notes"`
	CreatedAt      time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt      time.Time          `bson:"updatedAt" json:"updatedAt"`
}

type ServiceItem struct {
	ServiceID primitive.ObjectID `bson:"serviceId,omitempty" json:"serviceId,omitempty"`
	Name      string             `bson:"name" json:"name"`
	Price     int                `bson:"price" json:"price"`
	Category  string             `bson:"category" json:"category"`
	Duration  int                `bson:"duration" json:"duration"`
}

type BookingRequest struct {
	Services       []ServiceItem `json:"services"`
	StylistID      string        `json:"stylistId"`
	StylistName    string        `json:"stylistName"`
	Date           string        `json:"date"`
	TimeSlotID     string        `json:"timeSlotId"`
	StartTime      string        `json:"startTime"`
	EndTime        string        `json:"endTime"`
	Name           string        `json:"name"`
	Email          string        `json:"email"`
	Phone          string        `json:"phone"`
	Notes          string        `json:"notes"`
	TotalPrice     int           `json:"totalPrice"`
	AppointmentFee int           `json:"appointmentFee"`
	ServicesTotal  int           `json:"servicesTotal"`
	TotalDuration  int           `json:"totalDuration"`
}

type OTPRequest struct {
	Email string `json:"email" validate:"required,email"`
}

type OTPVerifyRequest struct {
	Email string `json:"email" validate:"required,email"`
	OTP   string `json:"otp" validate:"required,len=6"`
}

type BookingResponse struct {
	Success bool    `json:"success"`
	Message string  `json:"message"`
	Booking Booking `json:"booking,omitempty"`
	ID      string  `json:"id,omitempty"`
}
