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
	// Load .env
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found")
	}

	// Connect to MongoDB
	if err := config.ConnectDB(); err != nil {
		log.Fatal("Failed to connect:", err)
	}
	defer config.DisconnectDB()

	ctx := context.Background()

	// Clear existing data
	log.Println("Clearing existing collections...")
	config.StylistCollection.Drop(ctx)
	config.ServiceCollection.Drop(ctx)
	config.TimeSlotCollection.Drop(ctx)

	// ===== CREATE STYLISTS =====
	log.Println("Creating stylists...")
	stylists := []models.Stylist{
		{
			ID:          primitive.NewObjectID(),
			Name:        "Isabella Montgomery",
			Email:       "isabella@randusalon.com",
			Phone:       "+94 77 123 4567",
			Specialties: []string{"Women's Haircuts", "Color", "Bridal"},
			Bio:         "Master stylist with 10+ years experience",
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

	for _, s := range stylists {
		if _, err := config.StylistCollection.InsertOne(ctx, s); err != nil {
			log.Println("Error inserting stylist:", err)
		}
	}
	log.Println("✅ Created 3 stylists")

	// ===== CREATE SERVICES =====
	log.Println("Creating services...")
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

	for _, s := range services {
		if _, err := config.ServiceCollection.InsertOne(ctx, s); err != nil {
			log.Println("Error inserting service:", err)
		}
	}
	log.Println("✅ Created 14 services")

	// ===== GET STYLISTS FOR TIME SLOTS =====
	log.Println("Fetching stylists for time slots...")
	cursor, err := config.StylistCollection.Find(ctx, primitive.M{})
	if err != nil {
		log.Fatal("Error fetching stylists:", err)
	}

	var stylistList []models.Stylist
	if err = cursor.All(ctx, &stylistList); err != nil {
		log.Fatal("Error decoding stylists:", err)
	}
	cursor.Close(ctx)

	log.Printf("Found %d stylists", len(stylistList))

	// ===== CREATE TIME SLOTS =====
	log.Println("Creating time slots for next 7 days...")

	timeSlots := []string{
		"09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
		"12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
		"03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM",
	}

	slotCount := 0
	for i := 0; i < 7; i++ {
		date := time.Now().AddDate(0, 0, i+1).Format("2006-01-02")

		for _, stylist := range stylistList {
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
				if _, err := config.TimeSlotCollection.InsertOne(ctx, timeSlot); err == nil {
					slotCount++
				}
			}
		}
	}
	log.Printf("✅ Created %d time slots", slotCount)

	// ===== CREATE SAMPLE BOOKING =====
	log.Println("Creating sample booking...")

	if len(stylistList) > 0 {
		// Get first stylist
		firstStylist := stylistList[0]

		// Get available time slot
		var timeSlot models.TimeSlot
		err := config.TimeSlotCollection.FindOne(ctx, primitive.M{"isBooked": false}).Decode(&timeSlot)

		if err == nil {
			// Mark as booked
			config.TimeSlotCollection.UpdateOne(ctx,
				primitive.M{"_id": timeSlot.ID},
				primitive.M{"$set": primitive.M{"isBooked": true}})

			// Get first 2 services
			serviceCursor, _ := config.ServiceCollection.Find(ctx, primitive.M{})
			var serviceList []models.Service
			serviceCursor.All(ctx, &serviceList)
			serviceCursor.Close(ctx)

			var serviceItems []models.ServiceItem
			totalPrice := 0
			for i := 0; i < 2 && i < len(serviceList); i++ {
				serviceItems = append(serviceItems, models.ServiceItem{
					Name:     serviceList[i].Name,
					Price:    serviceList[i].Price,
					Category: serviceList[i].Category,
					Duration: serviceList[i].Duration,
				})
				totalPrice += serviceList[i].Price
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
				Notes:          "Sample booking",
				CreatedAt:      time.Now(),
				UpdatedAt:      time.Now(),
			}

			if _, err := config.BookingCollection.InsertOne(ctx, booking); err == nil {
				log.Println("✅ Created 1 sample booking")
			}
		}
	}

	log.Println("\n🎉 ===== SEEDING COMPLETED SUCCESSFULLY! ===== 🎉")
	log.Println("\n📊 Summary:")
	log.Println("   ✅ Stylists: 3")
	log.Println("   ✅ Services: 14")
	log.Printf("   ✅ Time Slots: %d", slotCount)
	log.Println("   ✅ Bookings: 1 sample")
	log.Println("\n🚀 Now run: go run main.go")
}
