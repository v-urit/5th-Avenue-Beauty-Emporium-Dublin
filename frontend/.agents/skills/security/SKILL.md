---
name: security
description: Comprehensive full-stack security enforcement skill for Go (Fiber) and Next.js. Dictates zero-trust API security, JWT rotation and database revocation, cryptographic OTP validation, timing-attack defense, OWASP Top 10 mitigations, and secure cookie/header configurations. Activates whenever implementing or auditing authentication, session management, or sensitive endpoints.
---

# Full-Stack Security & Hardening Guide

Production security protocol for 5th Avenue Beauty Emporium online booking system.

---

## 1. Authentication & Token Architecture
- **Access Tokens**:
  - Expiry: Strictly **15 minutes**.
  - Payload: Minimal claims (`sub`, `email`, `role`). Do not store sensitive PII inside JWT.
  - Verification: Standard HMAC-SHA256 with 256-bit cryptographically random secret.
- **Refresh Tokens & Rotation**:
  - Expiry: **7 days**.
  - Generated via `crypto/rand` (64 bytes hex-encoded).
  - Stored in database as SHA-256 hash (`token_hash`) to protect against database leaks.
  - **Rotation**: On every `/auth/refresh` request, the presented token is immediately marked revoked (`revoked_at = NOW()`), and a completely new pair is issued.
  - If an already revoked token is presented, trigger security alert and revoke all active tokens for that `user_id` (token reuse detection).

---

## 2. Password Security & Timing Defense
- Passwords must be hashed using `bcrypt` with cost factor 12 (or `argon2id`).
- Compare passwords and hashes using constant-time comparison (`subtle.ConstantTimeCompare` or `bcrypt.CompareHashAndPassword`) to prevent timing side-channel attacks.
- Minimum password length: 8 characters.

---

## 3. Phone + OTP Defense
- Code generation: 6 cryptographically random digits using `crypto/rand`.
- TTL: Exactly 5 minutes.
- Maximum attempts: 5. After 5 failed attempts, the code is locked and deleted.
- Rate Limiting: Max 3 OTP requests per phone number per 15-minute window to avoid SMS exhaustion and abuse.

---

## 4. API & Transport Security
- **CORS**: Explicit allowed origins (Frontend Next.js URL only). Never use wildcard `*` with credentials enabled.
- **Security Headers**:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Content-Security-Policy` default-src 'self'
- **SQL Injection Prevention**: Use `sqlc` parameterized queries exclusively. Never concatenate raw SQL strings.
- **Rate Limiting**: Fiber `limiter` middleware enabled on all `/api/auth/*` routes (e.g. 10 requests per minute).
