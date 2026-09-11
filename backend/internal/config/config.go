package config

import (
	"log"
	"os"
	"strings"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	Port               string
	DatabaseURL        string
	RedisURL           string
	JWTSecret          string
	JWTAccessExpiry    time.Duration
	JWTRefreshExpiry   time.Duration
	GoogleClientID     string
	GoogleClientSecret string
	GoogleRedirectURL  string
	TwilioAccountSID   string
	TwilioAuthToken    string
	TwilioPhoneNumber  string
	AdminEmails        map[string]struct{}
	SMTPHost           string
	SMTPPort           string
	SMTPUser           string
	SMTPPass           string
	SMTPFrom           string
	AllowedOrigins     string
	AppEnv             string
}

func Load() *Config {
	_ = godotenv.Load()

	port := getEnv("PORT", "8080")
	dbURL := getEnv("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/beauty_emporium?sslmode=disable")
	redisURL := getEnv("REDIS_URL", "localhost:6379")
	allowedOrigins := getEnv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
	appEnv := getEnv("APP_ENV", "development")

	// JWT secret: a strong value is mandatory outside development. We keep a
	// clearly-named dev-only fallback so local `go run` stays frictionless,
	// but refuse to boot production with the default secret.
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		if appEnv == "production" {
			log.Fatal("JWT_SECRET must be set to a strong unique value in production")
		}
		jwtSecret = "dev-only-insecure-jwt-secret-do-not-use-in-prod"
	}

	// Comma-separated bootstrap admin emails (first-login elevation only;
	// subsequent role changes are managed in the database).
	adminEmails := map[string]struct{}{}
	for _, e := range strings.Split(getEnv("ADMIN_EMAILS", ""), ",") {
		e = strings.ToLower(strings.TrimSpace(e))
		if e != "" {
			adminEmails[e] = struct{}{}
		}
	}

	return &Config{
		Port:               port,
		DatabaseURL:        dbURL,
		RedisURL:           redisURL,
		JWTSecret:          jwtSecret,
		JWTAccessExpiry:    15 * time.Minute,
		JWTRefreshExpiry:   7 * 24 * time.Hour,
		GoogleClientID:     getEnv("GOOGLE_CLIENT_ID", ""),
		GoogleClientSecret: getEnv("GOOGLE_CLIENT_SECRET", ""),
		GoogleRedirectURL:  getEnv("GOOGLE_REDIRECT_URL", "http://localhost:8080/api/auth/google/callback"),
		TwilioAccountSID:   getEnv("TWILIO_ACCOUNT_SID", ""),
		TwilioAuthToken:    getEnv("TWILIO_AUTH_TOKEN", ""),
		TwilioPhoneNumber:  getEnv("TWILIO_PHONE_NUMBER", ""),
		SMTPHost:           getEnv("SMTP_HOST", ""),
		SMTPPort:           getEnv("SMTP_PORT", ""),
		SMTPUser:           getEnv("SMTP_USER", ""),
		SMTPPass:           getEnv("SMTP_PASS", ""),
		SMTPFrom:           getEnv("SMTP_FROM", "concierge@5thavenue.ie"),
		AllowedOrigins:     allowedOrigins,
		AppEnv:             appEnv,
		AdminEmails:        adminEmails,
	}
}

func getEnv(key, defaultVal string) string {
	if val, ok := os.LookupEnv(key); ok && val != "" {
		return val
	}
	return defaultVal
}
