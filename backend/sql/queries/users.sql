-- name: CreateUser :one
INSERT INTO users (
    name, email, phone, password_hash, google_id, phone_verified, role
) VALUES (
    $1, $2, $3, $4, $5, $6, $7
) RETURNING *;

-- name: GetUserByID :one
SELECT * FROM users
WHERE id = $1 LIMIT 1;

-- name: GetUserByEmail :one
SELECT * FROM users
WHERE email = $1 LIMIT 1;

-- name: GetUserByPhone :one
SELECT * FROM users
WHERE phone = $1 LIMIT 1;

-- name: GetUserByGoogleID :one
SELECT * FROM users
WHERE google_id = $1 LIMIT 1;

-- name: UpdateUserPhoneVerified :one
UPDATE users
SET phone_verified = $2, updated_at = NOW()
WHERE id = $1
RETURNING *;

-- name: UpsertGoogleUser :one
INSERT INTO users (
    name, email, google_id, role
) VALUES (
    $1, $2, $3, 'customer'
)
ON CONFLICT (email) DO UPDATE
SET google_id = EXCLUDED.google_id,
    name = CASE WHEN users.name = '' THEN EXCLUDED.name ELSE users.name END,
    updated_at = NOW()
RETURNING *;

-- name: UpdateUserProfile :one
UPDATE users
SET name = $2,
    phone = $3,
    phone_verified = $4,
    updated_at = NOW()
WHERE id = $1
RETURNING *;

-- name: ListAllUsers :many
SELECT *
FROM users
ORDER BY created_at DESC;



