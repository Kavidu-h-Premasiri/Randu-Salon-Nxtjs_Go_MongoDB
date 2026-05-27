package main

import (
	"context"
	"log"
	"time"

	"server/config"
	"server/models"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func main() {
	godotenv.Load("../.env")
	config.ConnectDB()
	defer config.DisconnectDB()

	ctx := context.Background()

	// Seed Stylists
	stylists := []models.Stylist{
		{
			ID:          primitive.NewObjectID(),
			Name:        "Isabella Montgomery",
			Email:       "isabella@randusalon.com",
			Phone:       "+94 77 123 4567",
			Specialties: []string{"Women's Haircuts", "Color", "Bridal"},
			Bio:         "Master stylist with 10+ years of experience",
			IsActive:    true,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		{
			ID:          primitive.NewObjectID(),
			Name:        "Marcus Chen",
			Email:       "marcus@randusalon.com",
			Phone:       "+94 77 234 5678",
			Specialties: []string{"Men's Haircuts", "Fades", "Beard Styling"},
			Bio:         "Specialist in modern men's grooming",
			IsActive:    true,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		{
			ID:          primitive.NewObjectID(),
			Name:        "Sofia Rodriguez",
			Email:       "sofia@randusalon.com",
			Phone:       "+94 77 345 6789",
			Specialties: []string{"Hair Styling", "Updos", "Extensions"},
			Bio:         "Creative styling expert",
			IsActive:    true,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
	}

	for _, stylist := range stylists {
		config.StylistCollection.InsertOne(ctx, stylist)
	}
	log.Println("✅ Stylists seeded")

	// Seed Services
	services := []models.Service{
		{ID: primitive.NewObjectID(), Name: "Women's Haircut & Style", Category: "Haircuts", Price: 600, Duration: 40, IsActive: true, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: primitive.NewObjectID(), Name: "Men's Haircut", Category: "Haircuts", Price: 500, Duration: 25, IsActive: true, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: primitive.NewObjectID(), Name: "Full Color", Category: "Coloring", Price: 1300, Duration: 50, IsActive: true, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: primitive.NewObjectID(), Name: "Highlights", Category: "Coloring", Price: 1000, Duration: 40, IsActive: true, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: primitive.NewObjectID(), Name: "Blowout", Category: "Styling", Price: 600, Duration: 45, IsActive: true, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: primitive.NewObjectID(), Name: "Classic Facial", Category: "Facials", Price: 600, Duration: 40, IsActive: true, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: primitive.NewObjectID(), Name: "Classic Manicure", Category: "Nails", Price: 600, Duration: 15, IsActive: true, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: primitive.NewObjectID(), Name: "Bridal Hair & Makeup", Category: "Bridal", Price: 3500, Duration: 180, IsActive: true, CreatedAt: time.Now(), UpdatedAt: time.Now()},
	}

	for _, service := range services {
		config.ServiceCollection.InsertOne(ctx, service)
	}
	log.Println("✅ Services seeded")

	log.Println("🎉 Database seeding completed!")
}
