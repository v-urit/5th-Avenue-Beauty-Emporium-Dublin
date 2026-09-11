/**
 * Central API type definitions for the 5th Avenue Beauty Emporium frontend.
 *
 * These mirror the Go DTOs in backend/internal/service (BookingDTO,
 * ServiceCatalogDTO, UserDTO, TicketDTO, …) and the JSON returned by
 * GetAdminStats. Keeping them here removes every `any` from pages that
 * consume `lib/api`, and makes schema drift a compile-time error.
 */

/* ---------- Auth & Users ---------- */

export type UserRole = "customer" | "admin" | "staff"

export interface UserDTO {
  id: string
  name: string
  email: string
  phone: string
  phone_verified: boolean
  role: UserRole
}

/**
 * Client profile as returned by the admin detail endpoint. The backend also
 * includes an account creation timestamp here, so we widen UserDTO for it.
 */
export interface ClientDetailDTO extends UserDTO {
  created_at?: string
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  user: UserDTO
}

/* ---------- Services / catalog ---------- */

export type ServiceCategory = "Manicure" | "Pedicure" | "Treatment" | string

export interface ServiceDTO {
  id: string
  title: string
  description: string
  /** Formatted display price, e.g. "€55.00" */
  price: string
  duration_minutes: number
  image_url: string
  category: ServiceCategory
}

export interface GalleryItemDTO {
  id: string
  url: string
  caption: string
  order_index: number
}

/**
 * Services as rendered by booking/admin catalogs: the live API returns
 * ServiceDTO, while offline fallback lists only supply display fields.
 * `duration`/`image` are legacy aliases some render paths read alongside
 * the canonical `duration_minutes`/`image_url`.
 */
export type CatalogService = Pick<ServiceDTO, "id" | "title" | "category" | "price"> &
  Partial<ServiceDTO> & { duration?: number; image?: string }

/* ---------- Bookings ---------- */

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled"

/**
 * Frontend booking payload. Note that some legacy screens still read
 * `duration` / `image` aliases — prefer the `_minutes` / `_url` fields.
 */
export interface BookingDTO {
  id: string
  user_id: string
  service_id: string
  service_title: string
  service_price: string
  service_duration: number
  service_image_url?: string
  service_category?: string
  /** ISO-8601 (UTC) — salon-local times are converted via salonTimeToUtcIso() */
  booking_time: string
  status: BookingStatus
  notes?: string
  created_at: string
  user_name?: string
  user_email?: string
  user_phone?: string
  user_phone_verified?: boolean
}

export interface CreateBookingRequest {
  service_id: string
  booking_time: string
  notes?: string
}

/* ---------- Admin stats ---------- */

export interface DailyRevenuePoint {
  date: string
  short_date: string
  day_name: string
  revenue: number
  bookings_count: number
  manicure_revenue: number
  pedicure_revenue: number
  treatment_revenue: number
  top_service: string
  services_breakdown?: Record<string, number>
}

export interface CategoryRevenueSummary {
  category: string
  revenue: number
  bookings: number
  percentage: number
  color: string
}

export interface AdminStatsDTO {
  /** Pre-formatted currency strings straight from the Go backend. */
  total_revenue?: string
  past_30_days_revenue?: string
  avg_daily_revenue?: string
  total_bookings?: number
  today_bookings?: number
  confirmed_bookings?: number
  completed_bookings?: number
  cancelled_bookings?: number
  total_clients?: number
  daily_revenue?: DailyRevenuePoint[]
  category_breakdown?: CategoryRevenueSummary[]
  peak_day?: DailyRevenuePoint | null
}

/* ---------- Tickets / messaging ---------- */

export type TicketStatus = "open" | "in_progress" | "answered" | "resolved" | "closed"
export type TicketPriority = "low" | "normal" | "high" | "urgent"

export interface TicketMessageDTO {
  id: string
  ticket_id: string
  sender_id: string
  sender_name: string
  sender_email: string
  sender_role: UserRole
  message: string
  is_email_sent: boolean
  created_at: string
}

export interface TicketDTO {
  id: string
  user_id: string
  subject: string
  status: TicketStatus
  priority: TicketPriority
  created_at: string
  updated_at: string
  user_name?: string
  user_email?: string
  user_phone?: string
  messages?: TicketMessageDTO[]
}

/* ---------- Shared / misc ---------- */

/** The shape of every error envelope the Fiber API returns. */
export interface ApiError {
  error: string
}

/** Normalized error message extractor to replace `err: any` catch blocks. */
export function apiErrorMessage(err: unknown, fallback = "Something went wrong. Please try again."): string {
  if (
    typeof err === "object" &&
    err !== null &&
    "response" in err &&
    (err as { response?: { data?: ApiError } }).response?.data?.error
  ) {
    return (err as { response: { data: ApiError } }).response.data.error
  }
  return fallback
}
