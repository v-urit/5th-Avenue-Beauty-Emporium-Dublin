package service_test

import (
	"crypto/sha256"
	"encoding/hex"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"

	"github.com/v-urit/5th/internal/service"
)

func TestPasswordHashing(t *testing.T) {
	password := "LuxurySalon2026!"
	hash, err := bcrypt.GenerateFromPassword([]byte(password), 12)
	if err != nil {
		t.Fatalf("Failed to hash password: %v", err)
	}

	if err := bcrypt.CompareHashAndPassword(hash, []byte(password)); err != nil {
		t.Fatalf("Password verification failed: %v", err)
	}

	if err := bcrypt.CompareHashAndPassword(hash, []byte("WrongPassword")); err == nil {
		t.Fatalf("Expected comparison to fail with wrong password")
	}
}

func TestJWTCreationAndParsing(t *testing.T) {
	secret := "test-secret-key-1234567890123456"
	claims := service.JWTClaims{
		UserID: "11111111-1111-1111-1111-111111111111",
		Email:  "test@5thavenue.ie",
		Role:   "customer",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(15 * time.Minute)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenStr, err := token.SignedString([]byte(secret))
	if err != nil {
		t.Fatalf("Failed to sign token: %v", err)
	}

	parsedClaims := &service.JWTClaims{}
	parsedToken, err := jwt.ParseWithClaims(tokenStr, parsedClaims, func(token *jwt.Token) (interface{}, error) {
		return []byte(secret), nil
	})
	if err != nil || !parsedToken.Valid {
		t.Fatalf("Failed to parse valid token: %v", err)
	}

	if parsedClaims.UserID != claims.UserID {
		t.Errorf("Expected UserID %s, got %s", claims.UserID, parsedClaims.UserID)
	}
}

func TestTokenHashDeterministic(t *testing.T) {
	token := "4a5b6c7d8e9f"
	h1 := sha256.Sum256([]byte(token))
	s1 := hex.EncodeToString(h1[:])

	h2 := sha256.Sum256([]byte(token))
	s2 := hex.EncodeToString(h2[:])

	if s1 != s2 {
		t.Errorf("Expected hash to be deterministic, got %s vs %s", s1, s2)
	}
}
