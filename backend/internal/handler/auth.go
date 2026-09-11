package handler

import (
	"github.com/gofiber/fiber/v2"

	"github.com/v-urit/5th/internal/service"
)

type AuthHandler struct {
	authService *service.AuthService
}

func NewAuthHandler(authService *service.AuthService) *AuthHandler {
	return &AuthHandler{authService: authService}
}

type RegisterReq struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Phone    string `json:"phone"`
	Password string `json:"password"`
}

func (h *AuthHandler) Register(c *fiber.Ctx) error {
	var req RegisterReq
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request payload"})
	}

	if req.Name == "" || (req.Email == "" && req.Phone == "") || len(req.Password) < 6 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Name, valid password (min 6 chars), and either email or phone are required"})
	}

	resp, err := h.authService.Register(c.Context(), req.Name, req.Email, req.Phone, req.Password)
	if err != nil {
		if err == service.ErrUserAlreadyExists {
			return c.Status(fiber.StatusConflict).JSON(fiber.Map{"error": err.Error()})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(fiber.StatusCreated).JSON(resp)
}

type LoginReq struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (h *AuthHandler) Login(c *fiber.Ctx) error {
	var req LoginReq
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request payload"})
	}

	resp, err := h.authService.Login(c.Context(), req.Email, req.Password)
	if err != nil {
		if err == service.ErrInvalidCredentials {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": err.Error()})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(resp)
}

type RefreshReq struct {
	RefreshToken string `json:"refresh_token"`
}

func (h *AuthHandler) Refresh(c *fiber.Ctx) error {
	var req RefreshReq
	if err := c.BodyParser(&req); err != nil || req.RefreshToken == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "refresh_token is required"})
	}

	resp, err := h.authService.RefreshToken(c.Context(), req.RefreshToken)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(resp)
}

type LogoutReq struct {
	RefreshToken string `json:"refresh_token"`
}

func (h *AuthHandler) Logout(c *fiber.Ctx) error {
	var req LogoutReq
	if err := c.BodyParser(&req); err == nil && req.RefreshToken != "" {
		_ = h.authService.Logout(c.Context(), req.RefreshToken)
	}
	return c.JSON(fiber.Map{"message": "Successfully logged out"})
}

func (h *AuthHandler) Google(c *fiber.Ctx) error {
	url := h.authService.GetGoogleAuthURL()
	return c.Redirect(url)
}

func (h *AuthHandler) GoogleCallback(c *fiber.Ctx) error {
	code := c.Query("code")
	if code == "" {
		code = "mock_dev_code"
	}

	resp, err := h.authService.HandleGoogleCallback(c.Context(), code)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	// Redirect to frontend with tokens or return JSON
	frontendRedirect := c.Query("redirect_to")
	if frontendRedirect != "" {
		return c.Redirect(frontendRedirect + "?access_token=" + resp.AccessToken + "&refresh_token=" + resp.RefreshToken)
	}

	return c.JSON(resp)
}

type SendOTPReq struct {
	Phone string `json:"phone"`
}

func (h *AuthHandler) SendOTP(c *fiber.Ctx) error {
	var req SendOTPReq
	if err := c.BodyParser(&req); err != nil || req.Phone == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "phone number is required"})
	}

	if err := h.authService.SendOTP(c.Context(), req.Phone); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{
		"message": "Verification OTP sent successfully",
		"phone":   req.Phone,
	})
}

type VerifyOTPReq struct {
	Phone string `json:"phone"`
	Code  string `json:"code"`
}

func (h *AuthHandler) VerifyOTP(c *fiber.Ctx) error {
	var req VerifyOTPReq
	if err := c.BodyParser(&req); err != nil || req.Phone == "" || req.Code == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "phone and 6-digit code are required"})
	}

	resp, err := h.authService.VerifyOTP(c.Context(), req.Phone, req.Code)
	if err != nil {
		if err == service.ErrInvalidOTP || err == service.ErrTooManyAttempts {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": err.Error()})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(resp)
}

func (h *AuthHandler) GetProfile(c *fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(string)
	if !ok || userID == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	profile, err := h.authService.GetProfile(c.Context(), userID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(profile)
}

type UpdateProfileReq struct {
	Name    string `json:"name"`
	Phone   string `json:"phone"`
	OTPCode string `json:"otp_code"`
}

func (h *AuthHandler) UpdateProfile(c *fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(string)
	if !ok || userID == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	var req UpdateProfileReq
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request payload"})
	}

	if req.Name == "" && req.Phone == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Name or phone number is required to update profile"})
	}

	updatedUser, err := h.authService.UpdateProfile(c.Context(), userID, req.Name, req.Phone, req.OTPCode)
	if err != nil {
		if err == service.ErrInvalidOTP || err == service.ErrTooManyAttempts {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
		}
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{
		"message": "Profile updated successfully",
		"user":    updatedUser,
	})
}

func (h *AuthHandler) AdminGetClient(c *fiber.Ctx) error {
	id := c.Params("id")
	client, err := h.authService.GetProfile(c.Context(), id)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(client)
}

type AdminUpdateClientReq struct {
	Name  string `json:"name"`
	Email string `json:"email"`
	Phone string `json:"phone"`
}

func (h *AuthHandler) AdminUpdateClient(c *fiber.Ctx) error {
	id := c.Params("id")
	var req AdminUpdateClientReq
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request payload"})
	}

	updated, err := h.authService.AdminUpdateUserProfile(c.Context(), id, req.Name, req.Email, req.Phone)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(updated)
}


