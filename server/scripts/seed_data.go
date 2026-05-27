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
	// Load .env file
	if err := godotenv.Load("../.env"); err != nil {
		log.Println("No .env file found, using system env")
	}

	// Connect to MongoDB
	if err := config.ConnectDB(); err != nil {
		log.Fatal("Failed to connect:", err)
	}
	defer config.DisconnectDB()

	ctx := context.Background()

	// ========== 1. CREATE STYLISTS ==========
	log.Println("📌 Creating stylists...")

	// Clear existing
	config.StylistCollection.Drop(ctx)

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
		_, err := config.StylistCollection.InsertOne(ctx, stylist)
		if err != nil {
			log.Println("Error inserting stylist:", err)
		}
	}
	log.Println("✅ Created 3 stylists")

	// ========== 2. CREATE SERVICES ==========
	log.Println("📌 Creating services...")

	config.ServiceCollection.Drop(ctx)

	services := []models.Service{
		{ID: primitive.NewObjectID(), Name: "Women's Haircut & Style", Category: "Haircuts", Price: 600, Duration: 40, IsActive: true, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: primitive.NewObjectID(), Name: "Men's Haircut", Category: "Haircuts", Price: 500, Duration: 25, IsActive: true, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: primitive.NewObjectID(), Name: "Children's Haircut", Category: "Haircuts", Price: 400, Duration: 30, IsActive: true, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: primitive.NewObjectID(), Name: "Full Color", Category: "Coloring", Price: 1300, Duration: 50, IsActive: true, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: primitive.NewObjectID(), Name: "Highlights", Category: "Coloring", Price: 1000, Duration: 40, IsActive: true, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: primitive.NewObjectID(), Name: "Balayage", Category: "Coloring", Price: 800, Duration: 180, IsActive: true, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: primitive.NewObjectID(), Name: "Blowout", Category: "Styling", Price: 600, Duration: 45, IsActive: true, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: primitive.NewObjectID(), Name: "Updo/Special Occasion", Category: "Styling", Price: 500, Duration: 45, IsActive: true, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: primitive.NewObjectID(), Name: "Classic Facial", Category: "Facials", Price: 600, Duration: 40, IsActive: true, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: primitive.NewObjectID(), Name: "Deep Cleansing Facial", Category: "Facials", Price: 800, Duration: 35, IsActive: true, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: primitive.NewObjectID(), Name: "Classic Manicure", Category: "Nails", Price: 600, Duration: 15, IsActive: true, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: primitive.NewObjectID(), Name: "Gel Manicure", Category: "Nails", Price: 800, Duration: 30, IsActive: true, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: primitive.NewObjectID(), Name: "Classic Pedicure", Category: "Nails", Price: 650, Duration: 20, IsActive: true, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: primitive.NewObjectID(), Name: "Bridal Hair & Makeup", Category: "Bridal", Price: 3500, Duration: 180, IsActive: true, CreatedAt: time.Now(), UpdatedAt: time.Now()},
	}

	for _, service := range services {
		_, err := config.ServiceCollection.InsertOne(ctx, service)
		if err != nil {
			log.Println("Error inserting service:", err)
		}
	}
	log.Println("✅ Created 14 services")

	// ========== 3. GET ALL STYLISTS ==========
	log.Println("📌 Fetching stylists...")

	cursor, err := config.StylistCollection.Find(ctx, primitive.M{})
	if err != nil {
		log.Fatal("Error fetching stylists:", err)
	}
	defer cursor.Close(ctx)

	var allStylists []models.Stylist
	if err = cursor.All(ctx, &allStylists); err != nil {
		log.Fatal("Error decoding stylists:", err)
	}

	log.Printf("Found %d stylists", len(allStylists))

	// ========== 4. CREATE TIME SLOTS ==========
	log.Println("📌 Creating time slots...")

	config.TimeSlotCollection.Drop(ctx)

	timeSlots := []string{"09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
		"12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
		"03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM"}

	slotCount := 0
	for i := 0; i < 7; i++ {
		date := time.Now().AddDate(0, 0, i+1).Format("2006-01-02")

		for _, stylist := range allStylists {
			for _, slotTime := range timeSlots {
				timeSlot := models.TimeSlot{
					ID:        primitive.NewObjectID(),
					StylistID: stylist.ID,
					Date:      date,
					StartTime: slotTime,
					EndTime:   slotTime,
					IsBooked:  false,
					CreatedAt: time.Now(),
					UpdatedAt: time.Now(),
				}
				_, err := config.TimeSlotCollection.InsertOne(ctx, timeSlot)
				if err == nil {
					slotCount++
				}
			}
		}
	}
	log.Printf("✅ Created %d time slots", slotCount)

	// ========== 5. GET SAMPLE SERVICES ==========
	log.Println("📌 Fetching services...")

	serviceCursor, err := config.ServiceCollection.Find(ctx, primitive.M{})
	if err != nil {
		log.Fatal("Error fetching services:", err)
	}
	defer serviceCursor.Close(ctx)

	var allServices []models.Service
	if err = serviceCursor.All(ctx, &allServices); err != nil {
		log.Fatal("Error decoding services:", err)
	}

	log.Printf("Found %d services", len(allServices))

	// ========== 6. CREATE SAMPLE BOOKING ==========
	log.Println("📌 Creating sample booking...")

	if len(allStylists) > 0 && len(allServices) > 0 {
		firstStylist := allStylists[0]

		// Get first 2 services
		var serviceItems []models.ServiceItem
		for i := 0; i < 2 && i < len(allServices); i++ {
			serviceItems = append(serviceItems, models.ServiceItem{
				Name:     allServices[i].Name,
				Price:    allServices[i].Price,
				Category: allServices[i].Category,
				Duration: allServices[i].Duration,
			})
		}

		// Get an available time slot
		var timeSlot models.TimeSlot
		err := config.TimeSlotCollection.FindOne(ctx, primitive.M{"isBooked": false}).Decode(&timeSlot)

		if err == nil {
			// Mark time slot as booked
			config.TimeSlotCollection.UpdateOne(ctx,
				primitive.M{"_id": timeSlot.ID},
				primitive.M{"$set": primitive.M{"isBooked": true}})

			totalPrice := 0
			for _, s := range serviceItems {
				totalPrice += s.Price
			}

			booking := models.Booking{
				ID:             primitive.NewObjectID(),
				Name:           "John Doe",
				Email:          "john@example.com",
				Phone:          "+94 77 123 4567",
				Services:       serviceItems,
				StylistID:      firstStylist.ID,
				StylistName:    firstStylist.Name,
				TimeSlotID:     timeSlot.ID,
				Date:           timeSlot.Date,
				StartTime:      timeSlot.StartTime,
				TotalDuration:  60,
				TotalPrice:     totalPrice,
				AppointmentFee: 50,
				ServicesTotal:  totalPrice,
				Status:         "confirmed",
				OTPVerified:    true,
				Notes:          "First time customer",
				CreatedAt:      time.Now(),
				UpdatedAt:      time.Now(),
			}

			_, err = config.BookingCollection.InsertOne(ctx, booking)
			if err == nil {
				log.Println("✅ Created 1 sample booking")
			}
		}
	}

	log.Println("\n🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!")
	log.Println("📊 Summary:")
	log.Println("   - Stylists: 3")
	log.Println("   - Services: 14")
	log.Printf("   - Time Slots: %d", slotCount)
	log.Println("   - Bookings: 1 sample")
}
