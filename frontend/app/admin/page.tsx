"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  TrendingUp,
  Calendar as CalendarIcon,
  Clock,
  Users,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MoreVertical,
  Check,
  X,
  Search,
  Filter,
  ShieldCheck,
  Plus,
  Phone,
  Mail,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  Edit,
  Trash2,
  ArrowRight,
  MessageSquare,
  Send,
  Loader2,
} from "lucide-react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminGuard } from "@/components/admin/admin-guard"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminNewBookingDialog } from "@/components/admin/admin-new-booking-dialog"
import { AdminServiceDialog } from "@/components/admin/admin-service-dialog"
import { AdminRevenueChart } from "@/components/admin/admin-revenue-chart"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/lib/api"
import {
  apiErrorMessage,
  type AdminStatsDTO,
  type BookingDTO,
  type BookingStatus,
  type CatalogService,
  type TicketDTO,
  type UserDTO,
} from "@/lib/types"

const fallbackServices = [
  {
    id: "sig-manicure",
    title: "5th Avenue Signature Gel Manicure",
    category: "Manicure",
    price: "€55",
    duration: 60,
    image_url: "/images/hero_manicure.jpg",
    description: "Couture shaping, cuticle revival, BIAB fortification, and rich high-gloss gel finish.",
  },
  {
    id: "rose-pedicure",
    title: "Royal Rose Petal Spa Pedicure",
    category: "Pedicure",
    price: "€75",
    duration: 75,
    image_url: "/images/hero_pedicure.jpg",
    description: "Copper basin soak, fresh rose petals, volcanic pumice scrub, and nourishing balm massage.",
  },
  {
    id: "biab-extensions",
    title: "Japanese BIAB & 24k Gold Flakes",
    category: "Manicure",
    price: "€90",
    duration: 90,
    image_url: "/images/gallery_nail_art.jpg",
    description: "Sculpted builder gel overlays with hand-placed 24k gold foil accents.",
  },
  {
    id: "paraffin-treatment",
    title: "Warm Paraffin Wax Treatment & Polish",
    category: "Treatment",
    price: "€65",
    duration: 60,
    image_url: "/images/gallery_spa_hands.jpg",
    description: "Intensive deep-hydration thermal wax bath for silk-soft skin renewal.",
  },
  {
    id: "express-manicure",
    title: "Executive Express Manicure",
    category: "Manicure",
    price: "€40",
    duration: 45,
    image_url: "/images/gallery_french_chic.jpg",
    description: "Rapid nail care, buffer shine, and signature hand cream for busy professionals.",
  },
  {
    id: "herbal-foot-ritual",
    title: "Detoxifying Botanical Foot Ritual",
    category: "Pedicure",
    price: "€80",
    duration: 75,
    image_url: "/images/gallery_pedicure_care.jpg",
    description: "Organic eucalyptus and sea salt exfoliation followed by tension-release acupressure.",
  },
]

function AdminDashboardContent() {
  const router = useRouter()
  const [activeTab, setActiveTab] = React.useState("overview")
  const [bookings, setBookings] = React.useState<BookingDTO[]>([])
  const [clients, setClients] = React.useState<UserDTO[]>([])
  const [stats, setStats] = React.useState<AdminStatsDTO | null>(null)
  const [services, setServices] = React.useState<CatalogService[]>(fallbackServices)
  const [loading, setLoading] = React.useState(true)
  const [refreshing, setRefreshing] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [categoryFilter, setCategoryFilter] = React.useState("all")
  const [currentUser, setCurrentUser] = React.useState<UserDTO | { name: string; email: string } | null>(null)
  const [isNewBookingOpen, setIsNewBookingOpen] = React.useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false)
  const [statusUpdatingId, setStatusUpdatingId] = React.useState<string | null>(null)

  // Tickets Management State
  const [tickets, setTickets] = React.useState<TicketDTO[]>([])
  const [selectedTicketId, setSelectedTicketId] = React.useState<string | null>(null)
  const [ticketThread, setTicketThread] = React.useState<TicketDTO | null>(null)
  const [ticketReplyText, setTicketReplyText] = React.useState("")
  const [sendingTicketReply, setSendingTicketReply] = React.useState(false)
  const [ticketFilter, setTicketFilter] = React.useState("all")

  // Service CRUD Dialog State
  const [isServiceDialogOpen, setIsServiceDialogOpen] = React.useState(false)
  const [serviceToEdit, setServiceToEdit] = React.useState<CatalogService | null>(null)

  React.useEffect(() => {
    const rawUser = localStorage.getItem("user")
    if (rawUser) {
      try {
        setCurrentUser(JSON.parse(rawUser))
      } catch {
        setCurrentUser({ name: "Salon Administrator", email: "admin@5thavenue.ie" })
      }
    } else {
      setCurrentUser({ name: "Salon Administrator", email: "admin@5thavenue.ie" })
    }

    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setRefreshing(true)
    try {
      // 1. Fetch Admin Bookings
      try {
        const { data: bookingsData } = await api.get<BookingDTO[]>("/admin/bookings")
        if (bookingsData && Array.isArray(bookingsData)) {
          setBookings(bookingsData)
        }
      } catch (err) {
        console.warn("Using user bookings or fallback for admin", err)
        const { data: userBookings } = await api.get<BookingDTO[]>("/bookings/me")
        if (userBookings) setBookings(userBookings)
      }

      // 2. Fetch Admin Stats
      try {
        const { data: statsData } = await api.get<AdminStatsDTO>("/admin/stats")
        if (statsData) setStats(statsData)
      } catch (err) {
        console.warn("Could not fetch admin stats", err)
      }

      // 3. Fetch Clients
      try {
        const { data: clientsData } = await api.get<UserDTO[]>("/admin/clients")
        if (clientsData && Array.isArray(clientsData)) {
          setClients(clientsData)
        }
      } catch (err) {
        console.warn("Could not fetch clients list", err)
      }

      // 4. Fetch Services
      try {
        const { data: servicesData } = await api.get<CatalogService[]>("/services")
        if (servicesData && servicesData.length > 0) {
          setServices(servicesData)
        }
      } catch (err) {
        console.warn("Using fallback service catalog", err)
      }

      // 5. Fetch Tickets
      try {
        const { data: ticketsData } = await api.get<TicketDTO[]>("/tickets")
        if (ticketsData && Array.isArray(ticketsData)) {
          setTickets(ticketsData)
          if (ticketsData.length > 0 && !selectedTicketId) {
            handleOpenTicketThread(ticketsData[0].id)
          }
        }
      } catch (err) {
        console.warn("Could not fetch tickets list", err)
      }
    } catch (err) {
      console.warn("Error loading admin dashboard", err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm("Are you sure you wish to delete this service?")) return
    try {
      await api.delete(`/admin/services/${serviceId}`)
      loadDashboardData()
    } catch (err) {
      alert(apiErrorMessage(err, "Failed to delete service"))
    }
  }

  const handleOpenTicketThread = async (ticketId: string) => {
    setSelectedTicketId(ticketId)
    try {
      const { data } = await api.get<TicketDTO>(`/tickets/${ticketId}`)
      setTicketThread(data)
    } catch (err) {
      console.warn("Failed to fetch ticket thread", err)
    }
  }

  const handleAdminSendTicketReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTicketId || !ticketReplyText.trim()) return

    setSendingTicketReply(true)
    try {
      await api.post(`/tickets/${selectedTicketId}/messages`, {
        message: ticketReplyText.trim(),
      })
      setTicketReplyText("")
      const { data } = await api.get<TicketDTO>(`/tickets/${selectedTicketId}`)
      setTicketThread(data)
      const { data: ticketsData } = await api.get<TicketDTO[]>("/tickets")
      if (Array.isArray(ticketsData)) setTickets(ticketsData)
    } catch (err) {
      alert(apiErrorMessage(err, "Failed to send reply"))
    } finally {
      setSendingTicketReply(false)
    }
  }

  const handleToggleTicketStatus = async (ticketId: string, currentStatus: string) => {
    const newStatus = currentStatus === "closed" ? "open" : "closed"
    try {
      await api.patch(`/tickets/${ticketId}/status`, { status: newStatus })
      const { data } = await api.get<TicketDTO>(`/tickets/${ticketId}`)
      setTicketThread(data)
      const { data: ticketsData } = await api.get<TicketDTO[]>("/tickets")
      if (Array.isArray(ticketsData)) setTickets(ticketsData)
    } catch (err) {
      alert(apiErrorMessage(err, "Failed to update ticket status"))
    }
  }

  const handleUpdateStatus = async (bookingId: string, newStatus: BookingStatus) => {
    setStatusUpdatingId(bookingId)
    try {
      await api.patch(`/admin/bookings/${bookingId}/status`, { status: newStatus })
      // Optimistic update
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
      )
    } catch (err) {
      alert(apiErrorMessage(err, "Failed to update booking status"))
    } finally {
      setStatusUpdatingId(null)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    localStorage.removeItem("user")
    router.push("/login")
  }

  // Filtered Bookings
  const filteredBookings = React.useMemo(() => {
    return bookings.filter((b) => {
      // Search
      const query = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !query ||
        b.service_title?.toLowerCase().includes(query) ||
        b.user_name?.toLowerCase().includes(query) ||
        b.user_phone?.toLowerCase().includes(query) ||
        b.user_email?.toLowerCase().includes(query) ||
        b.notes?.toLowerCase().includes(query)

      // Status
      const matchesStatus = statusFilter === "all" || b.status === statusFilter

      // Category
      const matchesCategory =
        categoryFilter === "all" ||
        (categoryFilter === "manicure" && b.service_title?.toLowerCase().includes("manicure")) ||
        (categoryFilter === "pedicure" && b.service_title?.toLowerCase().includes("pedicure")) ||
        (categoryFilter === "treatment" &&
          (b.service_title?.toLowerCase().includes("treatment") ||
            b.service_title?.toLowerCase().includes("ritual")))

      return matchesSearch && matchesStatus && matchesCategory
    })
  }, [bookings, searchQuery, statusFilter, categoryFilter])

  // Today's Bookings
  const todayBookings = React.useMemo(() => {
    const now = new Date()
    const todayY = now.getFullYear()
    const todayM = now.getMonth()
    const todayD = now.getDate()

    return bookings.filter((b) => {
      const bDate = new Date(b.booking_time)
      return (
        bDate.getFullYear() === todayY &&
        bDate.getMonth() === todayM &&
        bDate.getDate() === todayD &&
        b.status !== "cancelled"
      )
    })
  }, [bookings])

  // Derived KPI Stats
  const kpiTotalRevenue = stats?.total_revenue || "€2,480.00"
  const kpiTotalBookings = stats?.total_bookings || bookings.length
  const kpiTodayBookings = stats?.today_bookings || todayBookings.length
  const kpiTotalClients = stats?.total_clients || (clients.length > 0 ? clients.length : 12)

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Desktop & Mobile Sidebar */}
      <div className={`${mobileSidebarOpen ? "block fixed inset-0 z-50 lg:relative" : "hidden lg:block"}`}>
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}
        <div className="relative z-50 h-full">
          <AdminSidebar
            activeTab={activeTab}
            setActiveTab={(tab) => {
              setActiveTab(tab)
              setMobileSidebarOpen(false)
            }}
            currentUser={currentUser}
            onLogout={handleLogout}
            totalBookingsCount={bookings.length}
            todayBookingsCount={todayBookings.length}
            totalClientsCount={kpiTotalClients}
            openTicketsCount={tickets.filter((t) => t.status === "open").length}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Header Bar */}
        <AdminHeader
          activeTabTitle={
            activeTab === "overview"
              ? "Sanctuary Overview"
              : activeTab === "appointments"
              ? "Appointments & Bookings"
              : activeTab === "schedule"
              ? "Today's Schedule"
              : activeTab === "clients"
              ? "Client Directory"
              : activeTab === "tickets"
              ? "Tickets & Inquiries"
              : "Treatment Catalog"
          }
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onNewBookingClick={() => setIsNewBookingOpen(true)}
          onRefreshClick={loadDashboardData}
          isRefreshing={refreshing}
          onToggleMobileSidebar={() => setMobileSidebarOpen((o) => !o)}
        />

        {/* Dynamic Tab Body */}
        <main className="p-4 md:p-8 flex-1 space-y-8 max-w-7xl w-full mx-auto">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              {/* Executive KPI Summary Cards (shadcnblocks dashboard-18 style) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Metric 1: Revenue */}
                <Card className="rounded-3xl border-border/70 bg-card shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground font-medium">Total Salon Revenue</span>
                      <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-2xl font-serif font-bold text-foreground">{kpiTotalRevenue}</h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Badge variant="gold" className="text-[10px] px-1.5 py-0">
                          +18.4%
                        </Badge>
                        <span className="text-[11px] text-muted-foreground">vs last month</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Metric 2: Total Bookings */}
                <Card className="rounded-3xl border-border/70 bg-card shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground font-medium">Total Reservations</span>
                      <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                        <CalendarIcon className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-2xl font-serif font-bold text-foreground">{kpiTotalBookings}</h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Badge variant="success" className="text-[10px] px-1.5 py-0">
                          94% Confirmed
                        </Badge>
                        <span className="text-[11px] text-muted-foreground">Fulfillment</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Metric 3: Today's Schedule */}
                <Card className="rounded-3xl border-border/70 bg-card shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground font-medium">Today&apos;s Sanctuary Sessions</span>
                      <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
                        <Clock className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-2xl font-serif font-bold text-foreground">{kpiTodayBookings} Booked</h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[11px] text-muted-foreground">Open until 20:00 tonight</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Metric 4: Reputation & Clients */}
                <Card className="rounded-3xl border-border/70 bg-card shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground font-medium">Google Rating</span>
                      <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                        <Sparkles className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-2xl font-serif font-bold text-foreground">4.9 ★</h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[11px] text-muted-foreground">From 1,755 Dublin reviews</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Daily Revenue Analytics Chart (Past 30 Days from Database) */}
              <AdminRevenueChart
                dailyData={stats?.daily_revenue}
                categoryData={stats?.category_breakdown}
                past30DaysRevenue={stats?.past_30_days_revenue}
                avgDailyRevenue={stats?.avg_daily_revenue}
                peakDay={stats?.peak_day}
              />

              {/* Full-Width Recent Salon Reservations */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-serif font-semibold text-foreground">
                      Recent Salon Reservations
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Latest appointments scheduled through 5th Avenue Concierge
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab("appointments")}
                    className="text-xs font-semibold text-primary"
                  >
                    <span>View All ({bookings.length})</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>

                <Card className="rounded-3xl border-border/70 shadow-sm overflow-hidden bg-card">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-muted/40 border-b border-border/60 text-muted-foreground uppercase text-[10px] tracking-wider">
                        <tr>
                          <th className="p-4">Client</th>
                          <th className="p-4">Treatment</th>
                          <th className="p-4">Scheduled</th>
                          <th className="p-4">Price</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {bookings.slice(0, 8).map((b) => {
                          const dateObj = new Date(b.booking_time)
                          const dateStr = dateObj.toLocaleDateString("en-IE", {
                            month: "short",
                            day: "numeric",
                          })
                          const timeStr = dateObj.toLocaleTimeString("en-IE", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })

                          return (
                            <tr key={b.id} className="hover:bg-muted/20 transition-colors">
                              <td className="p-4 font-medium">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">
                                    {b.user_name ? b.user_name[0].toUpperCase() : "C"}
                                  </div>
                                  <div>
                                    <p className="text-foreground font-semibold">{b.user_name || "Valued Client"}</p>
                                    <p className="text-[10px] text-muted-foreground">{b.user_phone || b.user_email || "No phone"}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 text-muted-foreground">{b.service_title}</td>
                              <td className="p-4">
                                <span className="font-semibold text-foreground">{dateStr}</span> at {timeStr}
                              </td>
                              <td className="p-4 font-serif font-semibold text-primary">{b.service_price}</td>
                              <td className="p-4">
                                <Badge
                                  variant={
                                    b.status === "confirmed"
                                      ? "success"
                                      : b.status === "completed"
                                      ? "secondary"
                                      : "destructive"
                                  }
                                  className="text-[10px] capitalize px-2 py-0.5"
                                >
                                  {b.status}
                                </Badge>
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {b.status !== "completed" && b.status !== "cancelled" && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleUpdateStatus(b.id, "completed")}
                                      disabled={statusUpdatingId === b.id}
                                      className="h-7 text-[10px] rounded-lg px-2"
                                    >
                                      Complete
                                    </Button>
                                  )}
                                  {b.status !== "cancelled" && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleUpdateStatus(b.id, "cancelled")}
                                      disabled={statusUpdatingId === b.id}
                                      className="h-7 text-[10px] rounded-lg px-2 text-destructive hover:bg-destructive/10"
                                    >
                                      Cancel
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            </motion.div>
          )}

          {/* TAB 2: APPOINTMENTS (FULL DATA TABLE) */}
          {activeTab === "appointments" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Filter Toolbar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Status Pills */}
                <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-2xl border border-border/60">
                  {["all", "confirmed", "completed", "cancelled"].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all ${
                        statusFilter === st
                          ? "bg-card text-foreground shadow-xs font-semibold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {st} ({st === "all" ? bookings.length : bookings.filter((b) => b.status === st).length})
                    </button>
                  ))}
                </div>

                {/* Category Filter */}
                <div className="flex items-center gap-2">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="h-10 px-3 text-xs rounded-xl bg-card border border-border/70 text-foreground"
                  >
                    <option value="all">All Treatment Types</option>
                    <option value="manicure">Manicure Treatments</option>
                    <option value="pedicure">Pedicure Rituals</option>
                    <option value="treatment">Therapeutic Care</option>
                  </select>
                </div>
              </div>

              {/* Master Table */}
              <Card className="rounded-3xl border-border/70 shadow-sm overflow-hidden bg-card">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/40 border-b border-border/60 text-muted-foreground uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="p-4">Client Information</th>
                        <th className="p-4">Treatment</th>
                        <th className="p-4">Date & Time</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Special Notes</th>
                        <th className="p-4 text-right">Status Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {filteredBookings.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-12 text-center text-muted-foreground text-xs">
                            No reservations found matching current search or filters.
                          </td>
                        </tr>
                      ) : (
                        filteredBookings.map((b) => {
                          const dateObj = new Date(b.booking_time)
                          const dateStr = dateObj.toLocaleDateString("en-IE", {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                          const timeStr = dateObj.toLocaleTimeString("en-IE", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })

                          return (
                            <tr key={b.id} className="hover:bg-muted/20 transition-colors">
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center font-bold text-xs">
                                    {b.user_name ? b.user_name[0].toUpperCase() : "C"}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <p className="font-semibold text-foreground">{b.user_name || "Valued Client"}</p>
                                      {b.user_phone_verified && (
                                        <span title="Verified Phone">
                                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-muted-foreground">{b.user_phone || b.user_email || "No direct phone"}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4">
                                <p className="font-semibold text-foreground">{b.service_title}</p>
                                <p className="text-[10px] text-muted-foreground">{b.service_duration} minutes session</p>
                              </td>
                              <td className="p-4">
                                <p className="font-medium text-foreground">{dateStr}</p>
                                <p className="text-[11px] text-muted-foreground">{timeStr}</p>
                              </td>
                              <td className="p-4 font-serif font-bold text-primary text-sm">{b.service_price}</td>
                              <td className="p-4">
                                <Badge
                                  variant={
                                    b.status === "confirmed"
                                      ? "success"
                                      : b.status === "completed"
                                      ? "secondary"
                                      : "destructive"
                                  }
                                  className="text-[10px] capitalize px-2.5 py-0.5"
                                >
                                  {b.status}
                                </Badge>
                              </td>
                              <td className="p-4 max-w-[200px] truncate text-muted-foreground text-[11px]">
                                {b.notes || "None"}
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {b.status === "pending" && (
                                    <Button
                                      variant="luxury"
                                      size="sm"
                                      onClick={() => handleUpdateStatus(b.id, "confirmed")}
                                      disabled={statusUpdatingId === b.id}
                                      className="h-7 text-[10px] rounded-lg px-2.5"
                                    >
                                      Confirm
                                    </Button>
                                  )}
                                  {b.status !== "completed" && b.status !== "cancelled" && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleUpdateStatus(b.id, "completed")}
                                      disabled={statusUpdatingId === b.id}
                                      className="h-7 text-[10px] rounded-lg px-2.5"
                                    >
                                      Complete
                                    </Button>
                                  )}
                                  {b.status !== "cancelled" && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleUpdateStatus(b.id, "cancelled")}
                                      disabled={statusUpdatingId === b.id}
                                      className="h-7 text-[10px] rounded-lg px-2 text-destructive hover:bg-destructive/10"
                                    >
                                      Cancel
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </motion.div>
          )}

          {/* TAB 3: TODAY'S SCHEDULE BOARD */}
          {activeTab === "schedule" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-serif font-semibold text-foreground">
                    Today&apos;s Salon Station Schedule
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Timeline view for Dublin Clarendon Street therapists and suites
                  </p>
                </div>
                <Badge variant="gold">
                  {todayBookings.length} Active Sessions Today
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  "09:30", "10:30", "11:30", "12:45", "14:00", "15:15", "16:30", "17:45", "19:00"
                ].map((slot) => {
                  const match = todayBookings.find((b) => {
                    const timeStr = new Date(b.booking_time).toLocaleTimeString("en-IE", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                    return timeStr === slot
                  })

                  return (
                    <Card
                      key={slot}
                      className={`rounded-2xl border transition-all p-4 ${
                        match
                          ? "border-primary/50 bg-primary/5 shadow-sm"
                          : "border-border/60 bg-card opacity-80"
                      }`}
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-border/40">
                        <span className="font-serif font-bold text-sm text-primary flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{slot}</span>
                        </span>
                        <Badge variant={match ? "gold" : "outline"} className="text-[10px]">
                          {match ? "Occupied" : "Station Available"}
                        </Badge>
                      </div>

                      <div className="mt-3 text-xs space-y-1">
                        {match ? (
                          <>
                            <p className="font-semibold text-foreground text-sm">{match.user_name || "Client"}</p>
                            <p className="text-muted-foreground">{match.service_title}</p>
                            <div className="flex items-center justify-between pt-2 text-[11px]">
                              <span className="text-muted-foreground">{match.user_phone || "Contact at Salon"}</span>
                              <span className="font-semibold text-primary">{match.service_price}</span>
                            </div>
                          </>
                        ) : (
                          <div className="py-2 text-center text-muted-foreground">
                            <span className="text-[11px] block">Open for walk-in appointment</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setIsNewBookingOpen(true)}
                              className="text-xs text-primary font-semibold mt-1 h-7"
                            >
                              + Assign Client
                            </Button>
                          </div>
                        )}
                      </div>
                    </Card>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* TAB 4: CLIENT DIRECTORY */}
          {activeTab === "clients" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-serif font-semibold text-foreground">
                    Registered Client Directory
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Click any client to open their dossier, view reservation history, cancel orders, or dispatch emails
                  </p>
                </div>
                <Badge variant="gold" className="text-xs font-serif">
                  {(clients.length > 0 ? clients.length : 3)} Clients
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(clients.length > 0 ? clients : [
                  { id: "1", name: "Eleanor Vance", phone: "+353 87 123 4567", phone_verified: true, email: "eleanor@example.ie", role: "customer" },
                  { id: "2", name: "Claire Byrne", phone: "+353 86 987 6543", phone_verified: true, email: "claire@dublin.ie", role: "customer" },
                  { id: "3", name: "Sophie Martin", phone: "+353 85 456 7890", phone_verified: false, email: "sophie@beauty.ie", role: "customer" },
                ]).map((c) => (
                  <Card
                    key={c.id}
                    className="rounded-3xl border-border/70 p-5 bg-card space-y-4 hover:border-primary/60 hover:shadow-lg transition-all group flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-primary/15 text-primary flex items-center justify-center font-serif text-base font-bold border border-primary/20">
                            {c.name ? c.name[0].toUpperCase() : "C"}
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
                              {c.name}
                            </h4>
                            <Badge variant="outline" className="text-[10px] capitalize">
                              {c.role}
                            </Badge>
                          </div>
                        </div>
                        {c.phone_verified && (
                          <Badge variant="success" className="text-[9px] px-1.5 py-0.5">
                            Verified
                          </Badge>
                        )}
                      </div>

                      <div className="text-xs space-y-1.5 text-muted-foreground pt-2 border-t border-border/50">
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-primary" />
                          <span>{c.phone || "No phone recorded"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-primary" />
                          <span className="truncate">{c.email || "No email"}</span>
                        </div>
                      </div>
                    </div>

                    <Link href={`/admin/clients/${c.id}`} className="w-full pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full h-9 rounded-xl text-xs font-semibold justify-between border-primary/30 hover:bg-primary/10 group-hover:border-primary"
                      >
                        <span>View Orders & Dispatch Email</span>
                        <ArrowRight className="w-3.5 h-3.5 text-primary group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 5: TICKETS & INQUIRIES */}
          {activeTab === "tickets" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-serif font-semibold text-foreground">
                    Client Inquiries & Direct Messaging
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Bi-directional communication hub with automated luxury HTML email dispatch
                  </p>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 p-1 bg-muted/40 rounded-2xl border border-border/60">
                  {["all", "open", "answered", "closed"].map((status) => (
                    <button
                      key={status}
                      onClick={() => setTicketFilter(status)}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize transition-all ${
                        ticketFilter === status
                          ? "bg-card text-foreground shadow-xs border border-border/60"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2-Column Tickets Interface */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Tickets List (5 Columns) */}
                <div className="lg:col-span-5 space-y-3">
                  {tickets
                    .filter((t) => ticketFilter === "all" || t.status === ticketFilter)
                    .map((t) => (
                      <Card
                        key={t.id}
                        onClick={() => handleOpenTicketThread(t.id)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                          selectedTicketId === t.id
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border/60 hover:bg-muted/20"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-foreground truncate max-w-[200px]">
                            {t.subject}
                          </span>
                          <Badge
                            variant={
                              t.status === "open"
                                ? "gold"
                                : t.status === "answered"
                                ? "success"
                                : "outline"
                            }
                            className="text-[9px] uppercase font-semibold"
                          >
                            {t.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between pt-2 text-[11px] text-muted-foreground">
                          <span className="font-medium text-foreground">{t.user_name || "Client"}</span>
                          <Badge variant="outline" className="text-[9px] capitalize">
                            {t.priority}
                          </Badge>
                        </div>
                        <span className="text-[10px] text-muted-foreground/80 block mt-1">
                          {new Date(t.updated_at).toLocaleString("en-IE", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </Card>
                    ))}

                  {tickets.length === 0 && (
                    <Card className="p-8 text-center text-muted-foreground rounded-2xl border-border/60">
                      <MessageSquare className="w-8 h-8 mx-auto opacity-30 mb-2" />
                      <p className="text-xs">No customer inquiries found.</p>
                    </Card>
                  )}
                </div>

                {/* Conversation Thread & Response Composer (7 Columns) */}
                <div className="lg:col-span-7">
                  {ticketThread ? (
                    <Card className="rounded-3xl border-border/80 p-6 bg-card space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-border/50">
                        <div>
                          <h3 className="font-serif font-bold text-base text-foreground">
                            {ticketThread.subject}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                            <span>Client: <strong>{ticketThread.user_name}</strong></span>
                            {ticketThread.user_email && <span>({ticketThread.user_email})</span>}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge variant="gold" className="text-[10px] capitalize">
                            {ticketThread.priority}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleTicketStatus(ticketThread.id, ticketThread.status)}
                            className="h-7 text-xs rounded-xl"
                          >
                            {ticketThread.status === "closed" ? "Reopen Ticket" : "Close Ticket"}
                          </Button>
                        </div>
                      </div>

                      {/* Messages Thread */}
                      <div className="space-y-3 min-h-[250px] max-h-[400px] overflow-y-auto pr-2">
                        {ticketThread.messages?.map((m) => (
                          <div
                            key={m.id}
                            className={`p-3 rounded-2xl ${
                              m.sender_role === "admin"
                                ? "bg-primary/15 ml-8 border border-primary/25"
                                : "bg-muted/40 mr-8 border border-border/60"
                            }`}
                          >
                            <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                              <span className="font-semibold text-foreground">
                                {m.sender_role === "admin" ? "Salon Management" : m.sender_name || "Client"}
                              </span>
                              <span>
                                {new Date(m.created_at).toLocaleTimeString("en-IE", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                            <p className="text-xs text-foreground leading-relaxed">{m.message}</p>
                            {m.is_email_sent && (
                              <span className="text-[10px] text-primary flex items-center gap-1 mt-1 font-medium">
                                <CheckCircle2 className="w-3 h-3" />
                                Email notification sent to client
                              </span>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Reply Box */}
                      <form onSubmit={handleAdminSendTicketReply} className="pt-2 border-t border-border/50 space-y-2">
                        <Textarea
                          rows={3}
                          value={ticketReplyText}
                          onChange={(e) => setTicketReplyText(e.target.value)}
                          placeholder="Type your response to the client... (dispatches luxury HTML email)"
                          className="rounded-2xl text-xs bg-background"
                          required
                        />
                        <div className="flex justify-end">
                          <Button
                            type="submit"
                            variant="luxury"
                            size="sm"
                            disabled={sendingTicketReply || !ticketReplyText.trim()}
                            className="rounded-xl text-xs gap-1.5 shadow-sm min-w-[140px]"
                          >
                            {sendingTicketReply ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Sending Email...</span>
                              </>
                            ) : (
                              <>
                                <Send className="w-3.5 h-3.5" />
                                <span>Send & Email Client</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </form>
                    </Card>
                  ) : (
                    <Card className="rounded-3xl border-border/60 p-12 text-center text-muted-foreground">
                      <MessageSquare className="w-10 h-10 mx-auto opacity-30 mb-2" />
                      <p className="text-sm font-serif">Select an inquiry to review messages and respond.</p>
                    </Card>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 6: TREATMENT CATALOG (WITH ADMIN CRUD) */}
          {activeTab === "services" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-serif font-semibold text-foreground">
                    Salon Treatment & Service Menu
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Customize prices, durations, descriptions, and photography for 45 Clarendon Street
                  </p>
                </div>
                <Button
                  variant="luxury"
                  size="sm"
                  onClick={() => {
                    setServiceToEdit(null)
                    setIsServiceDialogOpen(true)
                  }}
                  className="rounded-xl text-xs gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add New Treatment</span>
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((s) => (
                  <Card key={s.id} className="rounded-3xl border-border/70 overflow-hidden bg-card shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                    <div>
                      <div className="relative h-40 w-full bg-muted">
                        <Image
                          src={s.image_url || s.image || "/images/hero_manicure.jpg"}
                          alt={s.title}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute top-3 right-3">
                          <Badge variant="gold" className="text-xs font-bold font-serif shadow-md">
                            {s.price}
                          </Badge>
                        </div>
                      </div>
                      <CardHeader className="p-5 pb-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-primary">
                          {s.category}
                        </span>
                        <CardTitle className="text-base font-serif font-bold">{s.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-5 pt-0 space-y-2 text-xs text-muted-foreground">
                        <p className="line-clamp-2">{s.description}</p>
                        <div className="flex items-center gap-2 pt-2 text-foreground font-medium">
                          <Clock className="w-3.5 h-3.5 text-primary" />
                          <span>{s.duration || s.duration_minutes} minutes duration</span>
                        </div>
                      </CardContent>
                    </div>

                    <CardFooter className="p-5 pt-0 border-t border-border/40 flex items-center justify-between gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setServiceToEdit(s)
                          setIsServiceDialogOpen(true)
                        }}
                        className="h-8 rounded-xl text-xs gap-1 flex-1"
                      >
                        <Edit className="w-3 h-3 text-primary" />
                        <span>Edit</span>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteService(s.id)}
                        className="h-8 rounded-xl text-xs px-2.5"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}
        </main>
      </div>

      {/* Admin New Reservation Dialog */}
      <AdminNewBookingDialog
        isOpen={isNewBookingOpen}
        onClose={() => setIsNewBookingOpen(false)}
        onBookingCreated={loadDashboardData}
        services={services}
      />

      {/* Admin Service Creation & Edit Dialog */}
      <AdminServiceDialog
        isOpen={isServiceDialogOpen}
        onClose={() => setIsServiceDialogOpen(false)}
        onSaved={loadDashboardData}
        serviceToEdit={serviceToEdit}
      />
    </div>
  )
}

export default function AdminDashboardPage() {
  return (
    <AdminGuard>
      <AdminDashboardContent />
    </AdminGuard>
  )
}
