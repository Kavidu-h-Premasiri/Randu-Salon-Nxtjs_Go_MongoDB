package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"server/config"
	"server/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// CreateBooking handles booking creation
func CreateBooking(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Only accept POST method
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Parse request body
	var bookingReq models.BookingRequest
	err := json.NewDecoder(r.Body).Decode(&bookingReq)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(models.BookingResponse{
			Success: false,
			Message: "Invalid request body: " + err.Error(),
		})
		return
	}

	// Calculate totals if not provided
	servicesTotal := bookingReq.ServicesTotal
	if servicesTotal == 0 {
		for _, service := range bookingReq.Services {
			servicesTotal += service.Price
		}
	}

	totalDuration := bookingReq.TotalDuration
	if totalDuration == 0 {
		for _, service := range bookingReq.Services {
			totalDuration += service.Duration
		}
	}

	// Create booking document
	booking := models.Booking{
		Services:       bookingReq.Services,
		Stylist:        bookingReq.Stylist,
		Date:           bookingReq.Date,
		Time:           bookingReq.Time,
		FinishingTime:  bookingReq.FinishingTime,
		Name:           bookingReq.Name,
		Email:          bookingReq.Email,
		Phone:          bookingReq.Phone,
		Notes:          bookingReq.Notes,
		TotalPrice:     bookingReq.TotalPrice,
		AppointmentFee: bookingReq.AppointmentFee,
		ServicesTotal:  servicesTotal,
		TotalDuration:  totalDuration,
		Status:         "confirmed",
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	// Get collection
	bookingCollection := config.GetBookingCollection()

	// Insert into database
	result, err := bookingCollection.InsertOne(context.Background(), booking)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(models.BookingResponse{
			Success: false,
			Message: "Failed to save booking: " + err.Error(),
		})
		return
	}

	// Get the inserted ID
	bookingID := result.InsertedID.(primitive.ObjectID).Hex()

	// Send success response
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(models.BookingResponse{
		Success:   true,
		Message:   "Booking created successfully!",
		BookingID: bookingID,
	})
}

// GetBooking retrieves a booking by ID
func GetBooking(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Get ID from query parameters
	id := r.URL.Query().Get("id")
	if id == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"message": "Booking ID is required",
		})
		return
	}

	// Convert string ID to ObjectID
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"message": "Invalid booking ID",
		})
		return
	}

	// Get collection
	bookingCollection := config.GetBookingCollection()

	// Find booking
	var booking models.Booking
	err = bookingCollection.FindOne(context.Background(), bson.M{"_id": objID}).Decode(&booking)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"message": "Booking not found",
		})
		return
	}

	// Send response
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"booking": booking,
	})
}

// GetBookingsByEmail retrieves all bookings for a specific email
func GetBookingsByEmail(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	email := r.URL.Query().Get("email")
	if email == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"message": "Email is required",
		})
		return
	}

	bookingCollection := config.GetBookingCollection()

	// Find all bookings for this email
	cursor, err := bookingCollection.Find(context.Background(), bson.M{"email": email})
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"message": "Failed to fetch bookings",
		})
		return
	}
	defer cursor.Close(context.Background())

	var bookings []models.Booking
	if err = cursor.All(context.Background(), &bookings); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"message": "Failed to decode bookings",
		})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":  true,
		"bookings": bookings,
	})
}

// UpdateBookingStatus updates the status of a booking
func UpdateBookingStatus(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodPut {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var updateData struct {
		ID     string `json:"id"`
		Status string `json:"status"`
	}

	err := json.NewDecoder(r.Body).Decode(&updateData)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"message": "Invalid request body",
		})
		return
	}

	objID, err := primitive.ObjectIDFromHex(updateData.ID)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"message": "Invalid booking ID",
		})
		return
	}

	bookingCollection := config.GetBookingCollection()

	result, err := bookingCollection.UpdateOne(
		context.Background(),
		bson.M{"_id": objID},
		bson.M{
			"$set": bson.M{
				"status":    updateData.Status,
				"updatedAt": time.Now(),
			},
		},
	)

	if err != nil || result.MatchedCount == 0 {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"message": "Booking not found or update failed",
		})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Booking status updated successfully",
	})
}

// GetAllBookings retrieves all bookings
func GetAllBookings(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	bookingCollection := config.GetBookingCollection()

	// Find all bookings
	cursor, err := bookingCollection.Find(context.Background(), bson.M{})
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"message": "Failed to fetch bookings",
		})
		return
	}
	defer cursor.Close(context.Background())

	var bookings []models.Booking
	if err = cursor.All(context.Background(), &bookings); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"message": "Failed to decode bookings",
		})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":  true,
		"bookings": bookings,
	})
}
