package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"server/config"
	"server/models"

	"github.com/go-playground/validator/v10"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

var validate = validator.New()

// ========== STYLIST HANDLERS ==========

func GetAllStylists(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := config.StylistCollection.Find(ctx, bson.M{"isActive": true})
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to fetch stylists"})
		return
	}
	defer cursor.Close(ctx)

	var stylists []models.Stylist
	if err = cursor.All(ctx, &stylists); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to decode stylists"})
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":  true,
		"stylists": stylists,
	})
}

func CreateStylist(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var stylist models.Stylist

	if err := json.NewDecoder(r.Body).Decode(&stylist); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
		return
	}

	stylist.ID = primitive.NewObjectID()
	stylist.CreatedAt = time.Now()
	stylist.UpdatedAt = time.Now()
	stylist.IsActive = true

	result, err := config.StylistCollection.InsertOne(context.Background(), stylist)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to create stylist"})
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"id":      result.InsertedID,
		"message": "Stylist created successfully",
	})
}

func UpdateStylist(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var stylist models.Stylist
	if err := json.NewDecoder(r.Body).Decode(&stylist); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request"})
		return
	}

	update := bson.M{
		"$set": bson.M{
			"name":        stylist.Name,
			"email":       stylist.Email,
			"phone":       stylist.Phone,
			"specialties": stylist.Specialties,
			"bio":         stylist.Bio,
			"updatedAt":   time.Now(),
		},
	}

	result, err := config.StylistCollection.UpdateOne(context.Background(), bson.M{"_id": stylist.ID}, update)
	if err != nil || result.MatchedCount == 0 {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "Stylist not found"})
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Stylist updated successfully",
	})
}

func DeleteStylist(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	id := r.URL.Query().Get("id")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid ID"})
		return
	}

	result, err := config.StylistCollection.UpdateOne(context.Background(),
		bson.M{"_id": objectID},
		bson.M{"$set": bson.M{"isActive": false, "updatedAt": time.Now()}})

	if err != nil || result.MatchedCount == 0 {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "Stylist not found"})
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Stylist deleted successfully",
	})
}

// ========== SERVICE HANDLERS ==========

func GetAllServices(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := config.ServiceCollection.Find(ctx, bson.M{"isActive": true})
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to fetch services"})
		return
	}
	defer cursor.Close(ctx)

	var services []models.Service
	if err = cursor.All(ctx, &services); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to decode services"})
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":  true,
		"services": services,
	})
}

func CreateService(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var service models.Service

	if err := json.NewDecoder(r.Body).Decode(&service); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
		return
	}

	service.ID = primitive.NewObjectID()
	service.CreatedAt = time.Now()
	service.UpdatedAt = time.Now()
	service.IsActive = true

	result, err := config.ServiceCollection.InsertOne(context.Background(), service)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to create service"})
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"id":      result.InsertedID,
		"message": "Service created successfully",
	})
}

func UpdateService(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var service models.Service
	if err := json.NewDecoder(r.Body).Decode(&service); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request"})
		return
	}

	update := bson.M{
		"$set": bson.M{
			"name":        service.Name,
			"category":    service.Category,
			"price":       service.Price,
			"duration":    service.Duration,
			"description": service.Description,
			"updatedAt":   time.Now(),
		},
	}

	result, err := config.ServiceCollection.UpdateOne(context.Background(), bson.M{"_id": service.ID}, update)
	if err != nil || result.MatchedCount == 0 {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "Service not found"})
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Service updated successfully",
	})
}

func DeleteService(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	id := r.URL.Query().Get("id")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid ID"})
		return
	}

	result, err := config.ServiceCollection.UpdateOne(context.Background(),
		bson.M{"_id": objectID},
		bson.M{"$set": bson.M{"isActive": false, "updatedAt": time.Now()}})

	if err != nil || result.MatchedCount == 0 {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "Service not found"})
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Service deleted successfully",
	})
}
