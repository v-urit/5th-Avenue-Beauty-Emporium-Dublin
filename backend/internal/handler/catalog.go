package handler

import (
	"github.com/gofiber/fiber/v2"

	"github.com/v-urit/5th/internal/service"
)

type CatalogHandler struct {
	catalogService *service.CatalogService
}

func NewCatalogHandler(catalogService *service.CatalogService) *CatalogHandler {
	return &CatalogHandler{catalogService: catalogService}
}

func (h *CatalogHandler) ListServices(c *fiber.Ctx) error {
	services, err := h.catalogService.ListServices(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(services)
}

func (h *CatalogHandler) ListGallery(c *fiber.Ctx) error {
	items, err := h.catalogService.ListGallery(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(items)
}

type ServiceReq struct {
	Title           string `json:"title"`
	Description     string `json:"description"`
	Price           int64  `json:"price"`
	DurationMinutes int32  `json:"duration_minutes"`
	ImageURL        string `json:"image_url"`
	Category        string `json:"category"`
}

func (h *CatalogHandler) CreateService(c *fiber.Ctx) error {
	var req ServiceReq
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request payload"})
	}
	if req.Title == "" || req.Price <= 0 || req.DurationMinutes <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Title, valid price, and duration are required"})
	}
	if req.Category == "" {
		req.Category = "manicure"
	}
	if req.ImageURL == "" {
		req.ImageURL = "/images/hero_manicure.jpg"
	}

	created, err := h.catalogService.CreateService(c.Context(), req.Title, req.Description, req.Price, req.DurationMinutes, req.ImageURL, req.Category)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(fiber.StatusCreated).JSON(created)
}

func (h *CatalogHandler) UpdateService(c *fiber.Ctx) error {
	id := c.Params("id")
	var req ServiceReq
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request payload"})
	}
	if req.Title == "" || req.Price <= 0 || req.DurationMinutes <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Title, valid price, and duration are required"})
	}
	if req.Category == "" {
		req.Category = "manicure"
	}

	updated, err := h.catalogService.UpdateService(c.Context(), id, req.Title, req.Description, req.Price, req.DurationMinutes, req.ImageURL, req.Category)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(updated)
}

func (h *CatalogHandler) DeleteService(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := h.catalogService.DeleteService(c.Context(), id); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"message": "Service deleted successfully"})
}

