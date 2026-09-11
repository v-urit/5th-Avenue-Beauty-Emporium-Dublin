-- name: ListGalleryImages :many
SELECT * FROM gallery_images
ORDER BY order_index ASC, created_at DESC;

-- name: CreateGalleryImage :one
INSERT INTO gallery_images (
    url, caption, order_index
) VALUES (
    $1, $2, $3
) RETURNING *;
