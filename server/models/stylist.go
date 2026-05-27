package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Stylist struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name        string             `bson:"name" json:"name" validate:"required"`
	Email       string             `bson:"email" json:"email" validate:"required,email"`
	Phone       string             `bson:"phone" json:"phone"`
	Specialties []string           `bson:"specialties" json:"specialties"`
	Bio         string             `bson:"bio" json:"bio"`
	ImageURL    string             `bson:"imageUrl" json:"imageUrl"`
	IsActive    bool               `bson:"isActive" json:"isActive"`
	CreatedAt   time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt   time.Time          `bson:"updatedAt" json:"updatedAt"`
}

type TimeSlot struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	StylistID primitive.ObjectID `bson:"stylistId" json:"stylistId"`
	Date      string             `bson:"date" json:"date"` // YYYY-MM-DD
	StartTime string             `bson:"startTime" json:"startTime"`
	EndTime   string             `bson:"endTime" json:"endTime"`
	IsBooked  bool               `bson:"isBooked" json:"isBooked"`
	BookingID primitive.ObjectID `bson:"bookingId,omitempty" json:"bookingId,omitempty"`
	CreatedAt time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt time.Time          `bson:"updatedAt" json:"updatedAt"`
}
