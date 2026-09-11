-- name: ListServices :many
SELECT * FROM services
ORDER BY category, price ASC;

-- name: GetServiceByID :one
SELECT * FROM services
WHERE id = $1 LIMIT 1;

-- name: CreateService :one
INSERT INTO services (
    title, description, price, duration_minutes, image_url, category
) VALUES (
    $1, $2, $3, $4, $5, $6
) RETURNING *;

-- name: UpdateService :one
UPDATE services
SET title = $2,
    description = $3,
    price = $4,
    duration_minutes = $5,
    image_url = $6,
    category = $7
WHERE id = $1
RETURNING *;

-- name: DeleteService :exec
DELETE FROM services
WHERE id = $1;

