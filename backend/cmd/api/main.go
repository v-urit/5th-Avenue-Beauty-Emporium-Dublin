package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/v-urit/5th/internal/config"
	"github.com/v-urit/5th/internal/handler"
	"github.com/v-urit/5th/internal/middleware"
	"github.com/v-urit/5th/internal/repository"
	"github.com/v-urit/5th/internal/service"
)

func main() {
	cfg := config.Load()

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	log.Printf("Starting 5th Avenue Beauty Emporium Backend on port %s...", cfg.Port)

	// Setup PostgreSQL connection pool
	poolConfig, err := pgxpool.ParseConfig(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Unable to parse database URL: %v", err)
	}
	poolConfig.MaxConns = 25
	poolConfig.MinConns = 5
	poolConfig.MaxConnLifetime = 1 * time.Hour

	var pool *pgxpool.Pool
	pool, err = pgxpool.NewWithConfig(ctx, poolConfig)
	if err != nil {
		log.Printf("Warning: Database connection failed at startup: %v (retrying or running in degraded mode)", err)
	} else if err := pool.Ping(ctx); err != nil {
		log.Printf("Warning: Database ping failed: %v", err)
	} else {
		log.Println("Successfully connected to PostgreSQL database")
	}

	var queries *repository.Queries
	if pool != nil {
		queries = repository.New(pool)
	}

	// SMS Provider: Twilio if credentials configured, otherwise MockConsole
	var smsProvider service.SMSProvider
	if cfg.TwilioAccountSID != "" && cfg.TwilioAuthToken != "" && cfg.TwilioPhoneNumber != "" {
		log.Println("Using Twilio SMS Provider")
		smsProvider = service.NewTwilioSMSProvider(cfg.TwilioAccountSID, cfg.TwilioAuthToken, cfg.TwilioPhoneNumber)
	} else {
		log.Println("Using Mock Console SMS Provider (OTP will be output to console)")
		smsProvider = service.NewMockConsoleSMSProvider()
	}

	// Email Provider
	emailProvider := service.NewEmailProvider(cfg)

	// Services
	authService := service.NewAuthService(cfg, queries, smsProvider)
	bookingService := service.NewBookingService(queries)
	catalogService := service.NewCatalogService(queries)
	ticketService := service.NewTicketService(queries, emailProvider)

	// Seed default services and gallery records if DB is ready
	if pool != nil {
		seedCtx, seedCancel := context.WithTimeout(context.Background(), 5*time.Second)
		if err := catalogService.SeedDefaultsIfEmpty(seedCtx); err != nil {
			log.Printf("Notice: Auto-seed skipped or failed: %v", err)
		} else {
			log.Println("Default services and gallery seeded successfully")
		}
		seedCancel()
	}

	// Handlers
	authHandler := handler.NewAuthHandler(authService)
	bookingHandler := handler.NewBookingHandler(bookingService)
	catalogHandler := handler.NewCatalogHandler(catalogService)
	ticketHandler := handler.NewTicketHandler(ticketService)

	// Initialize Fiber App
	app := fiber.New(fiber.Config{
		AppName:      "5th Avenue Beauty Emporium API v1.0",
		ServerHeader: "Fiber",
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError
			if e, ok := err.(*fiber.Error); ok {
				code = e.Code
			}
			return c.Status(code).JSON(fiber.Map{
				"error": err.Error(),
			})
		},
	})

	// Global Middlewares
	app.Use(recover.New())
	app.Use(logger.New(logger.Config{
		Format: "[${time}] ${status} - ${latency} ${method} ${path}\n",
	}))
	app.Use(middleware.SecurityHeaders())
	app.Use(middleware.CORSMiddleware(cfg.AllowedOrigins))

	// Health check endpoint
	app.Get("/health", func(c *fiber.Ctx) error {
		dbStatus := "healthy"
		if pool == nil || pool.Ping(c.Context()) != nil {
			dbStatus = "disconnected"
		}
		return c.JSON(fiber.Map{
			"status":   "ok",
			"database": dbStatus,
			"salon":    "5th Avenue Beauty Emporium - 45 Clarendon Street, Dublin",
			"rating":   "4.9 (1755 reviews)",
			"time":     time.Now().Format(time.RFC3339),
		})
	})

	// API Routes Group
	api := app.Group("/api")

	// Public Auth Routes
	auth := api.Group("/auth")
	auth.Post("/register", authHandler.Register)
	auth.Post("/login", authHandler.Login)
	auth.Post("/refresh", authHandler.Refresh)
	auth.Post("/logout", authHandler.Logout)
	auth.Get("/google", authHandler.Google)
	auth.Get("/google/callback", authHandler.GoogleCallback)
	auth.Post("/otp/send", authHandler.SendOTP)
	auth.Post("/otp/verify", authHandler.VerifyOTP)

	// Catalog Routes (Public)
	api.Get("/services", catalogHandler.ListServices)
	api.Get("/gallery", catalogHandler.ListGallery)

	// Protected User Profile Routes
	userRoutes := api.Group("/user", middleware.AuthMiddleware(cfg.JWTSecret))
	userRoutes.Get("/profile", authHandler.GetProfile)
	userRoutes.Patch("/profile", authHandler.UpdateProfile)

	// Protected Booking Routes
	bookings := api.Group("/bookings", middleware.AuthMiddleware(cfg.JWTSecret))
	bookings.Post("/", bookingHandler.CreateBooking)
	bookings.Get("/me", bookingHandler.ListMyBookings)
	bookings.Patch("/:id/cancel", bookingHandler.CancelBooking)

	// Protected Ticketing & Messaging Routes
	tickets := api.Group("/tickets", middleware.AuthMiddleware(cfg.JWTSecret))
	tickets.Post("/", ticketHandler.CreateTicket)
	tickets.Get("/", ticketHandler.ListTickets)
	tickets.Get("/:id", ticketHandler.GetTicket)
	tickets.Post("/:id/messages", ticketHandler.AddMessage)
	tickets.Patch("/:id/status", ticketHandler.UpdateStatus)

	// Admin Management Routes
	admin := api.Group("/admin", middleware.AuthMiddleware(cfg.JWTSecret), middleware.RequireRole("admin"))
	admin.Get("/bookings", bookingHandler.ListAllBookings)
	admin.Patch("/bookings/:id/status", bookingHandler.AdminUpdateBookingStatus)
	admin.Get("/stats", bookingHandler.GetAdminStats)
	admin.Get("/clients", bookingHandler.ListAllClients)

	// Admin Client Details & Actions
	admin.Get("/clients/:id", authHandler.AdminGetClient)
	admin.Patch("/clients/:id", authHandler.AdminUpdateClient)
	admin.Get("/clients/:id/bookings", bookingHandler.AdminListClientBookings)
	admin.Post("/clients/:id/bookings", bookingHandler.AdminCreateClientBooking)

	// Admin Treatment Services CRUD
	admin.Post("/services", catalogHandler.CreateService)
	admin.Patch("/services/:id", catalogHandler.UpdateService)
	admin.Delete("/services/:id", catalogHandler.DeleteService)

	// Graceful Shutdown Channel
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)

	go func() {
		addr := fmt.Sprintf(":%s", cfg.Port)
		if err := app.Listen(addr); err != nil {
			log.Printf("Server shutting down: %v", err)
		}
	}()

	<-stop
	log.Println("Gracefully stopping server...")
	_ = app.ShutdownWithTimeout(5 * time.Second)
	if pool != nil {
		pool.Close()
	}
	log.Println("Server stopped.")
}
