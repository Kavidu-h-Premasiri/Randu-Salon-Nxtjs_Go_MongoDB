package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"server/config"
	"server/handlers"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	"github.com/rs/cors"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	// Connect to MongoDB
	if err := config.ConnectDB(); err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer config.DisconnectDB()

	// Initialize router
	router := mux.NewRouter()

	// API routes
	api := router.PathPrefix("/api").Subrouter()

	// Contact routes
	api.HandleFunc("/contact", handlers.CreateContact).Methods("POST")
	api.HandleFunc("/contacts", handlers.GetAllContacts).Methods("GET")
	api.HandleFunc("/contact", handlers.GetContactByID).Methods("GET")
	api.HandleFunc("/contact", handlers.DeleteContact).Methods("DELETE")

	// Health check endpoint
	router.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"ok"}`))
	}).Methods("GET")

	// CORS configuration
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"}, // Add your frontend URL
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	})

	// Apply CORS middleware
	handler := c.Handler(router)

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("Server is running on port %s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, handler))
}
