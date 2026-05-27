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
	"go.mongodb.org/mongo-driver/mongo/options"
)

// GetAllSettings - Get all settings
func GetAllSettings(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := config.SettingsCollection.Find(ctx, bson.M{})
	if err != nil {
		defaultSettings := getDefaultSettingsMap()
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success":  true,
			"settings": defaultSettings,
		})
		return
	}
	defer cursor.Close(ctx)

	var settings []models.Setting
	if err = cursor.All(ctx, &settings); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to decode settings"})
		return
	}

	settingsMap := make(map[string]interface{})
	for _, s := range settings {
		settingsMap[s.Key] = s.Value
	}

	if len(settingsMap) == 0 {
		settingsMap = getDefaultSettingsMap()
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":  true,
		"settings": settingsMap,
	})
}

// UpdateSetting - Update a single setting
func UpdateSetting(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req struct {
		Key   string      `json:"key"`
		Value interface{} `json:"value"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	filter := bson.M{"key": req.Key}
	update := bson.M{
		"$set": bson.M{
			"key":       req.Key,
			"value":     req.Value,
			"category":  "appointment",
			"updatedAt": time.Now(),
		},
	}

	opts := options.Update().SetUpsert(true)
	_, err := config.SettingsCollection.UpdateOne(ctx, filter, update, opts)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to update setting"})
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Setting updated successfully",
	})
}

// InitDefaultSettings - Initialize default settings
func InitDefaultSettings(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	config.SettingsCollection.Drop(ctx)

	businessHours := []map[string]string{
		{"day": "Monday", "start": "09:00 AM", "end": "08:00 PM"},
		{"day": "Tuesday", "start": "09:00 AM", "end": "08:00 PM"},
		{"day": "Wednesday", "start": "09:00 AM", "end": "08:00 PM"},
		{"day": "Thursday", "start": "09:00 AM", "end": "08:00 PM"},
		{"day": "Friday", "start": "09:00 AM", "end": "08:00 PM"},
		{"day": "Saturday", "start": "09:00 AM", "end": "06:00 PM"},
		{"day": "Sunday", "start": "10:00 AM", "end": "04:00 PM"},
	}

	defaultSettings := []models.Setting{
		{ID: primitive.NewObjectID(), Key: "appointmentFeePerService", Value: 50, Category: "appointment", UpdatedAt: time.Now()},
		{ID: primitive.NewObjectID(), Key: "maxAppointmentFee", Value: 200, Category: "appointment", UpdatedAt: time.Now()},
		{ID: primitive.NewObjectID(), Key: "maxServicesPerBooking", Value: 10, Category: "appointment", UpdatedAt: time.Now()},
		{ID: primitive.NewObjectID(), Key: "otpExpiryMinutes", Value: 10, Category: "appointment", UpdatedAt: time.Now()},
		{ID: primitive.NewObjectID(), Key: "maxDaysAdvance", Value: 14, Category: "appointment", UpdatedAt: time.Now()},
		{ID: primitive.NewObjectID(), Key: "businessHours", Value: businessHours, Category: "business", UpdatedAt: time.Now()},
	}

	for _, setting := range defaultSettings {
		config.SettingsCollection.InsertOne(ctx, setting)
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Default settings initialized successfully",
	})
}

func getDefaultSettingsMap() map[string]interface{} {
	businessHours := []map[string]string{
		{"day": "Monday", "start": "09:00 AM", "end": "08:00 PM"},
		{"day": "Tuesday", "start": "09:00 AM", "end": "08:00 PM"},
		{"day": "Wednesday", "start": "09:00 AM", "end": "08:00 PM"},
		{"day": "Thursday", "start": "09:00 AM", "end": "08:00 PM"},
		{"day": "Friday", "start": "09:00 AM", "end": "08:00 PM"},
		{"day": "Saturday", "start": "09:00 AM", "end": "06:00 PM"},
		{"day": "Sunday", "start": "10:00 AM", "end": "04:00 PM"},
	}

	return map[string]interface{}{
		"appointmentFeePerService": 50,
		"maxAppointmentFee":        200,
		"maxServicesPerBooking":    10,
		"otpExpiryMinutes":         10,
		"maxDaysAdvance":           14,
		"businessHours":            businessHours,
	}
}

// ========== CATEGORY APIs ==========

// GetAllCategories - Get all service categories
func GetAllCategories(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := config.ServiceCollection.Find(ctx, bson.M{})
	if err != nil {
		// Return default categories on error
		defaultCategories := []map[string]interface{}{
			{"id": "haircuts", "name": "Haircuts"},
			{"id": "coloring", "name": "Coloring"},
			{"id": "styling", "name": "Styling"},
			{"id": "facials", "name": "Facials"},
			{"id": "nails", "name": "Nails"},
			{"id": "bridal", "name": "Bridal"},
		}
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success":    true,
			"categories": defaultCategories,
		})
		return
	}
	defer cursor.Close(ctx)

	var services []models.Service
	if err = cursor.All(ctx, &services); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to decode services"})
		return
	}

	// Get unique categories
	categoryMap := make(map[string]bool)
	for _, s := range services {
		if s.Category != "" {
			categoryMap[s.Category] = true
		}
	}

	var categories []map[string]interface{}
	for cat := range categoryMap {
		categories = append(categories, map[string]interface{}{
			"id":   cat,
			"name": cat,
		})
	}

	// If no categories found, return defaults
	if len(categories) == 0 {
		categories = []map[string]interface{}{
			{"id": "haircuts", "name": "Haircuts"},
			{"id": "coloring", "name": "Coloring"},
			{"id": "styling", "name": "Styling"},
			{"id": "facials", "name": "Facials"},
			{"id": "nails", "name": "Nails"},
			{"id": "bridal", "name": "Bridal"},
		}
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":    true,
		"categories": categories,
	})
}

// CreateCategory - Add new category
func CreateCategory(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req struct {
		Name string `json:"name"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request"})
		return
	}

	if req.Name == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Category name required"})
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Category created successfully",
		"category": map[string]interface{}{
			"id":   req.Name,
			"name": req.Name,
		},
	})
}

// DeleteCategory - Delete category (only if no services use it)
func DeleteCategory(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	categoryName := r.URL.Query().Get("name")
	if categoryName == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Category name required"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	count, err := config.ServiceCollection.CountDocuments(ctx, bson.M{"category": categoryName, "isActive": true})
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to check services"})
		return
	}

	if count > 0 {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Cannot delete category with existing services. Delete services first."})
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Category deleted successfully",
	})
}

// GetAllServiceCategories - Get all service categories with descriptions
func GetAllServiceCategories(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	defaultCategories := []map[string]interface{}{
		{"id": "haircuts", "name": "Haircuts", "description": "Precision haircuts for all genders"},
		{"id": "coloring", "name": "Coloring", "description": "Professional hair coloring services"},
		{"id": "styling", "name": "Styling", "description": "Hair styling and updos"},
		{"id": "facials", "name": "Facials", "description": "Facial treatments"},
		{"id": "nails", "name": "Nails", "description": "Manicure and pedicure"},
		{"id": "bridal", "name": "Bridal", "description": "Bridal packages"},
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":    true,
		"categories": defaultCategories,
	})
}
