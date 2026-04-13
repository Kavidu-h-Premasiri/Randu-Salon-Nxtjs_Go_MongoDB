package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Contact struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name      string             `bson:"name" json:"name" validate:"required"`
	Email     string             `bson:"email" json:"email" validate:"required,email"`
	Phone     string             `bson:"phone" json:"phone"`
	Subject   string             `bson:"subject" json:"subject" validate:"required"`
	Message   string             `bson:"message" json:"message" validate:"required"`
	CreatedAt time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt time.Time          `bson:"updated_at" json:"updated_at"`
}

type ContactResponse struct {
	Success bool     `json:"success"`
	Message string   `json:"message"`
	Data    *Contact `json:"data,omitempty"`
}
