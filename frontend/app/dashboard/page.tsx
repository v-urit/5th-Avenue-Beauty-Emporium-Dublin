"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Calendar,
  Clock,
  MapPin,
  User,
  LogOut,
  XCircle,
  Plus,
  AlertCircle,
  Sparkles,
  UserCheck,
  MessageSquare,
  Send,
  CheckCircle2,
  Loader2,
} from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { EditProfileDialog } from "@/components/edit-profile-dialog"
import { api } from "@/lib/api"
import {
  apiErrorMessage,
  type BookingDTO,
  type TicketDTO,
  type TicketPriority,
  type UserDTO,
} from "@/lib/types"

export default function DashboardPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = React.useState<"appointments" | "tickets">("appointments")
  // `user` may come from a cached localStorage stub ({ name } only) before
  // the live profile fetch resolves, hence the partial shape.
  const [user, setUser] = React.useState<(Partial<UserDTO> & { name: string }) | null>(null)
  const [bookings, setBookings] = React.useState<BookingDTO[]>([])
  const [loading, setLoading] = React.useState(true)
  const [cancellingId, setCancellingId] = React.useState<string | null>(null)
  const [error, setError] = React.useState("")
  const [isEditProfileOpen, setIsEditProfileOpen] = React.useState(false)

  // Tickets State
  const [tickets, setTickets] = React.useState<TicketDTO[]>([])
  const [selectedTicketId, setSelectedTicketId] = React.useState<string | null>(null)
  const [ticketThread, setTicketThread] = React.useState<TicketDTO | null>(null)
  const [isNewTicketOpen, setIsNewTicketOpen] = React.useState(false)
  const [newSubject, setNewSubject] = React.useState("")
  const [newPriority, setNewPriority] = React.useState<TicketPriority>("normal")
  const [newMessage, setNewMessage] = React.useState("")
  const [creatingTicket, setCreatingTicket] = React.useState(false)
  const [userReplyText, setUserReplyText] = React.useState("")
  const [sendingUserReply, setSendingUserReply] = React.useState(false)

  React.useEffect(() => {
    const rawUser = localStorage.getItem("user")
    const token = localStorage.getItem("access_token")

    if (!token) {
      router.push("/login")
      return
    }

    if (rawUser) {
      try {
        setUser(JSON.parse(rawUser))
      } catch {
        setUser({ name: "Valued Client" })
      }
    }

    fetchProfile()
    fetchBookings()
    fetchTickets()
  }, [router])

  const fetchTickets = async () => {
    try {
      const { data } = await api.get<TicketDTO[]>("/tickets")
      if (Array.isArray(data)) {
        setTickets(data)
        if (data.length > 0 && !selectedTicketId) {
          handleSelectTicket(data[0].id)
        }
      }
    } catch (err) {
      console.warn("Could not fetch user tickets", err)
    }
  }

  const handleSelectTicket = async (ticketId: string) => {
    setSelectedTicketId(ticketId)
    try {
      const { data } = await api.get<TicketDTO>(`/tickets/${ticketId}`)
      setTicketThread(data)
    } catch (err) {
      console.warn("Could not fetch ticket thread", err)
    }
  }

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSubject.trim() || !newMessage.trim()) return

    setCreatingTicket(true)
    try {
      const { data: created } = await api.post<TicketDTO>("/tickets", {
        subject: newSubject.trim(),
        priority: newPriority,
        message: newMessage.trim(),
      })

      setIsNewTicketOpen(false)
      setNewSubject("")
      setNewMessage("")
      await fetchTickets()
      if (created?.id) {
        await handleSelectTicket(created.id)
      }
    } catch (err) {
      alert(apiErrorMessage(err, "Failed to create inquiry ticket"))
    } finally {
      setCreatingTicket(false)
    }
  }

  const handleSendUserReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTicketId || !userReplyText.trim()) return

    setSendingUserReply(true)
    try {
      await api.post(`/tickets/${selectedTicketId}/messages`, {
        message: userReplyText.trim(),
      })
      setUserReplyText("")
      await handleSelectTicket(selectedTicketId)
      await fetchTickets()
    } catch (err) {
      alert(apiErrorMessage(err, "Failed to send message"))
    } finally {
      setSendingUserReply(false)
    }
  }

  const fetchProfile = async () => {
    try {
      const { data } = await api.get<UserDTO>("/user/profile")
      if (data) {
        setUser(data)
        localStorage.setItem("user", JSON.stringify(data))
      }
    } catch (err) {
      console.warn("Could not fetch latest profile", err)
    }
  }

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const { data } = await api.get<BookingDTO[]>("/bookings/me")
      setBookings(data || [])
    } catch (err) {
      console.warn("Could not fetch bookings", err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelBooking = async (id: string) => {
    if (!confirm("Are you sure you wish to cancel this appointment?")) return
    setCancellingId(id)

    try {
      await api.patch(`/bookings/${id}/cancel`)
      // Refresh list
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b))
      )
    } catch (err) {
      alert(apiErrorMessage(err, "Failed to cancel appointment"))
    } finally {
      setCancellingId(null)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    localStorage.removeItem("user")
    router.push("/")
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 md:px-8 py-12 max-w-6xl">
        {/* User Profile Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-border/60">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/15 text-primary flex items-center justify-center font-serif text-2xl font-bold border border-primary/20">
              {user?.name ? user.name[0].toUpperCase() : "C"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
                  {user?.name || "Client Sanctuary Portal"}
                </h1>
                <Badge variant="gold" className="text-[10px]">
                  VIP Client
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
                {user?.email && <span>{user.email}</span>}
                {user?.email && user?.phone && <span>•</span>}
                {user?.phone && (
                  <span className="flex items-center gap-1">
                    <span>{user.phone}</span>
                    {user.phone_verified && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">(Verified)</span>
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setIsEditProfileOpen(true)}
              className="rounded-xl gap-2 hover:border-primary/50"
            >
              <User className="w-4 h-4 text-primary" />
              <span>Edit Profile</span>
            </Button>
            <Link href="/booking">
              <Button variant="luxury" className="rounded-xl gap-2 shadow-md">
                <Plus className="w-4 h-4" />
                <span>Book New Session</span>
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="rounded-xl gap-2 text-muted-foreground hover:text-destructive"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>

        {/* Edit Profile Modal Dialog */}
        <EditProfileDialog
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          currentUser={user}
          onProfileUpdated={(updatedUser) => {
            setUser(updatedUser)
            localStorage.setItem("user", JSON.stringify(updatedUser))
          }}
        />

        {/* Navigation Tabs */}
        <div className="flex items-center gap-3 mt-8 pb-4 border-b border-border/50">
          <button
            onClick={() => setActiveTab("appointments")}
            className={`px-4 py-2 rounded-2xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === "appointments"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/40 text-muted-foreground hover:text-foreground border border-border/60"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>My Appointments ({bookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("tickets")}
            className={`px-4 py-2 rounded-2xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === "tickets"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/40 text-muted-foreground hover:text-foreground border border-border/60"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Support & Inquiries ({tickets.length})</span>
          </button>
        </div>

        {/* TAB 1: Appointments Section */}
        {activeTab === "appointments" && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-serif font-semibold text-foreground">
                  Your Appointment Schedule
                </h2>
                <p className="text-xs text-muted-foreground">
                  Manage your upcoming treatments and visit history
                </p>
              </div>
            </div>

            {loading ? (
              <div className="py-20 text-center text-muted-foreground text-sm">
                Loading your appointment history...
              </div>
            ) : bookings.length === 0 ? (
              <Card className="text-center py-16 px-4 rounded-3xl border-dashed border-2 border-border/80">
                <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-serif font-semibold text-foreground mb-2">
                  No Appointments Booked Yet
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-6">
                  Treat yourself to Dublin&apos;s finest manicure or rose petal pedicure.
                </p>
                <Link href="/booking">
                  <Button variant="luxury" className="rounded-xl">
                    Reserve Your First Session
                  </Button>
                </Link>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {bookings.map((booking) => {
                  const isCancelled = booking.status === "cancelled"
                  const dateObj = new Date(booking.booking_time)
                  const formattedDate = dateObj.toLocaleDateString("en-IE", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                  const formattedTime = dateObj.toLocaleTimeString("en-IE", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })

                  return (
                    <Card
                      key={booking.id}
                      className={`rounded-2xl border transition-all ${
                        isCancelled
                          ? "opacity-60 border-border/50 bg-muted/20"
                          : "border-border/80 shadow-md hover:border-primary/40 bg-card"
                      }`}
                    >
                      <CardHeader className="pb-3 flex flex-row items-start justify-between">
                        <div>
                          <Badge
                            variant={
                              isCancelled
                                ? "destructive"
                                : booking.status === "confirmed"
                                ? "success"
                                : "default"
                            }
                            className="mb-2"
                          >
                            {booking.status.toUpperCase()}
                          </Badge>
                          <CardTitle className="text-lg font-serif">
                            {booking.service_title}
                          </CardTitle>
                        </div>
                        <span className="text-base font-serif font-bold text-primary">
                          {booking.service_price}
                        </span>
                      </CardHeader>

                      <CardContent className="space-y-2.5 text-xs text-muted-foreground pb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-primary" />
                          <span className="font-medium text-foreground">{formattedDate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-primary" />
                          <span>{formattedTime} ({booking.service_duration} minutes)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-primary" />
                          <span>45 Clarendon Street, Dublin 2</span>
                        </div>
                        {booking.notes && (
                          <p className="pt-2 text-[11px] italic text-muted-foreground/80">
                            Notes: {booking.notes}
                          </p>
                        )}
                      </CardContent>

                      {!isCancelled && (
                        <CardFooter className="pt-3 border-t border-border/50 flex justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={cancellingId === booking.id}
                            onClick={() => handleCancelBooking(booking.id)}
                            className="text-xs text-destructive hover:bg-destructive/10 rounded-xl"
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1" />
                            <span>{cancellingId === booking.id ? "Cancelling..." : "Cancel Appointment"}</span>
                          </Button>
                        </CardFooter>
                      )}
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Support & Ticketing Section */}
        {activeTab === "tickets" && (
          <div className="mt-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-serif font-semibold text-foreground">
                  Support & Direct Messages
                </h2>
                <p className="text-xs text-muted-foreground">
                  Direct encrypted channel with 5th Avenue Salon Concierge. Inquiries and replies are privately delivered.
                </p>
              </div>
              <Button
                variant="luxury"
                size="sm"
                onClick={() => setIsNewTicketOpen(true)}
                className="rounded-xl text-xs gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Open Support Ticket</span>
              </Button>
            </div>

            {/* 2-Column Support Hub */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Tickets List */}
              <div className="lg:col-span-5 space-y-3">
                {tickets.map((t) => (
                  <Card
                    key={t.id}
                    onClick={() => handleSelectTicket(t.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      selectedTicketId === t.id
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border/70 hover:bg-muted/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-foreground truncate max-w-[200px]">
                        {t.subject}
                      </span>
                      <Badge
                        variant={
                          t.status === "answered"
                            ? "success"
                            : t.status === "open"
                            ? "gold"
                            : "outline"
                        }
                        className="text-[9px] uppercase font-bold"
                      >
                        {t.status === "answered" ? "Salon Answered" : t.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
                      <span className="capitalize">{t.priority} Priority</span>
                      <span>{new Date(t.updated_at).toLocaleDateString("en-IE")}</span>
                    </div>
                  </Card>
                ))}

                {tickets.length === 0 && (
                  <Card className="p-8 text-center text-muted-foreground rounded-2xl border-dashed border-2 border-border/80">
                    <MessageSquare className="w-8 h-8 mx-auto opacity-30 mb-2" />
                    <p className="text-xs font-serif">You have no active inquiries.</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsNewTicketOpen(true)}
                      className="rounded-xl text-xs mt-3"
                    >
                      + Ask Salon Concierge
                    </Button>
                  </Card>
                )}
              </div>

              {/* Right Column: Selected Ticket Thread & Reply */}
              <div className="lg:col-span-7">
                {ticketThread ? (
                  <Card className="rounded-3xl border-border/80 p-6 bg-card space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-border/50">
                      <div>
                        <h3 className="font-serif font-bold text-base text-foreground">
                          {ticketThread.subject}
                        </h3>
                        <p className="text-[11px] text-muted-foreground">
                          Created on {new Date(ticketThread.created_at).toLocaleDateString("en-IE")}
                        </p>
                      </div>
                      <Badge variant="gold" className="text-[10px] capitalize">
                        {ticketThread.status === "answered" ? "Salon Replied" : ticketThread.status}
                      </Badge>
                    </div>

                    {/* Messages Scroll Area */}
                    <div className="space-y-3 min-h-[220px] max-h-[380px] overflow-y-auto pr-2">
                      {ticketThread.messages?.map((m) => (
                        <div
                          key={m.id}
                          className={`p-3.5 rounded-2xl ${
                            m.sender_role === "admin"
                              ? "bg-primary/10 mr-6 border border-primary/25"
                              : "bg-muted/40 ml-6 border border-border/60"
                          }`}
                        >
                          <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                            <span className="font-semibold text-foreground flex items-center gap-1.5">
                              {m.sender_role === "admin" ? (
                                <>
                                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                                  <span className="text-primary font-bold">5th Avenue Concierge</span>
                                </>
                              ) : (
                                "You"
                              )}
                            </span>
                            <span>
                              {new Date(m.created_at).toLocaleTimeString("en-IE", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <p className="text-xs text-foreground leading-relaxed">{m.message}</p>
                        </div>
                      ))}
                    </div>

                    {/* Client Reply Form */}
                    <form onSubmit={handleSendUserReply} className="pt-2 border-t border-border/50 space-y-2">
                      <Textarea
                        rows={3}
                        value={userReplyText}
                        onChange={(e) => setUserReplyText(e.target.value)}
                        placeholder="Reply to 5th Avenue salon management..."
                        className="rounded-2xl text-xs bg-background"
                        required
                      />
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-muted-foreground">
                          Messages are private to you and salon management.
                        </span>
                        <Button
                          type="submit"
                          variant="luxury"
                          size="sm"
                          disabled={sendingUserReply || !userReplyText.trim()}
                          className="rounded-xl text-xs gap-1.5 shadow-sm min-w-[120px]"
                        >
                          {sendingUserReply ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Sending...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" />
                              <span>Send Reply</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Card>
                ) : (
                  <Card className="rounded-3xl border-border/60 p-12 text-center text-muted-foreground">
                    <MessageSquare className="w-10 h-10 mx-auto opacity-30 mb-2" />
                    <p className="text-sm font-serif">Select an inquiry to view responses from the salon.</p>
                  </Card>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal: Open New Support Ticket */}
        <Dialog open={isNewTicketOpen} onOpenChange={setIsNewTicketOpen}>
          <DialogContent className="max-w-md rounded-3xl p-6 bg-card border-border/80">
            <DialogHeader>
              <DialogTitle className="text-xl font-serif font-bold text-foreground flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Open Salon Inquiry
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Submit an inquiry or treatment question directly to salon concierge.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateTicket} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="client-ticket-subj" className="text-xs font-semibold">
                  Subject
                </Label>
                <Input
                  id="client-ticket-subj"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="e.g. Question about BIAB Gel treatment..."
                  required
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="client-ticket-priority" className="text-xs font-semibold">
                  Urgency
                </Label>
                <select
                  id="client-ticket-priority"
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as TicketPriority)}
                  className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm text-foreground"
                >
                  <option value="normal">Normal Inquiry</option>
                  <option value="high">High Priority (Upcoming Appointment)</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="client-ticket-msg" className="text-xs font-semibold">
                  Message Details
                </Label>
                <Textarea
                  id="client-ticket-msg"
                  rows={4}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Describe your inquiry or special request..."
                  required
                  className="rounded-xl text-xs"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsNewTicketOpen(false)}
                  className="rounded-xl"
                  disabled={creatingTicket}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="luxury"
                  disabled={creatingTicket}
                  className="rounded-xl shadow-md min-w-[120px]"
                >
                  {creatingTicket ? "Sending..." : "Submit Inquiry"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </main>

      <Footer />
    </div>
  )
}
