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

func GetAvailableTimeSlots(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	stylistID := r.URL.Query().Get("stylistId")
	date := r.URL.Query().Get("date")

	if stylistID == "" || date == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "stylistId and date are required"})
		return
	}

	objectID, err := primitive.ObjectIDFromHex(stylistID)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid stylist ID"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	filter := bson.M{
		"stylistId": objectID,
		"date":      date,
		"isBooked":  false,
	}

	cursor, err := config.TimeSlotCollection.Find(ctx, filter)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to fetch time slots"})
		return
	}
	defer cursor.Close(ctx)

	var timeSlots []models.TimeSlot
	if err = cursor.All(ctx, &timeSlots); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to decode time slots"})
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":   true,
		"timeSlots": timeSlots,
	})
}

func GenerateTimeSlotsForStylist(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req struct {
		StylistID string   `json:"stylistId"`
		Date      string   `json:"date"`
		TimeSlots []string `json:"timeSlots"` // ["09:00 AM", "09:30 AM", ...]
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
		return
	}

	stylistObjectID, err := primitive.ObjectIDFromHex(req.StylistID)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid stylist ID"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var insertedIDs []interface{}
	for _, slotTime := range req.TimeSlots {
		// Calculate end time (30 min later)
		// Simple implementation - you can make this dynamic
		endTime := slotTime // You can calculate properly

		timeSlot := models.TimeSlot{
			ID:        primitive.NewObjectID(),
			StylistID: stylistObjectID,
			Date:      req.Date,
			StartTime: slotTime,
			EndTime:   endTime,
			IsBooked:  false,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}

		// Check if slot already exists
		existingFilter := bson.M{
			"stylistId": stylistObjectID,
			"date":      req.Date,
			"startTime": slotTime,
		}
		count, _ := config.TimeSlotCollection.CountDocuments(ctx, existingFilter)
		if count == 0 {
			result, err := config.TimeSlotCollection.InsertOne(ctx, timeSlot)
			if err == nil {
				insertedIDs = append(insertedIDs, result.InsertedID)
			}
		}
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Time slots generated successfully",
		"count":   len(insertedIDs),
	})
}
