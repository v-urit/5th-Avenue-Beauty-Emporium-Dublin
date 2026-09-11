-- name: CreateBooking :one
INSERT INTO bookings (
    user_id, service_id, booking_time, status, notes
) VALUES (
    $1, $2, $3, $4, $5
) RETURNING *;

-- name: GetBookingByID :one
SELECT 
    b.id,
    b.user_id,
    b.service_id,
    b.booking_time,
    b.status,
    b.notes,
    b.created_at,
    b.updated_at,
    s.title as service_title,
    s.price as service_price,
    s.duration_minutes as service_duration
FROM bookings b
JOIN services s ON b.service_id = s.id
WHERE b.id = $1 LIMIT 1;

-- name: ListBookingsByUserID :many
SELECT 
    b.id,
    b.user_id,
    b.service_id,
    b.booking_time,
    b.status,
    b.notes,
    b.created_at,
    b.updated_at,
    s.title as service_title,
    s.price as service_price,
    s.duration_minutes as service_duration,
    s.image_url as service_image_url
FROM bookings b
JOIN services s ON b.service_id = s.id
WHERE b.user_id = $1
ORDER BY b.booking_time DESC;

-- name: UpdateBookingStatus :one
UPDATE bookings
SET status = $2, updated_at = NOW()
WHERE id = $1 AND user_id = $3
RETURNING *;

-- name: ListAllBookings :many
SELECT 
    b.id,
    b.user_id,
    b.service_id,
    b.booking_time,
    b.status,
    b.notes,
    b.created_at,
    b.updated_at,
    s.title as service_title,
    s.price as service_price,
    s.duration_minutes as service_duration,
    s.image_url as service_image_url,
    s.category as service_category,
    u.name as user_name,
    u.email as user_email,
    u.phone as user_phone,
    u.phone_verified as user_phone_verified
FROM bookings b
JOIN services s ON b.service_id = s.id
JOIN users u ON b.user_id = u.id
ORDER BY b.booking_time DESC;

-- name: AdminUpdateBookingStatus :one
UPDATE bookings
SET status = $2, updated_at = NOW()
WHERE id = $1
RETURNING *;

