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

// CreateContact handles POST requests to save contact messages
func CreateContact(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var contact models.Contact

	// Decode JSON request body
	if err := json.NewDecoder(r.Body).Decode(&contact); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(models.ContactResponse{
			Success: false,
			Message: "Invalid request body",
		})
		return
	}

	// Validate required fields
	if contact.Name == "" || contact.Email == "" || contact.Subject == "" || contact.Message == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(models.ContactResponse{
			Success: false,
			Message: "Name, email, subject, and message are required",
		})
		return
	}

	// Set timestamps
	contact.CreatedAt = time.Now()
	contact.UpdatedAt = time.Now()
	contact.ID = primitive.NewObjectID()

	// Insert into MongoDB
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	result, err := config.ContactCollection.InsertOne(ctx, contact)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(models.ContactResponse{
			Success: false,
			Message: "Failed to save contact message",
		})
		return
	}

	contact.ID = result.InsertedID.(primitive.ObjectID)

	// Return success response
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(models.ContactResponse{
		Success: true,
		Message: "Message sent successfully!",
		Data:    &contact,
	})
}

// GetAllContacts handles GET requests to fetch all contacts (admin only)
func GetAllContacts(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	cursor, err := config.ContactCollection.Find(ctx, bson.M{})
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(models.ContactResponse{
			Success: false,
			Message: "Failed to fetch contacts",
		})
		return
	}
	defer cursor.Close(ctx)

	var contacts []models.Contact
	if err = cursor.All(ctx, &contacts); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(models.ContactResponse{
			Success: false,
			Message: "Failed to decode contacts",
		})
		return
	}

	json.NewEncoder(w).Encode(contacts)
}

// GetContactByID handles GET requests to fetch a single contact by ID
func GetContactByID(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Get ID from URL params
	vars := r.URL.Query()
	id := vars.Get("id")

	if id == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(models.ContactResponse{
			Success: false,
			Message: "ID is required",
		})
		return
	}

	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(models.ContactResponse{
			Success: false,
			Message: "Invalid ID format",
		})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var contact models.Contact
	err = config.ContactCollection.FindOne(ctx, bson.M{"_id": objectID}).Decode(&contact)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(models.ContactResponse{
			Success: false,
			Message: "Contact not found",
		})
		return
	}

	json.NewEncoder(w).Encode(contact)
}

// DeleteContact handles DELETE requests to remove a contact (admin only)
func DeleteContact(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	vars := r.URL.Query()
	id := vars.Get("id")

	if id == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(models.ContactResponse{
			Success: false,
			Message: "ID is required",
		})
		return
	}

	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(models.ContactResponse{
			Success: false,
			Message: "Invalid ID format",
		})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	result, err := config.ContactCollection.DeleteOne(ctx, bson.M{"_id": objectID})
	if err != nil || result.DeletedCount == 0 {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(models.ContactResponse{
			Success: false,
			Message: "Contact not found",
		})
		return
	}

	json.NewEncoder(w).Encode(models.ContactResponse{
		Success: true,
		Message: "Contact deleted successfully",
	})
}
