package service

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"math/big"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"golang.org/x/crypto/bcrypt"

	"github.com/v-urit/5th/internal/config"
	"github.com/v-urit/5th/internal/repository"
)

var (
	ErrInvalidCredentials = errors.New("invalid email or password")
	ErrUserAlreadyExists  = errors.New("user with this email or phone already exists")
	ErrInvalidToken       = errors.New("invalid or expired token")
	ErrTokenRevoked       = errors.New("token has been revoked")
	ErrInvalidOTP         = errors.New("invalid or expired OTP code")
	ErrTooManyAttempts    = errors.New("too many failed attempts, please request a new code")
)

type JWTClaims struct {
	UserID string `json:"user_id"`
	Email  string `json:"email"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

type UserDTO struct {
	ID            string `json:"id"`
	Name          string `json:"name"`
	Email         string `json:"email"`
	Phone         string `json:"phone"`
	PhoneVerified bool   `json:"phone_verified"`
	Role          string `json:"role"`
}

type AuthResponse struct {
	AccessToken  string  `json:"access_token"`
	RefreshToken string  `json:"refresh_token"`
	User         UserDTO `json:"user"`
}

type AuthService struct {
	cfg         *config.Config
	repo        *repository.Queries
	smsProvider SMSProvider
}

func NewAuthService(cfg *config.Config, repo *repository.Queries, sms SMSProvider) *AuthService {
	return &AuthService{
		cfg:         cfg,
		repo:        repo,
		smsProvider: sms,
	}
}

func (s *AuthService) Register(ctx context.Context, name, email, phone, password string) (*AuthResponse, error) {
	// Check if user already exists
	if email != "" {
		existing, _ := s.repo.GetUserByEmail(ctx, pgtype.Text{String: email, Valid: true})
		if existing.ID.Valid {
			return nil, ErrUserAlreadyExists
		}
	}
	if phone != "" {
		existing, _ := s.repo.GetUserByPhone(ctx, pgtype.Text{String: phone, Valid: true})
		if existing.ID.Valid {
			return nil, ErrUserAlreadyExists
		}
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), 12)
	if err != nil {
		return nil, err
	}

	// Bootstrap elevation: emails listed in ADMIN_EMAILS are created as admin.
	// All later role changes are managed in the database (and enforced by
	// middleware.RequireRole), never by hardcoded values in source.
	role := "customer"
	if _, ok := s.cfg.AdminEmails[strings.ToLower(email)]; ok {
		role = "admin"
	}

	created, err := s.repo.CreateUser(ctx, repository.CreateUserParams{
		Name:          name,
		Email:         pgtype.Text{String: email, Valid: email != ""},
		Phone:         pgtype.Text{String: phone, Valid: phone != ""},
		PasswordHash:  pgtype.Text{String: string(hash), Valid: true},
		GoogleID:      pgtype.Text{Valid: false},
		PhoneVerified: false,
		Role:          role,
	})
	if err != nil {
		return nil, err
	}

	userDTO := mapUserToDTO(created)
	accessToken, refreshToken, err := s.generateTokens(ctx, created.ID, userDTO.Email, userDTO.Role)
	if err != nil {
		return nil, err
	}

	return &AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		User:         userDTO,
	}, nil
}

func (s *AuthService) Login(ctx context.Context, email, password string) (*AuthResponse, error) {
	user, err := s.repo.GetUserByEmail(ctx, pgtype.Text{String: email, Valid: true})
	if err != nil || !user.ID.Valid {
		return nil, ErrInvalidCredentials
	}

	if !user.PasswordHash.Valid {
		return nil, ErrInvalidCredentials
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash.String), []byte(password)); err != nil {
		return nil, ErrInvalidCredentials
	}

	userDTO := mapUserToDTO(user)
	accessToken, refreshToken, err := s.generateTokens(ctx, user.ID, userDTO.Email, userDTO.Role)
	if err != nil {
		return nil, err
	}

	return &AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		User:         userDTO,
	}, nil
}

func (s *AuthService) RefreshToken(ctx context.Context, rawRefreshToken string) (*AuthResponse, error) {
	tokenHash := hashString(rawRefreshToken)
	tokenRecord, err := s.repo.GetRefreshTokenByHash(ctx, tokenHash)
	if err != nil || !tokenRecord.ID.Valid {
		return nil, ErrInvalidToken
	}

	// Invalidate the used refresh token (Token Rotation)
	_ = s.repo.RevokeRefreshToken(ctx, tokenHash)

	// Fetch User
	user, err := s.repo.GetUserByID(ctx, tokenRecord.UserID)
	if err != nil || !user.ID.Valid {
		return nil, ErrInvalidToken
	}

	userDTO := mapUserToDTO(user)
	newAccessToken, newRefreshToken, err := s.generateTokens(ctx, user.ID, userDTO.Email, userDTO.Role)
	if err != nil {
		return nil, err
	}

	return &AuthResponse{
		AccessToken:  newAccessToken,
		RefreshToken: newRefreshToken,
		User:         userDTO,
	}, nil
}

func (s *AuthService) Logout(ctx context.Context, rawRefreshToken string) error {
	tokenHash := hashString(rawRefreshToken)
	return s.repo.RevokeRefreshToken(ctx, tokenHash)
}

func (s *AuthService) SendOTP(ctx context.Context, phone string) error {
	// Generate 6 digit random number
	max := big.NewInt(1000000)
	n, err := rand.Int(rand.Reader, max)
	if err != nil {
		return err
	}
	code := fmt.Sprintf("%06d", n.Int64())
	codeHash := hashString(code)

	// Invalidate any previous OTPs for this phone
	_ = s.repo.DeleteOTPsForPhone(ctx, phone)

	// Store OTP in database with 5 minute expiry
	expiresAt := time.Now().Add(5 * time.Minute)
	_, err = s.repo.CreateOTP(ctx, repository.CreateOTPParams{
		Phone:     phone,
		CodeHash:  codeHash,
		ExpiresAt: pgtype.Timestamptz{Time: expiresAt, Valid: true},
	})
	if err != nil {
		return err
	}

	// Send via SMS Provider
	msg := fmt.Sprintf("Your 5th Avenue Beauty Emporium verification code is: %s (expires in 5 minutes)", code)
	return s.smsProvider.SendSMS(ctx, phone, msg)
}

func (s *AuthService) VerifyOTP(ctx context.Context, phone, code string) (*AuthResponse, error) {
	otp, err := s.repo.GetLatestValidOTP(ctx, phone)
	if err != nil || !otp.ID.Valid {
		return nil, ErrInvalidOTP
	}

	if otp.Attempts >= 5 {
		_ = s.repo.DeleteOTPsForPhone(ctx, phone)
		return nil, ErrTooManyAttempts
	}

	if otp.CodeHash != hashString(code) {
		_ = s.repo.IncrementOTPAttempts(ctx, otp.ID)
		return nil, ErrInvalidOTP
	}

	// Successful verification - clean up OTP
	_ = s.repo.DeleteOTPsForPhone(ctx, phone)

	// Find or create user by phone
	user, err := s.repo.GetUserByPhone(ctx, pgtype.Text{String: phone, Valid: true})
	if err != nil || !user.ID.Valid {
		// Create new user for this verified phone number
		created, err := s.repo.CreateUser(ctx, repository.CreateUserParams{
			Name:          "Client " + phone[len(phone)-4:],
			Email:         pgtype.Text{Valid: false},
			Phone:         pgtype.Text{String: phone, Valid: true},
			PasswordHash:  pgtype.Text{Valid: false},
			GoogleID:      pgtype.Text{Valid: false},
			PhoneVerified: true,
			Role:          "customer",
		})
		if err != nil {
			return nil, err
		}
		user = created
	} else {
		// Mark existing user's phone verified
		updated, err := s.repo.UpdateUserPhoneVerified(ctx, repository.UpdateUserPhoneVerifiedParams{
			ID:            user.ID,
			PhoneVerified: true,
		})
		if err == nil {
			user = updated
		}
	}

	userDTO := mapUserToDTO(user)
	accessToken, refreshToken, err := s.generateTokens(ctx, user.ID, userDTO.Email, userDTO.Role)
	if err != nil {
		return nil, err
	}

	return &AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		User:         userDTO,
	}, nil
}

func (s *AuthService) GetGoogleAuthURL() string {
	if s.cfg.GoogleClientID == "" {
		// Fallback for dev mode
		return fmt.Sprintf("/api/auth/google/callback?code=mock_dev_code&state=dev")
	}
	v := url.Values{}
	v.Set("client_id", s.cfg.GoogleClientID)
	v.Set("redirect_uri", s.cfg.GoogleRedirectURL)
	v.Set("response_type", "code")
	v.Set("scope", "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile")
	v.Set("access_type", "offline")
	v.Set("prompt", "consent")
	return "https://accounts.google.com/o/oauth2/v2/auth?" + v.Encode()
}

func (s *AuthService) HandleGoogleCallback(ctx context.Context, code string) (*AuthResponse, error) {
	var googleEmail, googleName, googleID string

	if code == "mock_dev_code" || s.cfg.GoogleClientID == "" {
		// Mock dev user for testing without live credentials
		googleEmail = "luxury.client@gmail.com"
		googleName = "Elena Rostova"
		googleID = "google_sub_10928301923"
	} else {
		// Real Google token exchange
		tokenURL := "https://oauth2.googleapis.com/token"
		v := url.Values{}
		v.Set("code", code)
		v.Set("client_id", s.cfg.GoogleClientID)
		v.Set("client_secret", s.cfg.GoogleClientSecret)
		v.Set("redirect_uri", s.cfg.GoogleRedirectURL)
		v.Set("grant_type", "authorization_code")

		resp, err := http.PostForm(tokenURL, v)
		if err != nil {
			return nil, err
		}
		defer resp.Body.Close()

		var tokenResp struct {
			AccessToken string `json:"access_token"`
		}
		if err := json.NewDecoder(resp.Body).Decode(&tokenResp); err != nil {
			return nil, err
		}

		// Fetch user info
		req, _ := http.NewRequestWithContext(ctx, "GET", "https://www.googleapis.com/oauth2/v2/userinfo", nil)
		req.Header.Set("Authorization", "Bearer "+tokenResp.AccessToken)
		userInfoResp, err := http.DefaultClient.Do(req)
		if err != nil {
			return nil, err
		}
		defer userInfoResp.Body.Close()

		var userInfo struct {
			ID    string `json:"id"`
			Email string `json:"email"`
			Name  string `json:"name"`
		}
		if err := json.NewDecoder(userInfoResp.Body).Decode(&userInfo); err != nil {
			return nil, err
		}
		googleEmail = userInfo.Email
		googleName = userInfo.Name
		googleID = userInfo.ID
	}

	user, err := s.repo.UpsertGoogleUser(ctx, repository.UpsertGoogleUserParams{
		Name:     googleName,
		Email:    pgtype.Text{String: googleEmail, Valid: true},
		GoogleID: pgtype.Text{String: googleID, Valid: true},
	})
	if err != nil {
		return nil, err
	}

	userDTO := mapUserToDTO(user)
	accessToken, refreshToken, err := s.generateTokens(ctx, user.ID, userDTO.Email, userDTO.Role)
	if err != nil {
		return nil, err
	}

	return &AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		User:         userDTO,
	}, nil
}

func (s *AuthService) generateTokens(ctx context.Context, userID pgtype.UUID, email, role string) (string, string, error) {
	uidStr := uuidFromPg(userID).String()

	// Access Token
	claims := JWTClaims{
		UserID: uidStr,
		Email:  email,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(s.cfg.JWTAccessExpiry)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "5th-avenue-emporium",
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	accessToken, err := token.SignedString([]byte(s.cfg.JWTSecret))
	if err != nil {
		return "", "", err
	}

	// Refresh Token (crypto random 32 bytes hex)
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", "", err
	}
	rawRefreshToken := hex.EncodeToString(b)
	tokenHash := hashString(rawRefreshToken)

	expiresAt := time.Now().Add(s.cfg.JWTRefreshExpiry)
	_, err = s.repo.CreateRefreshToken(ctx, repository.CreateRefreshTokenParams{
		UserID:    userID,
		TokenHash: tokenHash,
		ExpiresAt: pgtype.Timestamptz{Time: expiresAt, Valid: true},
	})
	if err != nil {
		return "", "", err
	}

	return accessToken, rawRefreshToken, nil
}

func hashString(s string) string {
	h := sha256.New()
	h.Write([]byte(s))
	return hex.EncodeToString(h.Sum(nil))
}

func mapUserToDTO(u repository.User) UserDTO {
	var email, phone string
	if u.Email.Valid {
		email = u.Email.String
	}
	if u.Phone.Valid {
		phone = u.Phone.String
	}
	return UserDTO{
		ID:            uuidFromPg(u.ID).String(),
		Name:          u.Name,
		Email:         email,
		Phone:         phone,
		PhoneVerified: u.PhoneVerified,
		Role:          u.Role,
	}
}

func (s *AuthService) GetProfile(ctx context.Context, userIDStr string) (*UserDTO, error) {
	uid, err := uuid.Parse(userIDStr)
	if err != nil {
		return nil, errors.New("invalid user id")
	}
	user, err := s.repo.GetUserByID(ctx, uuidToPg(uid))
	if err != nil || !user.ID.Valid {
		return nil, errors.New("user not found")
	}
	dto := mapUserToDTO(user)
	return &dto, nil
}

func (s *AuthService) UpdateProfile(ctx context.Context, userIDStr string, newName, newPhone, otpCode string) (*UserDTO, error) {
	uid, err := uuid.Parse(userIDStr)
	if err != nil {
		return nil, errors.New("invalid user id")
	}

	user, err := s.repo.GetUserByID(ctx, uuidToPg(uid))
	if err != nil || !user.ID.Valid {
		return nil, errors.New("user not found")
	}

	finalName := user.Name
	if newName != "" {
		finalName = newName
	}

	currentPhone := ""
	if user.Phone.Valid {
		currentPhone = user.Phone.String
	}

	finalPhone := user.Phone
	finalPhoneVerified := user.PhoneVerified

	// If phone is being changed or set for the first time
	if newPhone != "" && newPhone != currentPhone {
		// Phone modification strictly requires OTP verification!
		if otpCode == "" {
			return nil, errors.New("OTP verification code is required to update phone number")
		}

		// Verify OTP for this new phone number
		otp, err := s.repo.GetLatestValidOTP(ctx, newPhone)
		if err != nil || !otp.ID.Valid {
			return nil, ErrInvalidOTP
		}

		if otp.Attempts >= 5 {
			_ = s.repo.DeleteOTPsForPhone(ctx, newPhone)
			return nil, ErrTooManyAttempts
		}

		if otp.CodeHash != hashString(otpCode) {
			_ = s.repo.IncrementOTPAttempts(ctx, otp.ID)
			return nil, ErrInvalidOTP
		}

		// Clean up OTP on success
		_ = s.repo.DeleteOTPsForPhone(ctx, newPhone)

		// Check if another user already has this phone
		existing, err := s.repo.GetUserByPhone(ctx, pgtype.Text{String: newPhone, Valid: true})
		if err == nil && existing.ID.Valid && uuidFromPg(existing.ID) != uid {
			return nil, errors.New("this phone number is already registered to another account")
		}

		finalPhone = pgtype.Text{String: newPhone, Valid: true}
		finalPhoneVerified = true
	}

	updated, err := s.repo.UpdateUserProfile(ctx, repository.UpdateUserProfileParams{
		ID:            user.ID,
		Name:          finalName,
		Phone:         finalPhone,
		PhoneVerified: finalPhoneVerified,
	})
	if err != nil {
		return nil, err
	}

	dto := mapUserToDTO(updated)
	return &dto, nil
}

func (s *AuthService) AdminUpdateUserProfile(ctx context.Context, targetUserID, name, email, phone string) (*UserDTO, error) {
	uid, err := uuid.Parse(targetUserID)
	if err != nil {
		return nil, err
	}

	user, err := s.repo.GetUserByID(ctx, uuidToPg(uid))
	if err != nil || !user.ID.Valid {
		return nil, errors.New("user not found")
	}

	finalName := user.Name
	if name != "" {
		finalName = name
	}

	finalPhone := user.Phone
	if phone != "" {
		finalPhone = pgtype.Text{String: phone, Valid: true}
	}

	updated, err := s.repo.UpdateUserProfile(ctx, repository.UpdateUserProfileParams{
		ID:            user.ID,
		Name:          finalName,
		Phone:         finalPhone,
		PhoneVerified: user.PhoneVerified,
	})
	if err != nil {
		return nil, err
	}

	dto := mapUserToDTO(updated)
	return &dto, nil
}

func uuidFromPg(u pgtype.UUID) uuid.UUID {
	var val uuid.UUID
	copy(val[:], u.Bytes[:])
	return val
}

func uuidToPg(u uuid.UUID) pgtype.UUID {
	return pgtype.UUID{Bytes: u, Valid: true}
}


