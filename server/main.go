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
	api.HandleFunc("/contact", handlers.CreateContact).Methods("POST", "OPTIONS")
	api.HandleFunc("/contacts", handlers.GetAllContacts).Methods("GET", "OPTIONS")
	api.HandleFunc("/contact", handlers.GetContactByID).Methods("GET", "OPTIONS")
	api.HandleFunc("/contact", handlers.DeleteContact).Methods("DELETE", "OPTIONS")

	// Booking routes
	api.HandleFunc("/bookings", handlers.CreateBooking).Methods("POST", "OPTIONS")
	api.HandleFunc("/bookings", handlers.GetBooking).Methods("GET", "OPTIONS")
	api.HandleFunc("/bookings/email", handlers.GetBookingsByEmail).Methods("GET", "OPTIONS")
	api.HandleFunc("/bookings/status", handlers.UpdateBookingStatus).Methods("PUT", "OPTIONS")
	api.HandleFunc("/bookings/all", handlers.GetAllBookings).Methods("GET", "OPTIONS")

	// OTP Routes - IMPORTANT: Add these routes
	api.HandleFunc("/send-otp", handlers.SendOTP).Methods("POST", "OPTIONS")
	api.HandleFunc("/verify-otp", handlers.VerifyOTPAndConfirmBooking).Methods("POST", "OPTIONS")

	// Health check endpoint
	router.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"ok"}`))
	}).Methods("GET", "OPTIONS")

	// CORS configuration
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000", "http://192.168.56.1:3000"},
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

	fmt.Printf("🚀 Server is running on port %s\n", port)
	fmt.Printf("📋 Available routes:\n")
	fmt.Printf("   POST   /api/send-otp     - Send OTP to email\n")
	fmt.Printf("   POST   /api/verify-otp   - Verify OTP and confirm booking\n")
	fmt.Printf("   POST   /api/bookings     - Create booking\n")
	fmt.Printf("   GET    /api/bookings/all - Get all bookings\n")
	fmt.Printf("   GET    /health           - Health check\n")
	log.Fatal(http.ListenAndServe(":"+port, handler))
}
