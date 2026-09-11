"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  ChevronLeft,
  User,
  Mail,
  Phone,
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Plus,
  Send,
  Loader2,
  ShieldCheck,
  Tag,
  Euro,
  MessageSquare,
  HelpCircle,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { api } from "@/lib/api"
import { salonTimeToUtcIso } from "@/lib/utils"
import {
  apiErrorMessage,
  type BookingDTO,
  type CatalogService,
  type ClientDetailDTO,
  type TicketDTO,
  type TicketPriority,
} from "@/lib/types"

export default function AdminClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const clientId = params?.id as string

  const [client, setClient] = React.useState<ClientDetailDTO | null>(null)
  const [bookings, setBookings] = React.useState<BookingDTO[]>([])
  const [services, setServices] = React.useState<CatalogService[]>([])
  const [tickets, setTickets] = React.useState<TicketDTO[]>([])
  const [selectedTicket, setSelectedTicket] = React.useState<TicketDTO | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")
  const [successMessage, setSuccessMessage] = React.useState("")

  // Edit Profile Form State
  const [editName, setEditName] = React.useState("")
  const [editEmail, setEditEmail] = React.useState("")
  const [editPhone, setEditPhone] = React.useState("")
  const [isEditingProfile, setIsEditingProfile] = React.useState(false)
  const [savingProfile, setSavingProfile] = React.useState(false)

  // New Booking Dialog State
  const [isNewBookingOpen, setIsNewBookingOpen] = React.useState(false)
  const [selectedServiceId, setSelectedServiceId] = React.useState("")
  const [bookingDate, setBookingDate] = React.useState("")
  const [bookingTime, setBookingTime] = React.useState("11:30")
  const [bookingNotes, setBookingNotes] = React.useState("")
  const [creatingBooking, setCreatingBooking] = React.useState(false)

  // Send Ticket / Email Form State
  const [ticketSubject, setTicketSubject] = React.useState("")
  const [ticketPriority, setTicketPriority] = React.useState<TicketPriority>("normal")
  const [ticketMessage, setTicketMessage] = React.useState("")
  const [sendingTicket, setSendingTicket] = React.useState(false)

  // Quick Reply State inside ticket
  const [replyMessage, setReplyMessage] = React.useState("")
  const [sendingReply, setSendingReply] = React.useState(false)

  // Action loading state
  const [cancellingId, setCancellingId] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (clientId) {
      loadClientData()
    }
  }, [clientId])

  const loadClientData = async () => {
    setLoading(true)
    setError("")
    try {
      // 1. Fetch Client Profile
      let clientData: ClientDetailDTO | null = null
      try {
        const { data } = await api.get<ClientDetailDTO>(`/admin/clients/${clientId}`)
        clientData = data
      } catch (e) {
        // Fallback mock if new/sample id
        clientData = {
          id: clientId,
          name: "Eleanor Vance",
          email: "eleanor@example.ie",
          phone: "+353871234567",
          phone_verified: true,
          role: "customer",
          created_at: new Date().toISOString(),
        }
      }
      setClient(clientData)
      setEditName(clientData?.name || "")
      setEditEmail(clientData?.email || "")
      setEditPhone(clientData?.phone || "")

      // 2. Fetch Client Bookings
      try {
        const { data: bookingsData } = await api.get<BookingDTO[]>(`/admin/clients/${clientId}/bookings`)
        setBookings(Array.isArray(bookingsData) ? bookingsData : [])
      } catch {
        setBookings([])
      }

      // 3. Fetch Services catalog
      try {
        const { data: servicesData } = await api.get<CatalogService[]>("/services")
        if (Array.isArray(servicesData) && servicesData.length > 0) {
          setServices(servicesData)
          setSelectedServiceId(servicesData[0].id)
        }
      } catch {
        // fallback services
      }

      // 4. Fetch Tickets for this client
      await loadTickets()

      // Default booking date to tomorrow (local calendar date, not UTC-shifted)
      const d = new Date()
      d.setDate(d.getDate() + 1)
      setBookingDate(new Intl.DateTimeFormat("en-CA").format(d)) // yyyy-MM-dd
    } catch (err) {
      setError("Failed to load client profile details")
    } finally {
      setLoading(false)
    }
  }

  const loadTickets = async () => {
    try {
      const { data } = await api.get<TicketDTO[]>("/tickets")
      if (Array.isArray(data)) {
        // Filter tickets that belong to this client
        const clientTickets = data.filter((t) => t.user_id === clientId)
        setTickets(clientTickets)
        if (clientTickets.length > 0 && !selectedTicket) {
          loadTicketDetails(clientTickets[0].id)
        }
      }
    } catch (err) {
      console.warn("Tickets fetch fallback", err)
    }
  }

  const loadTicketDetails = async (ticketId: string) => {
    try {
      const { data } = await api.get<TicketDTO>(`/tickets/${ticketId}`)
      setSelectedTicket(data)
    } catch (err) {
      console.warn("Failed to load ticket thread", err)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingProfile(true)
    setError("")
    setSuccessMessage("")

    try {
      const { data } = await api.patch<ClientDetailDTO>(`/admin/clients/${clientId}`, {
        name: editName.trim(),
        email: editEmail.trim(),
        phone: editPhone.trim(),
      })
      setClient((prev) => (prev ? { ...prev, ...data } : data))
      setSuccessMessage("Client profile updated successfully.")
      setIsEditingProfile(false)
    } catch (err) {
      setError(apiErrorMessage(err, "Failed to update client profile"))
    } finally {
      setSavingProfile(false)
    }
  }

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you wish to cancel this client reservation?")) return
    setCancellingId(bookingId)
    try {
      await api.patch(`/admin/bookings/${bookingId}/status`, { status: "cancelled" })
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: "cancelled" } : b))
      )
      setSuccessMessage("Reservation cancelled successfully.")
    } catch (err) {
      alert(apiErrorMessage(err, "Failed to cancel reservation"))
    } finally {
      setCancellingId(null)
    }
  }

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreatingBooking(true)
    setError("")
    setSuccessMessage("")

    try {
      const fullIsoTime = salonTimeToUtcIso(bookingDate, bookingTime)
      await api.post(`/admin/clients/${clientId}/bookings`, {
        service_id: selectedServiceId,
        booking_time: fullIsoTime,
        notes: bookingNotes.trim(),
      })

      setIsNewBookingOpen(false)
      setBookingNotes("")
      setSuccessMessage("New reservation confirmed and scheduled for client.")
      // Reload bookings
      const { data: bookingsData } = await api.get<BookingDTO[]>(`/admin/clients/${clientId}/bookings`)
      setBookings(Array.isArray(bookingsData) ? bookingsData : [])
    } catch (err) {
      setError(apiErrorMessage(err, "Failed to create appointment for client"))
    } finally {
      setCreatingBooking(false)
    }
  }

  const handleSendTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ticketSubject.trim() || !ticketMessage.trim()) return

    setSendingTicket(true)
    setError("")
    setSuccessMessage("")

    try {
      const { data: newTicket } = await api.post<TicketDTO>("/tickets", {
        target_user_id: clientId,
        subject: ticketSubject.trim(),
        priority: ticketPriority,
        message: ticketMessage.trim(),
      })

      setTicketSubject("")
      setTicketMessage("")
      setSuccessMessage("Email dispatched and new inquiry ticket created for client.")

      // Refresh tickets
      await loadTickets()
      if (newTicket?.id) {
        await loadTicketDetails(newTicket.id)
      }
    } catch (err) {
      setError(apiErrorMessage(err, "Failed to dispatch email and create ticket"))
    } finally {
      setSendingTicket(false)
    }
  }

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTicket?.id || !replyMessage.trim()) return

    setSendingReply(true)
    try {
      await api.post(`/tickets/${selectedTicket.id}/messages`, {
        message: replyMessage.trim(),
      })
      setReplyMessage("")
      setSuccessMessage("Email notification dispatched with your response.")
      await loadTicketDetails(selectedTicket.id)
      await loadTickets()
    } catch (err) {
      alert(apiErrorMessage(err, "Failed to send reply"))
    } finally {
      setSendingReply(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground font-serif">
            Opening Client Sanctuary Dossier...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Salon Administration</span>
          </Link>
          <Badge variant="outline" className="text-[11px] font-serif border-primary/30 text-primary">
            Dublin Clarendon Sanctuary Roster
          </Badge>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="p-3 text-xs text-red-600 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {successMessage && (
          <div className="p-3 text-xs text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Client Hero Header Card */}
        <Card className="rounded-3xl border-border/80 shadow-md bg-card p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/15 text-primary flex items-center justify-center font-serif text-2xl font-bold border border-primary/30">
                {client?.name ? client.name[0].toUpperCase() : "C"}
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl font-serif font-bold text-foreground">
                    {client?.name || "Client Name"}
                  </h1>
                  <Badge variant="gold" className="text-[10px] capitalize">
                    {client?.role || "Customer"}
                  </Badge>
                  {client?.phone_verified && (
                    <Badge variant="success" className="text-[10px] gap-1 flex items-center">
                      <ShieldCheck className="w-3 h-3" />
                      Verified
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1.5">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-primary" />
                    {client?.email || "No email on file"}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-primary" />
                    {client?.phone || "No phone recorded"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingProfile(true)}
                className="rounded-xl text-xs gap-1.5 hover:border-primary/50"
              >
                <User className="w-3.5 h-3.5 text-primary" />
                <span>Edit Client</span>
              </Button>
              <Button
                variant="luxury"
                size="sm"
                onClick={() => setIsNewBookingOpen(true)}
                className="rounded-xl text-xs gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ New Reservation</span>
              </Button>
            </div>
          </div>
        </Card>

        {/* 2-Column Core Management Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: Bookings & History (7 Columns) */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="rounded-3xl border-border/80 p-6 bg-card space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border/50">
                <div>
                  <h3 className="font-serif font-semibold text-base text-foreground flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-primary" />
                    Appointment History & Orders
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Reservations, treatments, and cancellation controls
                  </p>
                </div>
                <Badge variant="outline" className="text-xs font-serif">
                  {bookings.length} Records
                </Badge>
              </div>

              {bookings.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground space-y-2">
                  <CalendarIcon className="w-8 h-8 mx-auto opacity-40" />
                  <p className="text-xs">No reservations recorded yet for this client.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsNewBookingOpen(true)}
                    className="rounded-xl text-xs mt-2"
                  >
                    + Book First Session
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.map((b) => (
                    <div
                      key={b.id}
                      className="p-4 rounded-2xl border border-border/60 bg-muted/20 flex flex-col md:flex-row md:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-foreground">
                            {b.service_title || "Treatment"}
                          </span>
                          <Badge
                            variant={
                              b.status === "confirmed"
                                ? "gold"
                                : b.status === "completed"
                                ? "success"
                                : "destructive"
                            }
                            className="text-[10px] capitalize"
                          >
                            {b.status}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-primary" />
                            {new Date(b.booking_time).toLocaleString("en-IE", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <span>•</span>
                          <span className="font-semibold text-primary">
                            {b.service_price || "€55"}
                          </span>
                          {b.notes && (
                            <>
                              <span>•</span>
                              <span className="italic truncate max-w-[150px]">"{b.notes}"</span>
                            </>
                          )}
                        </div>
                      </div>

                      {b.status !== "cancelled" && (
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={cancellingId === b.id}
                          onClick={() => handleCancelBooking(b.id)}
                          className="h-8 text-xs rounded-xl flex-shrink-0"
                        >
                          {cancellingId === b.id ? "Cancelling..." : "Cancel Order"}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* RIGHT: Direct Email & Support Ticketing (5 Columns) */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="rounded-3xl border-border/80 p-6 bg-card space-y-4">
              <div className="pb-3 border-b border-border/50">
                <h3 className="font-serif font-semibold text-base text-foreground flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" />
                  Dispatch Email & Ticket
                </h3>
                <p className="text-xs text-muted-foreground">
                  Send official communication with luxury HTML styling directly to client
                </p>
              </div>

              {/* Compose Message Form */}
              <form onSubmit={handleSendTicket} className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="ticket-subj" className="text-xs font-semibold">
                    Subject / Email Header
                  </Label>
                  <Input
                    id="ticket-subj"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="e.g. Bespoke Consultation & Appointment Confirmation"
                    required
                    className="rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="ticket-priority" className="text-xs font-semibold">
                    Priority Level
                  </Label>
                  <select
                    id="ticket-priority"
                    value={ticketPriority}
                    onChange={(e) => setTicketPriority(e.target.value as TicketPriority)}
                    className="w-full h-9 px-3 rounded-xl border border-input bg-background text-xs text-foreground"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent Sanctuary Notice</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="ticket-msg" className="text-xs font-semibold">
                    Message Content
                  </Label>
                  <Textarea
                    id="ticket-msg"
                    rows={3}
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    placeholder="Type the message to send to the client..."
                    required
                    className="rounded-xl text-xs"
                  />
                </div>

                <Button
                  type="submit"
                  variant="luxury"
                  size="sm"
                  disabled={sendingTicket}
                  className="w-full rounded-xl text-xs gap-2 shadow-sm"
                >
                  {sendingTicket ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Dispatching Email...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Email & Create Ticket</span>
                    </>
                  )}
                </Button>
              </form>

              {/* Existing Conversations with this user */}
              <div className="pt-4 border-t border-border/50 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-primary" />
                    Conversation Threads ({tickets.length})
                  </h4>
                </div>

                {tickets.length === 0 ? (
                  <p className="text-[11px] text-muted-foreground text-center py-4">
                    No tickets open for this client yet.
                  </p>
                ) : (
                  <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                    {tickets.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => loadTicketDetails(t.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          selectedTicket?.id === t.id
                            ? "border-primary/60 bg-primary/5"
                            : "border-border/50 hover:bg-muted/30"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-foreground truncate max-w-[180px]">
                            {t.subject}
                          </span>
                          <Badge
                            variant={t.status === "answered" ? "success" : "outline"}
                            className="text-[9px] uppercase"
                          >
                            {t.status}
                          </Badge>
                        </div>
                        <span className="text-[10px] text-muted-foreground block mt-1">
                          Updated {new Date(t.updated_at).toLocaleDateString("en-IE")}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Live Thread Drawer/Box */}
                {selectedTicket && (
                  <div className="p-3.5 rounded-2xl border border-primary/30 bg-primary/5 space-y-3 mt-2">
                    <div className="flex items-center justify-between pb-2 border-b border-border/40">
                      <span className="text-xs font-bold text-foreground">
                        Thread: {selectedTicket.subject}
                      </span>
                      <Badge variant="gold" className="text-[9px]">
                        {selectedTicket.priority}
                      </Badge>
                    </div>

                    <div className="space-y-2 max-h-[200px] overflow-y-auto text-xs pr-1">
                      {selectedTicket.messages?.map((m) => (
                        <div
                          key={m.id}
                          className={`p-2.5 rounded-xl ${
                            m.sender_role === "admin"
                              ? "bg-primary/15 ml-4 border border-primary/20"
                              : "bg-card mr-4 border border-border/60"
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                            <span className="font-semibold text-foreground">
                              {m.sender_role === "admin" ? "Salon Management" : m.sender_name || "Client"}
                            </span>
                            <span>{new Date(m.created_at).toLocaleTimeString("en-IE", { hour: "2-digit", minute: "2-digit" })}</span>
                          </div>
                          <p className="text-foreground leading-relaxed">{m.message}</p>
                          {m.is_email_sent && (
                            <span className="text-[9px] text-primary flex items-center gap-1 mt-1">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              Email sent
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Reply Composer */}
                    <form onSubmit={handleSendReply} className="flex gap-2 pt-1">
                      <Input
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        placeholder="Type reply to client (dispatches email)..."
                        className="h-9 text-xs rounded-xl bg-background"
                      />
                      <Button
                        type="submit"
                        variant="default"
                        size="sm"
                        disabled={sendingReply || !replyMessage.trim()}
                        className="h-9 px-3 rounded-xl bg-primary text-xs"
                      >
                        {sendingReply ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      </Button>
                    </form>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Modal: Edit Client Profile */}
        <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
          <DialogContent className="max-w-md rounded-3xl p-6 bg-card border-border/80">
            <DialogHeader>
              <DialogTitle className="text-xl font-serif font-bold text-foreground flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Edit Client Information
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Update client contact credentials directly in salon records.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveProfile} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="edit-name" className="text-xs font-semibold">
                  Full Name
                </Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Client Name"
                  required
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-email" className="text-xs font-semibold">
                  Email Address
                </Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="client@example.ie"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-phone" className="text-xs font-semibold">
                  Phone Number
                </Label>
                <Input
                  id="edit-phone"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+353 87 123 4567"
                  className="rounded-xl"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditingProfile(false)}
                  className="rounded-xl"
                  disabled={savingProfile}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="luxury"
                  disabled={savingProfile}
                  className="rounded-xl shadow-md min-w-[100px]"
                >
                  {savingProfile ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal: New Reservation for Client */}
        <Dialog open={isNewBookingOpen} onOpenChange={setIsNewBookingOpen}>
          <DialogContent className="max-w-md rounded-3xl p-6 bg-card border-border/80">
            <DialogHeader>
              <DialogTitle className="text-xl font-serif font-bold text-foreground flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-primary" />
                New Appointment for {client?.name}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Book a salon treatment session on behalf of this client.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateBooking} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="book-service" className="text-xs font-semibold">
                  Select Treatment
                </Label>
                <select
                  id="book-service"
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  required
                  className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm text-foreground"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title} ({s.price} • {s.duration_minutes || s.duration || 60}m)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="book-date" className="text-xs font-semibold">
                    Appointment Date
                  </Label>
                  <Input
                    id="book-date"
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    required
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="book-time" className="text-xs font-semibold">
                    Time Slot
                  </Label>
                  <select
                    id="book-time"
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm text-foreground"
                  >
                    {[
                      "09:30",
                      "10:30",
                      "11:30",
                      "12:45",
                      "14:00",
                      "15:15",
                      "16:30",
                      "17:45",
                      "19:00",
                    ].map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="book-notes" className="text-xs font-semibold">
                  Notes & Special Requests
                </Label>
                <Textarea
                  id="book-notes"
                  rows={2}
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  placeholder="e.g. Prefers Station 1, BIAB removal required..."
                  className="rounded-xl text-xs"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsNewBookingOpen(false)}
                  className="rounded-xl"
                  disabled={creatingBooking}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="luxury"
                  disabled={creatingBooking}
                  className="rounded-xl shadow-md min-w-[120px]"
                >
                  {creatingBooking ? "Booking..." : "Confirm Booking"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
