"use client"

import * as React from "react"
import { Plus, Calendar as CalendarIcon, Clock, User, Phone, Sparkles, Loader2, AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api"
import { salonTimeToUtcIso } from "@/lib/utils"
import { apiErrorMessage, type CatalogService } from "@/lib/types"

interface AdminNewBookingDialogProps {
  isOpen: boolean
  onClose: () => void
  onBookingCreated: () => void
  services: CatalogService[]
}

const timeSlots = [
  "09:30", "10:30", "11:30", "12:45", "14:00", "15:15", "16:30", "17:45", "19:00"
]

export function AdminNewBookingDialog({
  isOpen,
  onClose,
  onBookingCreated,
  services,
}: AdminNewBookingDialogProps) {
  const [selectedServiceId, setSelectedServiceId] = React.useState("")
  const [date, setDate] = React.useState("")
  const [time, setTime] = React.useState("11:30")
  const [notes, setNotes] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")

  // Default to today
  React.useEffect(() => {
    if (isOpen) {
      const d = new Date()
      const yyyy = d.getFullYear()
      const mm = String(d.getMonth() + 1).padStart(2, "0")
      const dd = String(d.getDate()).padStart(2, "0")
      setDate(`${yyyy}-${mm}-${dd}`)
      if (services.length > 0 && !selectedServiceId) {
        setSelectedServiceId(services[0].id)
      }
      setError("")
      setNotes("")
    }
  }, [isOpen, services, selectedServiceId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!selectedServiceId || !date || !time) {
      setError("Please choose a service, date, and arrival time.")
      return
    }

    setLoading(true)
    try {
      const bookingTimestamp = salonTimeToUtcIso(date, time)
      await api.post("/bookings", {
        service_id: selectedServiceId,
        booking_time: bookingTimestamp,
        notes: notes ? `[Admin Booking] ${notes}` : "[Admin Direct Reservation]",
      })

      onBookingCreated()
      onClose()
    } catch (err) {
      setError(apiErrorMessage(err, "Failed to create reservation. Please try again."))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-card text-foreground border-border/80">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span>Create Salon Reservation</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Directly register an appointment for walk-in or telephone clients.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Select Service */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Select Treatment</Label>
            <select
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              className="w-full h-11 px-3.5 text-xs rounded-xl bg-muted/40 border border-border/70 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title} ({s.price} • {s.duration || s.duration_minutes}m)
                </option>
              ))}
            </select>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Appointment Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-11 text-xs rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Time Slot</Label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full h-11 px-3 text-xs rounded-xl bg-muted/40 border border-border/70 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Client Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="admin-notes" className="text-xs font-semibold">Client Notes / Request (Optional)</Label>
            <Input
              id="admin-notes"
              placeholder="e.g. VIP client, preferred nail tech Sarah..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-11 text-xs rounded-xl"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="luxury"
              disabled={loading}
              className="rounded-xl text-xs"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  <span>Reserving...</span>
                </>
              ) : (
                <span>Confirm Reservation</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
