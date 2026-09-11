-- name: CreateTicket :one
INSERT INTO tickets (
    user_id, subject, status, priority
) VALUES (
    $1, $2, $3, $4
) RETURNING *;

-- name: GetTicketByID :one
SELECT 
    t.id,
    t.user_id,
    t.subject,
    t.status,
    t.priority,
    t.created_at,
    t.updated_at,
    u.name as user_name,
    u.email as user_email,
    u.phone as user_phone
FROM tickets t
JOIN users u ON t.user_id = u.id
WHERE t.id = $1 LIMIT 1;

-- name: ListAllTickets :many
SELECT 
    t.id,
    t.user_id,
    t.subject,
    t.status,
    t.priority,
    t.created_at,
    t.updated_at,
    u.name as user_name,
    u.email as user_email,
    u.phone as user_phone
FROM tickets t
JOIN users u ON t.user_id = u.id
ORDER BY t.updated_at DESC;

-- name: ListTicketsByUserID :many
SELECT 
    t.id,
    t.user_id,
    t.subject,
    t.status,
    t.priority,
    t.created_at,
    t.updated_at,
    u.name as user_name,
    u.email as user_email
FROM tickets t
JOIN users u ON t.user_id = u.id
WHERE t.user_id = $1
ORDER BY t.updated_at DESC;

-- name: UpdateTicketStatus :one
UPDATE tickets
SET status = $2, updated_at = NOW()
WHERE id = $1
RETURNING *;

-- name: CreateTicketMessage :one
INSERT INTO ticket_messages (
    ticket_id, sender_id, sender_role, message, is_email_sent
) VALUES (
    $1, $2, $3, $4, $5
) RETURNING *;

-- name: ListTicketMessages :many
SELECT 
    tm.id,
    tm.ticket_id,
    tm.sender_id,
    tm.sender_role,
    tm.message,
    tm.is_email_sent,
    tm.created_at,
    u.name as sender_name,
    u.email as sender_email
FROM ticket_messages tm
JOIN users u ON tm.sender_id = u.id
WHERE tm.ticket_id = $1
ORDER BY tm.created_at ASC;
