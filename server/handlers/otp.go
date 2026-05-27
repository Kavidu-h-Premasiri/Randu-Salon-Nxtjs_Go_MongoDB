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

func generateOTP() string {
	max := big.NewInt(1000000)
	n, err := rand.Int(rand.Reader, max)
	if err != nil {
		return fmt.Sprintf("%06d", time.Now().UnixNano()%1000000)
	}
	return fmt.Sprintf("%06d", n.Int64())
}

func sendOTPEmail(email, otp string) error {
	from := os.Getenv("SMTP_EMAIL")
	password := os.Getenv("SMTP_PASSWORD")
	smtpHost := os.Getenv("SMTP_HOST")
	smtpPort := 587

	if from == "" || password == "" {
		log.Println("SMTP credentials not found")
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
				body { font-family: Arial, sans-serif; }
				.container { max-width: 600px; margin: 0 auto; padding: 20px; }
				.header { background: linear-gradient(135deg, #FFD700, #FFA500); padding: 30px; text-align: center; }
				.otp-code { font-size: 36px; font-weight: bold; color: #FFD700; text-align: center; padding: 20px; background: #f5f5f5; border-radius: 10px; margin: 20px 0; }
			</style>
		</head>
		<body>
			<div class="container">
				<div class="header">
					<h1>✨ Randu Salon ✨</h1>
				</div>
				<div class="content">
					<h2>Verify Your Appointment</h2>
					<p>Please use the following OTP to verify your appointment:</p>
					<div class="otp-code">%s</div>
					<p>This OTP is valid for 10 minutes.</p>
					<p>Best regards,<br><strong>Randu Salon Team</strong></p>
				</div>
			</div>
		</body>
		</html>
	`, otp)

	m.SetBody("text/html", body)

	d := gomail.NewDialer(smtpHost, smtpPort, from, password)
	return d.DialAndSend(m)
}

func sendConfirmationEmail(email, name, date, startTime, stylistName string, serviceCount int) {
	from := os.Getenv("SMTP_EMAIL")
	password := os.Getenv("SMTP_PASSWORD")
	smtpHost := os.Getenv("SMTP_HOST")

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
				body { font-family: Arial, sans-serif; }
				.container { max-width: 600px; margin: 0 auto; padding: 20px; }
				.header { background: linear-gradient(135deg, #FFD700, #FFA500); padding: 30px; text-align: center; }
				.details { background: #f9f9f9; padding: 20px; border-radius: 10px; margin: 20px 0; }
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
						<p>📅 Date: %s</p>
						<p>⏰ Time: %s</p>
						<p>💇 Stylist: %s</p>
						<p>📋 Services: %d service(s)</p>
					</div>
					<p>We look forward to seeing you!</p>
				</div>
			</div>
		</body>
		</html>
	`, name, date, startTime, stylistName, serviceCount)

	m.SetBody("text/html", body)

	d := gomail.NewDialer(smtpHost, 587, from, password)
	if err := d.DialAndSend(m); err != nil {
		log.Printf("Failed to send confirmation email: %v", err)
	}
}

func SendOTP(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req models.OTPRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request"})
		return
	}

	otp := generateOTP()
	expiry := time.Now().Add(10 * time.Minute)

	collection := config.GetBookingCollection()
	filter := bson.M{"email": req.Email, "otpVerified": false}

	var existingBooking models.Booking
	err := collection.FindOne(r.Context(), filter).Decode(&existingBooking)

	if err == mongo.ErrNoDocuments {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "No pending booking found"})
		return
	} else if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Database error"})
		return
	}

	update := bson.M{
		"$set": bson.M{
			"otp":       otp,
			"otpExpiry": expiry,
			"updatedAt": time.Now(),
		},
	}

	_, err = collection.UpdateOne(r.Context(), filter, update)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to save OTP"})
		return
	}

	if err := sendOTPEmail(req.Email, otp); err != nil {
		log.Printf("Error sending OTP email: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to send OTP email"})
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "OTP sent successfully",
		"expiry":  expiry,
	})
}

func VerifyOTPAndConfirmBooking(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req models.OTPVerifyRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request"})
		return
	}

	collection := config.GetBookingCollection()

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
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to verify OTP"})
		return
	}

	update := bson.M{
		"$set": bson.M{
			"otpVerified": true,
			"status":      "confirmed",
			"updatedAt":   time.Now(),
		},
	}

	_, err = collection.UpdateOne(r.Context(), filter, update)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to confirm booking"})
		return
	}

	// Send confirmation email
	go sendConfirmationEmail(booking.Email, booking.Name, booking.Date, booking.StartTime, booking.StylistName, len(booking.Services))

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Booking confirmed successfully!",
		"booking": map[string]interface{}{
			"id":      booking.ID,
			"name":    booking.Name,
			"email":   booking.Email,
			"date":    booking.Date,
			"time":    booking.StartTime,
			"stylist": booking.StylistName,
			"status":  "confirmed",
		},
	})
}
