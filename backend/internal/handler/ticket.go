package handler

import (
	"github.com/gofiber/fiber/v2"

	"github.com/v-urit/5th/internal/service"
)

type TicketHandler struct {
	ticketService *service.TicketService
}

func NewTicketHandler(ticketService *service.TicketService) *TicketHandler {
	return &TicketHandler{ticketService: ticketService}
}

type CreateTicketReq struct {
	TargetUserID string `json:"target_user_id"`
	Subject      string `json:"subject"`
	Priority     string `json:"priority"`
	Message      string `json:"message"`
}

func (h *TicketHandler) CreateTicket(c *fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(string)
	if !ok || userID == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}
	role, _ := c.Locals("user_role").(string)
	if role == "" {
		role = "customer"
	}

	var req CreateTicketReq
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request payload"})
	}

	if req.Subject == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "subject is required"})
	}

	targetUID := userID
	if role == "admin" && req.TargetUserID != "" {
		targetUID = req.TargetUserID
	}

	ticket, err := h.ticketService.CreateTicket(c.Context(), targetUID, req.Subject, req.Priority, req.Message, role)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(fiber.StatusCreated).JSON(ticket)
}

func (h *TicketHandler) ListTickets(c *fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(string)
	if !ok || userID == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}
	role, _ := c.Locals("user_role").(string)
	if role == "" {
		role = "customer"
	}

	tickets, err := h.ticketService.ListTickets(c.Context(), userID, role)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(tickets)
}

func (h *TicketHandler) GetTicket(c *fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(string)
	if !ok || userID == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}
	role, _ := c.Locals("user_role").(string)
	if role == "" {
		role = "customer"
	}

	ticketID := c.Params("id")
	ticket, err := h.ticketService.GetTicketWithMessages(c.Context(), ticketID, userID, role)
	if err != nil {
		if err == service.ErrTicketNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": err.Error()})
		}
		if err == service.ErrForbidden {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": err.Error()})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(ticket)
}

type AddMessageReq struct {
	Message string `json:"message"`
}

func (h *TicketHandler) AddMessage(c *fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(string)
	if !ok || userID == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}
	role, _ := c.Locals("user_role").(string)
	if role == "" {
		role = "customer"
	}

	ticketID := c.Params("id")
	var req AddMessageReq
	if err := c.BodyParser(&req); err != nil || req.Message == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "message is required"})
	}

	msg, err := h.ticketService.AddMessage(c.Context(), ticketID, userID, role, req.Message)
	if err != nil {
		if err == service.ErrForbidden {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": err.Error()})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(fiber.StatusCreated).JSON(msg)
}

type UpdateTicketStatusReq struct {
	Status string `json:"status"`
}

func (h *TicketHandler) UpdateStatus(c *fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(string)
	if !ok || userID == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}
	role, _ := c.Locals("user_role").(string)
	if role == "" {
		role = "customer"
	}

	ticketID := c.Params("id")
	var req UpdateTicketStatusReq
	if err := c.BodyParser(&req); err != nil || req.Status == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "status is required"})
	}

	ticket, err := h.ticketService.UpdateStatus(c.Context(), ticketID, req.Status, userID, role)
	if err != nil {
		if err == service.ErrForbidden {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": err.Error()})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(ticket)
}
