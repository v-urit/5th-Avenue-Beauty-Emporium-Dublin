CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_user_booking 
ON bookings (user_id, booking_time) 
WHERE status != 'cancelled';
