package config

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var DB *mongo.Client

var (
	BookingCollection  *mongo.Collection
	StylistCollection  *mongo.Collection
	ServiceCollection  *mongo.Collection
	TimeSlotCollection *mongo.Collection
	ContactCollection  *mongo.Collection
	SettingsCollection *mongo.Collection
)

func ConnectDB() error {
	mongoURI := os.Getenv("MONGO_URI")
	if mongoURI == "" {
		return fmt.Errorf("MONGO_URI is not set")
	}

	clientOptions := options.Client().ApplyURI(mongoURI)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		return fmt.Errorf("failed to connect to MongoDB: %v", err)
	}

	err = client.Ping(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to ping MongoDB: %v", err)
	}

	DB = client
	dbName := os.Getenv("DB_NAME")
	if dbName == "" {
		dbName = "randu_salon"
	}

	BookingCollection = client.Database(dbName).Collection("bookings")
	StylistCollection = client.Database(dbName).Collection("stylists")
	ServiceCollection = client.Database(dbName).Collection("services")
	TimeSlotCollection = client.Database(dbName).Collection("timeslots")
	ContactCollection = client.Database(dbName).Collection("contacts")
	SettingsCollection = client.Database(dbName).Collection("settings")

	log.Println("Connected to MongoDB successfully!")
	return nil
}

func DisconnectDB() error {
	if DB != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		return DB.Disconnect(ctx)
	}
	return nil
}

// Helper functions
func GetBookingCollection() *mongo.Collection {
	return BookingCollection
}

func GetContactCollection() *mongo.Collection {
	return ContactCollection
}
