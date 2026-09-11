-- name: CreateOTP :one
INSERT INTO otp_codes (
    phone, code_hash, expires_at
) VALUES (
    $1, $2, $3
) RETURNING *;

-- name: GetLatestValidOTP :one
SELECT * FROM otp_codes
WHERE phone = $1 AND expires_at > NOW()
ORDER BY created_at DESC
LIMIT 1;

-- name: IncrementOTPAttempts :exec
UPDATE otp_codes
SET attempts = attempts + 1
WHERE id = $1;

-- name: DeleteOTPsForPhone :exec
DELETE FROM otp_codes
WHERE phone = $1;
