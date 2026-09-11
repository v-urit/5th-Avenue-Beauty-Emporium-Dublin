import { InternalAxiosRequestConfig, AxiosResponse } from "axios"
import {
  MockStore,
  MOCK_ADMIN_USER,
  MOCK_CLIENT_USER,
} from "./mock-data"
import { AuthResponse, BookingStatus, CatalogService, TicketPriority, TicketStatus, UserDTO } from "./types"

/**
 * Checks whether demo mode is actively enabled.
 * True by default on Vercel or when running with localhost / demo token.
 */
export function isDemoActive(): boolean {
  if (typeof window === "undefined") return false

  // 1. Explicit env flag
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") return true

  // 2. LocalStorage override
  const storedFlag = localStorage.getItem("demo_mode")
  if (storedFlag === "true") return true

  // 3. Demo token active
  const token = localStorage.getItem("access_token")
  if (token && token.startsWith("demo-token-")) return true

  // 4. Default to demo mode if deployed on Vercel or any non-localhost host without a real backend configured
  const hostname = window.location.hostname
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || ""
  if (
    hostname.includes("vercel.app") ||
    !apiUrl ||
    apiUrl.includes("localhost") ||
    apiUrl.includes("127.0.0.1")
  ) {
    return true
  }

  return false
}

export function setDemoActive(active: boolean) {
  if (typeof window !== "undefined") {
    localStorage.setItem("demo_mode", active ? "true" : "false")
  }
}

/**
 * Resolves an Axios response for the intercepted route
 */
function createMockResponse<T>(config: InternalAxiosRequestConfig, data: T, status = 200): AxiosResponse<T> {
  return {
    data,
    status,
    statusText: status === 200 ? "OK" : "Created",
    headers: {},
    config,
  }
}

/**
 * Intercepts Axios requests and satisfies them from the MockStore.
 */
export async function handleMockRequest(config: InternalAxiosRequestConfig): Promise<AxiosResponse | null> {
  const url = config.url || ""
  const method = (config.method || "get").toLowerCase()

  // Clean path (strip base URL if present)
  let path = url
  if (path.startsWith("http://") || path.startsWith("https://")) {
    try {
      const parsed = new URL(path)
      path = parsed.pathname
    } catch {}
  }
  // Strip /api prefix if included
  if (path.startsWith("/api")) {
    path = path.slice(4)
  }
  if (!path.startsWith("/")) {
    path = "/" + path
  }

  // Parse body
  let body: Record<string, any> = {}
  if (config.data) {
    if (typeof config.data === "string") {
      try {
        body = JSON.parse(config.data)
      } catch {
        body = {}
      }
    } else if (typeof config.data === "object") {
      body = config.data
    }
  }

  // Determine active user
  let currentUser: UserDTO = MOCK_CLIENT_USER
  if (typeof window !== "undefined") {
    const raw = localStorage.getItem("user")
    if (raw) {
      try {
        currentUser = JSON.parse(raw)
      } catch {}
    }
  }

  // Optional micro-delay (70ms) to feel natural
  await new Promise((res) => setTimeout(res, 70))

  /* ---------------- Auth Endpoints ---------------- */
  if (path === "/auth/login" && method === "post") {
    const email = (body.email || "").toLowerCase()
    const isAdmin = email.includes("admin") || body.role === "admin"
    const user = isAdmin ? MOCK_ADMIN_USER : MOCK_CLIENT_USER

    const authData: AuthResponse = {
      access_token: `demo-token-${user.role}-${Date.now()}`,
      refresh_token: `demo-refresh-${Date.now()}`,
      user,
    }
    return createMockResponse(config, authData)
  }

  if (path === "/auth/register" && method === "post") {
    const newUser: UserDTO = {
      id: `client-${Date.now()}`,
      name: body.name || "Valued Client",
      email: body.email || "client@dublinluxury.ie",
      phone: body.phone || "+353871234567",
      phone_verified: true,
      role: "customer",
    }
    // Register in mock clients
    MockStore.updateClient(newUser.id, {
      ...newUser,
      created_at: new Date().toISOString(),
    })

    const authData: AuthResponse = {
      access_token: `demo-token-customer-${Date.now()}`,
      refresh_token: `demo-refresh-${Date.now()}`,
      user: newUser,
    }
    return createMockResponse(config, authData)
  }

  if (path === "/auth/otp/send" && method === "post") {
    return createMockResponse(config, { message: "6-digit OTP dispatched to mobile (+353)" })
  }

  if (path === "/auth/otp/verify" && method === "post") {
    const user = MOCK_CLIENT_USER
    const authData: AuthResponse = {
      access_token: `demo-token-customer-${Date.now()}`,
      refresh_token: `demo-refresh-${Date.now()}`,
      user,
    }
    return createMockResponse(config, authData)
  }

  /* ---------------- User Profile ---------------- */
  if (path === "/user/profile") {
    if (method === "get") {
      return createMockResponse(config, currentUser)
    }
    if (method === "patch" || method === "put") {
      const updatedUser: UserDTO = {
        ...currentUser,
        name: body.name || currentUser.name,
        phone: body.phone || currentUser.phone,
        phone_verified: true,
      }
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(updatedUser))
      }
      MockStore.updateClient(currentUser.id, updatedUser)
      return createMockResponse(config, updatedUser)
    }
  }

  /* ---------------- Services ---------------- */
  if (path === "/services" && method === "get") {
    return createMockResponse(config, MockStore.getServices())
  }

  if (path === "/admin/services" && method === "post") {
    const created = MockStore.saveService(body as CatalogService)
    return createMockResponse(config, created)
  }

  const adminServiceMatch = path.match(/^\/admin\/services\/([^/]+)$/)
  if (adminServiceMatch) {
    const serviceId = adminServiceMatch[1]
    if (method === "patch" || method === "put") {
      const updated = MockStore.saveService({ id: serviceId, ...body } as CatalogService)
      return createMockResponse(config, updated)
    }
    if (method === "delete") {
      MockStore.deleteService(serviceId)
      return createMockResponse(config, { message: "Service successfully removed" })
    }
  }

  /* ---------------- Bookings ---------------- */
  if (path === "/bookings/me" && method === "get") {
    const bookings = MockStore.getUserBookings(currentUser.id)
    return createMockResponse(config, bookings)
  }

  if (path === "/bookings" && method === "post") {
    const booking = MockStore.createBooking({
      ...body,
      user_id: currentUser.id,
      user_name: currentUser.name,
      user_email: currentUser.email,
      user_phone: currentUser.phone,
    })
    return createMockResponse(config, booking, 201)
  }

  const cancelBookingMatch = path.match(/^\/bookings\/([^/]+)\/cancel$/)
  if (cancelBookingMatch && method === "patch") {
    const bookingId = cancelBookingMatch[1]
    const updated = MockStore.updateBookingStatus(bookingId, "cancelled")
    return createMockResponse(config, updated)
  }

  if (path === "/admin/bookings" && method === "get") {
    return createMockResponse(config, MockStore.getBookings())
  }

  const adminBookingStatusMatch = path.match(/^\/admin\/bookings\/([^/]+)\/status$/)
  if (adminBookingStatusMatch && method === "patch") {
    const bookingId = adminBookingStatusMatch[1]
    const updated = MockStore.updateBookingStatus(bookingId, body.status as BookingStatus)
    return createMockResponse(config, updated)
  }

  /* ---------------- Admin Stats ---------------- */
  if (path === "/admin/stats" && method === "get") {
    return createMockResponse(config, MockStore.getStats())
  }

  /* ---------------- Clients ---------------- */
  if (path === "/admin/clients" && method === "get") {
    return createMockResponse(config, MockStore.getClients())
  }

  const clientDetailMatch = path.match(/^\/admin\/clients\/([^/]+)$/)
  if (clientDetailMatch) {
    const clientId = clientDetailMatch[1]
    if (method === "get") {
      const client = MockStore.getClientById(clientId) || {
        ...MOCK_CLIENT_USER,
        id: clientId,
        created_at: new Date().toISOString(),
      }
      return createMockResponse(config, client)
    }
    if (method === "patch" || method === "put") {
      const updated = MockStore.updateClient(clientId, body)
      return createMockResponse(config, updated)
    }
  }

  const clientBookingsMatch = path.match(/^\/admin\/clients\/([^/]+)\/bookings$/)
  if (clientBookingsMatch) {
    const clientId = clientBookingsMatch[1]
    if (method === "get") {
      return createMockResponse(config, MockStore.getUserBookings(clientId))
    }
    if (method === "post") {
      const client = MockStore.getClientById(clientId)
      const booking = MockStore.createBooking({
        ...body,
        user_id: clientId,
        user_name: client?.name,
        user_email: client?.email,
        user_phone: client?.phone,
      })
      return createMockResponse(config, booking, 201)
    }
  }

  /* ---------------- Tickets ---------------- */
  if (path === "/tickets" && method === "get") {
    if (currentUser.role === "admin") {
      return createMockResponse(config, MockStore.getTickets())
    } else {
      return createMockResponse(config, MockStore.getUserTickets(currentUser.id))
    }
  }

  if (path === "/tickets" && method === "post") {
    const newTicket = MockStore.createTicket({
      subject: body.subject || "Appointment Inquiry",
      priority: (body.priority as TicketPriority) || "normal",
      message: body.message || "",
      user: currentUser,
    })
    return createMockResponse(config, newTicket, 201)
  }

  const ticketDetailMatch = path.match(/^\/tickets\/([^/]+)$/)
  if (ticketDetailMatch && method === "get") {
    const ticketId = ticketDetailMatch[1]
    const ticket = MockStore.getTicketById(ticketId)
    return createMockResponse(config, ticket)
  }

  const ticketMessagesMatch = path.match(/^\/tickets\/([^/]+)\/messages$/)
  if (ticketMessagesMatch && method === "post") {
    const ticketId = ticketMessagesMatch[1]
    const newMsg = MockStore.addTicketMessage(ticketId, body.message, currentUser.role === "admin" ? "admin" : "customer")
    return createMockResponse(config, newMsg, 201)
  }

  const ticketStatusMatch = path.match(/^\/tickets\/([^/]+)\/status$/)
  if (ticketStatusMatch && method === "patch") {
    const ticketId = ticketStatusMatch[1]
    const updated = MockStore.updateTicketStatus(ticketId, body.status as TicketStatus)
    return createMockResponse(config, updated)
  }

  // Not matched
  return null
}
