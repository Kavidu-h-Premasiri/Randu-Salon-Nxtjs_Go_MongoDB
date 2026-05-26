package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"server/config"
	"server/models"

	"github.com/go-playground/validator/v10"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

var validateBooking = validator.New()

// CreateBooking creates a new booking
func CreateBooking(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req models.BookingRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
		return
	}

	// Create booking object
	booking := models.Booking{
		ID:             primitive.NewObjectID(),
		Name:           req.Name,
		Email:          req.Email,
		Phone:          req.Phone,
		Services:       req.Services,
		Stylist:        req.Stylist,
		Date:           req.Date,
		Time:           req.Time,
		FinishingTime:  req.FinishingTime,
		Notes:          req.Notes,
		Status:         "pending",
		OTPVerified:    false,
		TotalPrice:     req.TotalPrice,
		AppointmentFee: req.AppointmentFee,
		ServicesTotal:  req.ServicesTotal,
		TotalDuration:  req.TotalDuration,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	// Validate booking
	if err := validateBooking.Struct(booking); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	collection := config.GetCollection("bookings")

	// Check for existing pending booking
	filter := bson.M{
		"email":  booking.Email,
		"date":   booking.Date,
		"time":   booking.Time,
		"status": "pending",
	}

	var existingBooking models.Booking
	err := collection.FindOne(r.Context(), filter).Decode(&existingBooking)
	if err == nil {
		w.WriteHeader(http.StatusConflict)
		json.NewEncoder(w).Encode(map[string]string{"error": "A pending booking already exists for this time slot"})
		return
	}

	// Insert booking
	result, err := collection.InsertOne(r.Context(), booking)
	if err != nil {
		log.Printf("Error creating booking: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to create booking"})
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":   true,
		"message":   "Booking created successfully. Please verify your email to confirm.",
		"bookingId": result.InsertedID,
	})
}

// GetBookingsByEmail retrieves bookings by email
func GetBookingsByEmail(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	email := r.URL.Query().Get("email")
	if email == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Email parameter is required"})
		return
	}

	collection := config.GetCollection("bookings")
	filter := bson.M{"email": email}

	cursor, err := collection.Find(r.Context(), filter)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to fetch bookings"})
		return
	}
	defer cursor.Close(r.Context())

	var bookings []models.Booking
	if err = cursor.All(r.Context(), &bookings); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to decode bookings"})
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":  true,
		"bookings": bookings,
	})
}

// GetBooking retrieves a single booking by ID
func GetBooking(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	id := r.URL.Query().Get("id")
	if id == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "ID parameter is required"})
		return
	}

	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid ID format"})
		return
	}

	collection := config.GetCollection("bookings")
	filter := bson.M{"_id": objectID}

	var booking models.Booking
	err = collection.FindOne(r.Context(), filter).Decode(&booking)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			w.WriteHeader(http.StatusNotFound)
			json.NewEncoder(w).Encode(map[string]string{"error": "Booking not found"})
			return
		}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to fetch booking"})
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"booking": booking,
	})
}

// UpdateBookingStatus updates booking status
func UpdateBookingStatus(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req struct {
		ID     string `json:"id"`
		Status string `json:"status"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
		return
	}

	objectID, err := primitive.ObjectIDFromHex(req.ID)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid ID format"})
		return
	}

	collection := config.GetCollection("bookings")
	filter := bson.M{"_id": objectID}
	update := bson.M{
		"$set": bson.M{
			"status":    req.Status,
			"updatedAt": time.Now(),
		},
	}

	result, err := collection.UpdateOne(r.Context(), filter, update)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to update booking"})
		return
	}

	if result.MatchedCount == 0 {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "Booking not found"})
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Booking status updated successfully",
	})
}

// GetAllBookings retrieves all bookings
func GetAllBookings(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	collection := config.GetCollection("bookings")
	filter := bson.M{}

	cursor, err := collection.Find(r.Context(), filter)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to fetch bookings"})
		return
	}
	defer cursor.Close(r.Context())

	var bookings []models.Booking
	if err = cursor.All(r.Context(), &bookings); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to decode bookings"})
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":  true,
		"bookings": bookings,
	})
}
