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
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	if err := config.ConnectDB(); err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer config.DisconnectDB()

	router := mux.NewRouter()
	api := router.PathPrefix("/api").Subrouter()

	// Service routes
	api.HandleFunc("/services", handlers.GetAllServices).Methods("GET", "OPTIONS")
	api.HandleFunc("/services", handlers.CreateService).Methods("POST", "OPTIONS")
	api.HandleFunc("/services/update", handlers.UpdateService).Methods("PUT", "OPTIONS")
	api.HandleFunc("/services/delete", handlers.DeleteService).Methods("DELETE", "OPTIONS")

	// Stylist routes
	api.HandleFunc("/stylists", handlers.GetAllStylists).Methods("GET", "OPTIONS")
	api.HandleFunc("/stylists", handlers.CreateStylist).Methods("POST", "OPTIONS")
	api.HandleFunc("/stylists/update", handlers.UpdateStylist).Methods("PUT", "OPTIONS")
	api.HandleFunc("/stylists/delete", handlers.DeleteStylist).Methods("DELETE", "OPTIONS")

	// Time slot routes
	api.HandleFunc("/timeslots", handlers.GetAvailableTimeSlots).Methods("GET", "OPTIONS")
	api.HandleFunc("/timeslots/generate", handlers.GenerateTimeSlotsForStylist).Methods("POST", "OPTIONS")

	// Booking routes
	api.HandleFunc("/bookings", handlers.CreateBooking).Methods("POST", "OPTIONS")
	api.HandleFunc("/bookings/all", handlers.GetAllBookings).Methods("GET", "OPTIONS")
	api.HandleFunc("/bookings/status", handlers.UpdateBookingStatus).Methods("PUT", "OPTIONS")
	api.HandleFunc("/booking/update", handlers.UpdateBooking).Methods("PUT", "OPTIONS")
	api.HandleFunc("/booking", handlers.GetSingleBooking).Methods("GET", "OPTIONS")

	// OTP routes
	api.HandleFunc("/send-otp", handlers.SendOTP).Methods("POST", "OPTIONS")
	api.HandleFunc("/verify-otp", handlers.VerifyOTPAndConfirmBooking).Methods("POST", "OPTIONS")

	// Settings routes
	api.HandleFunc("/settings", handlers.GetAllSettings).Methods("GET", "OPTIONS")
	api.HandleFunc("/settings/update", handlers.UpdateSetting).Methods("PUT", "OPTIONS")
	api.HandleFunc("/settings/init", handlers.InitDefaultSettings).Methods("POST", "OPTIONS")

	// Service Categories routes
	api.HandleFunc("/services/categories", handlers.GetAllServiceCategories).Methods("GET", "OPTIONS")

	// Category routes
	api.HandleFunc("/categories", handlers.GetAllCategories).Methods("GET", "OPTIONS")
	api.HandleFunc("/categories", handlers.CreateCategory).Methods("POST", "OPTIONS")
	api.HandleFunc("/categories/delete", handlers.DeleteCategory).Methods("DELETE", "OPTIONS")

	// Health check
	router.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"ok"}`))
	}).Methods("GET")

	// CORS configuration
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000", "http://192.168.56.1:3000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	})

	handler := c.Handler(router)
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("🚀 Server is running on port %s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, handler))
}
