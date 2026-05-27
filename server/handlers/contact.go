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

func CreateContact(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var contact models.Contact
	if err := json.NewDecoder(r.Body).Decode(&contact); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
		return
	}

	if contact.Name == "" || contact.Email == "" || contact.Subject == "" || contact.Message == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "All fields are required"})
		return
	}

	contact.CreatedAt = time.Now()
	contact.UpdatedAt = time.Now()
	contact.ID = primitive.NewObjectID()

	_, err := config.ContactCollection.InsertOne(context.Background(), contact)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to save message"})
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Message sent successfully",
	})
}

func GetAllContacts(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	cursor, err := config.ContactCollection.Find(context.Background(), bson.M{})
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to fetch contacts"})
		return
	}
	defer cursor.Close(context.Background())

	var contacts []models.Contact
	if err = cursor.All(context.Background(), &contacts); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to decode contacts"})
		return
	}

	json.NewEncoder(w).Encode(contacts)
}

func GetContactByID(w http.ResponseWriter, r *http.Request) {
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

	var contact models.Contact
	err = config.ContactCollection.FindOne(context.Background(), bson.M{"_id": objectID}).Decode(&contact)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "Contact not found"})
		return
	}

	json.NewEncoder(w).Encode(contact)
}

func DeleteContact(w http.ResponseWriter, r *http.Request) {
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

	result, err := config.ContactCollection.DeleteOne(context.Background(), bson.M{"_id": objectID})
	if err != nil || result.DeletedCount == 0 {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "Contact not found"})
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Contact deleted successfully",
	})
}
