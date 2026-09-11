package handler

import (
	"time"

	"github.com/gofiber/fiber/v2"

	"github.com/v-urit/5th/internal/service"
)

type BookingHandler struct {
	bookingService *service.BookingService
}

func NewBookingHandler(bookingService *service.BookingService) *BookingHandler {
	return &BookingHandler{bookingService: bookingService}
}

type CreateBookingReq struct {
	ServiceID   string `json:"service_id"`
	BookingTime string `json:"booking_time"` // ISO 8601 string
	Notes       string `json:"notes"`
}

func (h *BookingHandler) CreateBooking(c *fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(string)
	if !ok || userID == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	var req CreateBookingReq
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request payload"})
	}

	if req.ServiceID == "" || req.BookingTime == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "service_id and booking_time are required"})
	}

	bTime, err := time.Parse(time.RFC3339, req.BookingTime)
	if err != nil {
		// try simple date format
		bTime, err = time.Parse("2006-01-02T15:04", req.BookingTime)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid booking_time format (expected RFC3339 or YYYY-MM-DDTHH:MM)"})
		}
	}

	booking, err := h.bookingService.CreateBooking(c.Context(), userID, req.ServiceID, bTime, req.Notes)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(fiber.StatusCreated).JSON(booking)
}

func (h *BookingHandler) ListMyBookings(c *fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(string)
	if !ok || userID == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	bookings, err := h.bookingService.ListUserBookings(c.Context(), userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(bookings)
}

func (h *BookingHandler) CancelBooking(c *fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(string)
	if !ok || userID == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	bookingID := c.Params("id")
	if bookingID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "booking id required"})
	}

	if err := h.bookingService.CancelBooking(c.Context(), bookingID, userID); err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"message": "Booking successfully cancelled"})
}

func (h *BookingHandler) ListAllBookings(c *fiber.Ctx) error {
	bookings, err := h.bookingService.ListAllBookings(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(bookings)
}

type UpdateStatusReq struct {
	Status string `json:"status"`
}

func (h *BookingHandler) AdminUpdateBookingStatus(c *fiber.Ctx) error {
	bookingID := c.Params("id")
	if bookingID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "booking id required"})
	}

	var req UpdateStatusReq
	if err := c.BodyParser(&req); err != nil || req.Status == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "valid status required (confirmed, completed, cancelled)"})
	}

	updated, err := h.bookingService.AdminUpdateBookingStatus(c.Context(), bookingID, req.Status)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(updated)
}

func (h *BookingHandler) GetAdminStats(c *fiber.Ctx) error {
	stats, err := h.bookingService.GetAdminStats(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(stats)
}

func (h *BookingHandler) ListAllClients(c *fiber.Ctx) error {
	clients, err := h.bookingService.ListAllClients(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(clients)
}

func (h *BookingHandler) AdminListClientBookings(c *fiber.Ctx) error {
	clientID := c.Params("id")
	bookings, err := h.bookingService.ListUserBookings(c.Context(), clientID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(bookings)
}

func (h *BookingHandler) AdminCreateClientBooking(c *fiber.Ctx) error {
	clientID := c.Params("id")
	var req CreateBookingReq
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request payload"})
	}

	if req.ServiceID == "" || req.BookingTime == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "service_id and booking_time are required"})
	}

	bTime, err := time.Parse(time.RFC3339, req.BookingTime)
	if err != nil {
		bTime, err = time.Parse("2006-01-02T15:04", req.BookingTime)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid booking_time format"})
		}
	}

	booking, err := h.bookingService.CreateBooking(c.Context(), clientID, req.ServiceID, bTime, req.Notes)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(fiber.StatusCreated).JSON(booking)
}


