package handlers

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"server/config"
	"server/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func CreateBooking(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req struct {
		Name           string               `json:"name"`
		Email          string               `json:"email"`
		Phone          string               `json:"phone"`
		Services       []models.ServiceItem `json:"services"`
		Stylist        string               `json:"stylist"`
		StylistName    string               `json:"stylistName"`
		Date           string               `json:"date"`
		Time           string               `json:"time"`
		StartTime      string               `json:"startTime"`
		FinishingTime  string               `json:"finishingTime"`
		Notes          string               `json:"notes"`
		TotalPrice     int                  `json:"totalPrice"`
		AppointmentFee int                  `json:"appointmentFee"`
		ServicesTotal  int                  `json:"servicesTotal"`
		TotalDuration  int                  `json:"totalDuration"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("Error decoding request: %v", err)
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body: " + err.Error()})
		return
	}

	log.Printf("Received booking request: %+v", req)

	// Validate required fields
	if req.Name == "" || req.Email == "" || req.Phone == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Name, email and phone are required"})
		return
	}

	if len(req.Services) == 0 {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "At least one service is required"})
		return
	}

	if req.Date == "" || req.StartTime == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Date and time are required"})
		return
	}

	// Create booking object
	booking := models.Booking{
		ID:             primitive.NewObjectID(),
		Name:           req.Name,
		Email:          req.Email,
		Phone:          req.Phone,
		Services:       req.Services,
		StylistName:    req.StylistName,
		Date:           req.Date,
		StartTime:      req.StartTime,
		EndTime:        req.FinishingTime,
		TotalDuration:  req.TotalDuration,
		TotalPrice:     req.TotalPrice,
		AppointmentFee: req.AppointmentFee,
		ServicesTotal:  req.ServicesTotal,
		Status:         "pending",
		OTPVerified:    false,
		Notes:          req.Notes,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	// Insert booking
	result, err := config.BookingCollection.InsertOne(context.Background(), booking)
	if err != nil {
		log.Printf("Error inserting booking: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to create booking"})
		return
	}

	log.Printf("Booking created successfully with ID: %v", result.InsertedID)

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":   true,
		"message":   "Booking created successfully",
		"bookingId": result.InsertedID,
	})
}

func GetAllBookings(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := config.BookingCollection.Find(ctx, bson.M{})
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to fetch bookings"})
		return
	}
	defer cursor.Close(ctx)

	var bookings []models.Booking
	if err = cursor.All(ctx, &bookings); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to decode bookings"})
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":  true,
		"bookings": bookings,
	})
}

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

	update := bson.M{
		"$set": bson.M{
			"status":    req.Status,
			"updatedAt": time.Now(),
		},
	}

	result, err := config.BookingCollection.UpdateOne(context.Background(), bson.M{"_id": objectID}, update)
	if err != nil || result.MatchedCount == 0 {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "Booking not found"})
		return
	}

	// If cancelled, free up the time slot
	if req.Status == "cancelled" {
		var booking models.Booking
		config.BookingCollection.FindOne(context.Background(), bson.M{"_id": objectID}).Decode(&booking)

		config.TimeSlotCollection.UpdateOne(context.Background(),
			bson.M{"_id": booking.TimeSlotID},
			bson.M{"$set": bson.M{"isBooked": false, "bookingId": nil, "updatedAt": time.Now()}})
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Booking status updated successfully",
	})
}

// ========== ADD THIS MISSING FUNCTION ==========

// UpdateBooking - Complete booking update (for admin edit feature)
func UpdateBooking(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req struct {
		ID             string               `json:"id"`
		Name           string               `json:"name"`
		Email          string               `json:"email"`
		Phone          string               `json:"phone"`
		Services       []models.ServiceItem `json:"services"`
		StylistName    string               `json:"stylistName"`
		Date           string               `json:"date"`
		StartTime      string               `json:"startTime"`
		EndTime        string               `json:"endTime"`
		TotalPrice     int                  `json:"totalPrice"`
		AppointmentFee int                  `json:"appointmentFee"`
		ServicesTotal  int                  `json:"servicesTotal"`
		TotalDuration  int                  `json:"totalDuration"`
		Status         string               `json:"status"`
		Notes          string               `json:"notes"`
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

	// Update booking
	update := bson.M{
		"$set": bson.M{
			"name":           req.Name,
			"email":          req.Email,
			"phone":          req.Phone,
			"services":       req.Services,
			"stylistName":    req.StylistName,
			"date":           req.Date,
			"startTime":      req.StartTime,
			"endTime":        req.EndTime,
			"totalPrice":     req.TotalPrice,
			"appointmentFee": req.AppointmentFee,
			"servicesTotal":  req.ServicesTotal,
			"totalDuration":  req.TotalDuration,
			"status":         req.Status,
			"notes":          req.Notes,
			"updatedAt":      time.Now(),
		},
	}

	result, err := config.BookingCollection.UpdateOne(context.Background(), bson.M{"_id": objectID}, update)
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
		"message": "Booking updated successfully",
	})
}

// GetSingleBooking - Get booking by ID
func GetSingleBooking(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	id := r.URL.Query().Get("id")
	if id == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "ID is required"})
		return
	}

	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid ID format"})
		return
	}

	var booking models.Booking
	err = config.BookingCollection.FindOne(context.Background(), bson.M{"_id": objectID}).Decode(&booking)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "Booking not found"})
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"booking": booking,
	})
}
