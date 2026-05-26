package handlers

import (
	"crypto/rand"
	"encoding/json"
	"fmt"
	"log"
	"math/big"
	"net/http"
	"os"
	"time"

	"server/config"
	"server/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"gopkg.in/gomail.v2"
)

// generateOTP generates a 6-digit OTP
func generateOTP() string {
	max := big.NewInt(1000000)
	n, err := rand.Int(rand.Reader, max)
	if err != nil {
		return fmt.Sprintf("%06d", time.Now().UnixNano()%1000000)
	}
	return fmt.Sprintf("%06d", n.Int64())
}

// sendOTPEmail sends OTP to user's email using Gmail SMTP
func sendOTPEmail(email, otp string) error {
	from := os.Getenv("SMTP_EMAIL")
	password := os.Getenv("SMTP_PASSWORD")
	smtpHost := os.Getenv("SMTP_HOST")
	smtpPort := 587

	if from == "" || password == "" {
		log.Println("SMTP credentials not found in environment variables")
		return fmt.Errorf("SMTP configuration missing")
	}

	if smtpHost == "" {
		smtpHost = "smtp.gmail.com"
	}

	m := gomail.NewMessage()
	m.SetHeader("From", from)
	m.SetHeader("To", email)
	m.SetHeader("Subject", "Randu Salon - Your OTP for Appointment Booking")

	body := fmt.Sprintf(`
		<!DOCTYPE html>
		<html>
		<head>
			<style>
				body { font-family: Arial, sans-serif; line-height: 1.6; }
				.container { max-width: 600px; margin: 0 auto; padding: 20px; }
				.header { background: linear-gradient(135deg, #FFD700, #FFA500); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
				.header h1 { color: #1a1a1a; margin: 0; }
				.content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px; }
				.otp-code { font-size: 36px; font-weight: bold; color: #FFD700; letter-spacing: 5px; text-align: center; padding: 20px; background: #f5f5f5; border-radius: 10px; margin: 20px 0; }
				.footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
				.highlight { color: #FFA500; font-weight: bold; }
			</style>
		</head>
		<body>
			<div class="container">
				<div class="header">
					<h1>✨ Randu Salon ✨</h1>
				</div>
				<div class="content">
					<h2>Verify Your Appointment</h2>
					<p>Dear Valued Customer,</p>
					<p>Thank you for choosing Randu Salon. Please use the following OTP to verify your appointment booking:</p>
					<div class="otp-code">%s</div>
					<p>⏰ This OTP is valid for <span class="highlight">10 minutes</span>.</p>
					<p>If you didn't request this booking, please ignore this email.</p>
					<br>
					<p>Best regards,<br><strong>Randu Salon Team</strong></p>
				</div>
				<div class="footer">
					<p>&copy; 2024 Randu Salon. All rights reserved.</p>
				</div>
			</div>
		</body>
		</html>
	`, otp)

	m.SetBody("text/html", body)

	d := gomail.NewDialer(smtpHost, smtpPort, from, password)
	return d.DialAndSend(m)
}

// sendConfirmationEmail sends booking confirmation email
func sendConfirmationEmail(email string, booking models.Booking) {
	from := os.Getenv("SMTP_EMAIL")
	password := os.Getenv("SMTP_PASSWORD")
	smtpHost := os.Getenv("SMTP_HOST")
	smtpPort := 587

	if from == "" || password == "" {
		log.Printf("Cannot send confirmation email: SMTP credentials missing")
		return
	}

	if smtpHost == "" {
		smtpHost = "smtp.gmail.com"
	}

	m := gomail.NewMessage()
	m.SetHeader("From", from)
	m.SetHeader("To", email)
	m.SetHeader("Subject", "Randu Salon - Appointment Confirmed")

	body := fmt.Sprintf(`
		<!DOCTYPE html>
		<html>
		<head>
			<style>
				body { font-family: Arial, sans-serif; line-height: 1.6; }
				.container { max-width: 600px; margin: 0 auto; padding: 20px; }
				.header { background: linear-gradient(135deg, #FFD700, #FFA500); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
				.content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px; }
				.details { background: #f9f9f9; padding: 20px; border-radius: 10px; margin: 20px 0; }
				.detail-row { margin-bottom: 10px; }
				.highlight { color: #FFA500; font-weight: bold; }
				.footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
			</style>
		</head>
		<body>
			<div class="container">
				<div class="header">
					<h1>✨ Appointment Confirmed! ✨</h1>
				</div>
				<div class="content">
					<h2>Hello %s,</h2>
					<p>Your appointment at <strong>Randu Salon</strong> has been successfully confirmed!</p>
					
					<div class="details">
						<h3>Booking Details:</h3>
						<div class="detail-row">📅 <strong>Date:</strong> %s</div>
						<div class="detail-row">⏰ <strong>Time:</strong> %s</div>
						<div class="detail-row">💇 <strong>Services:</strong> %d service(s)</div>
						<div class="detail-row">👩 <strong>Stylist:</strong> %s</div>
					</div>
					
					<p>We look forward to providing you with an exceptional experience!</p>
					<br>
					<p>Need to make changes? Contact us at least 24 hours in advance.</p>
				</div>
				<div class="footer">
					<p>&copy; 2024 Randu Salon. All rights reserved.</p>
				</div>
			</div>
		</body>
		</html>
	`, booking.Name, booking.Date, booking.Time, len(booking.Services), booking.Stylist)

	m.SetBody("text/html", body)

	d := gomail.NewDialer(smtpHost, smtpPort, from, password)
	if err := d.DialAndSend(m); err != nil {
		log.Printf("Failed to send confirmation email to %s: %v", email, err)
	}
}

// SendOTP handles OTP sending request
// func SendOTP(w http.ResponseWriter, r *http.Request) {
// 	w.Header().Set("Content-Type", "application/json")

// 	var req models.OTPRequest
// 	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
// 		w.WriteHeader(http.StatusBadRequest)
// 		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request"})
// 		return
// 	}

// 	// Generate OTP
// 	otp := generateOTP()
// 	expiry := time.Now().Add(10 * time.Minute)

// 	// Get collection using GetBookingCollection
// 	collection := config.GetBookingCollection()

// 	// Find pending booking for this email
// 	filter := bson.M{"email": req.Email, "otpVerified": false}

// 	var existingBooking models.Booking
// 	err := collection.FindOne(r.Context(), filter).Decode(&existingBooking)

// 	if err == mongo.ErrNoDocuments {
// 		w.WriteHeader(http.StatusNotFound)
// 		json.NewEncoder(w).Encode(map[string]string{"error": "No pending booking found for this email. Please create a booking first."})
// 		return
// 	} else if err != nil {
// 		log.Printf("Error finding booking: %v", err)
// 		w.WriteHeader(http.StatusInternalServerError)
// 		json.NewEncoder(w).Encode(map[string]string{"error": "Database error"})
// 		return
// 	}

// 	// Update the booking with OTP
// 	update := bson.M{
// 		"$set": bson.M{
// 			"otp":       otp,
// 			"otpExpiry": expiry,
// 			"updatedAt": time.Now(),
// 		},
// 	}

// 	_, err = collection.UpdateOne(r.Context(), filter, update)
// 	if err != nil {
// 		log.Printf("Error updating OTP: %v", err)
// 		w.WriteHeader(http.StatusInternalServerError)
// 		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to save OTP"})
// 		return
// 	}

// 	// Send OTP email
// 	if err := sendOTPEmail(req.Email, otp); err != nil {
// 		log.Printf("Error sending OTP email to %s: %v", req.Email, err)
// 		w.WriteHeader(http.StatusInternalServerError)
// 		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to send OTP email. Please try again."})
// 		return
// 	}

//		log.Printf("OTP sent successfully to %s", req.Email)
//		json.NewEncoder(w).Encode(map[string]interface{}{
//			"success": true,
//			"message": "OTP sent successfully to " + req.Email,
//			"expiry":  expiry,
//		})
//	}
//
// SendOTP handles OTP sending request
func SendOTP(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req models.OTPRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request"})
		return
	}

	// Generate OTP
	otp := generateOTP()
	expiry := time.Now().Add(10 * time.Minute)

	// Get collection using GetBookingCollection
	collection := config.GetBookingCollection()

	// Find pending booking for this email
	filter := bson.M{"email": req.Email, "otpVerified": false}

	var existingBooking models.Booking
	err := collection.FindOne(r.Context(), filter).Decode(&existingBooking)

	if err == mongo.ErrNoDocuments {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "No pending booking found for this email. Please create a booking first."})
		return
	} else if err != nil {
		log.Printf("Error finding booking: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Database error"})
		return
	}

	// Update the booking with OTP
	update := bson.M{
		"$set": bson.M{
			"otp":       otp,
			"otpExpiry": expiry,
			"updatedAt": time.Now(),
		},
	}

	_, err = collection.UpdateOne(r.Context(), filter, update)
	if err != nil {
		log.Printf("Error updating OTP: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to save OTP"})
		return
	}

	// Send OTP email
	if err := sendOTPEmail(req.Email, otp); err != nil {
		log.Printf("Error sending OTP email to %s: %v", req.Email, err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to send OTP email. Please try again."})
		return
	}

	log.Printf("OTP sent successfully to %s - OTP: %s", req.Email, otp)

	// Return success with OTP for testing (remove in production)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "OTP sent successfully to " + req.Email,
		"expiry":  expiry,
		"otp":     otp, // Include OTP in response for testing only
	})
}

// VerifyOTPAndConfirmBooking handles OTP verification and booking confirmation
func VerifyOTPAndConfirmBooking(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req models.OTPVerifyRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request"})
		return
	}

	collection := config.GetBookingCollection()

	// Find booking with this email and OTP
	var booking models.Booking
	filter := bson.M{
		"email":       req.Email,
		"otp":         req.OTP,
		"otpVerified": false,
		"otpExpiry":   bson.M{"$gt": time.Now()},
	}

	err := collection.FindOne(r.Context(), filter).Decode(&booking)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"error": "Invalid or expired OTP"})
			return
		}
		log.Printf("Error finding booking: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to verify OTP"})
		return
	}

	// Update booking as verified and confirmed
	update := bson.M{
		"$set": bson.M{
			"otpVerified": true,
			"status":      "confirmed",
			"updatedAt":   time.Now(),
		},
	}

	result, err := collection.UpdateOne(r.Context(), filter, update)
	if err != nil {
		log.Printf("Error updating booking: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to confirm booking"})
		return
	}

	if result.MatchedCount == 0 {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "Booking not found"})
		return
	}

	// Send confirmation email (asynchronously to not block response)
	go sendConfirmationEmail(req.Email, booking)

	log.Printf("Booking confirmed for %s (%s)", booking.Name, req.Email)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Booking confirmed successfully! A confirmation email has been sent.",
		"booking": map[string]interface{}{
			"id":          booking.ID,
			"name":        booking.Name,
			"email":       booking.Email,
			"service":     booking.Service,
			"date":        booking.Date,
			"time":        booking.Time,
			"stylist":     booking.Stylist,
			"status":      "confirmed",
			"otpVerified": true,
		},
	})
}
