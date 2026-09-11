"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Calendar as CalendarIcon, Clock, Check, Sparkles, AlertCircle, ArrowLeft, ArrowRight } from "lucide-react"
import { format, isBefore, startOfToday } from "date-fns"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { api } from "@/lib/api"
import { salonTimeToUtcIso, salonNowHHmm, salonTodayStr } from "@/lib/utils"
import { apiErrorMessage, type BookingDTO, type CatalogService, type CreateBookingRequest } from "@/lib/types"

const fallbackServices = [
  {
    id: "sig-manicure",
    title: "5th Avenue Signature Gel Manicure",
    category: "Manicure",
    price: "€55",
    duration: 60,
    image: "/images/hero_manicure.jpg",
  },
  {
    id: "rose-pedicure",
    title: "Royal Rose Petal Spa Pedicure",
    category: "Pedicure",
    price: "€75",
    duration: 75,
    image: "/images/hero_pedicure.jpg",
  },
  {
    id: "biab-extensions",
    title: "Japanese BIAB & 24k Gold Flakes",
    category: "Manicure",
    price: "€90",
    duration: 90,
    image: "/images/gallery_nail_art.jpg",
  },
  {
    id: "paraffin-treatment",
    title: "Warm Paraffin Wax Treatment & Polish",
    category: "Treatment",
    price: "€65",
    duration: 60,
    image: "/images/gallery_spa_hands.jpg",
  },
  {
    id: "express-manicure",
    title: "Executive Express Manicure",
    category: "Manicure",
    price: "€40",
    duration: 45,
    image: "/images/gallery_french_chic.jpg",
  },
  {
    id: "herbal-foot-ritual",
    title: "Detoxifying Botanical Foot Ritual",
    category: "Pedicure",
    price: "€80",
    duration: 75,
    image: "/images/gallery_pedicure_care.jpg",
  },
]

const timeSlots = [
  "09:30", "10:30", "11:30", "12:45", "14:00", "15:15", "16:30", "17:45", "19:00"
]

function BookingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedService = searchParams.get("service")

  const [step, setStep] = React.useState(1)
  const [services, setServices] = React.useState<CatalogService[]>(fallbackServices)
  const [selectedService, setSelectedService] = React.useState<CatalogService | null>(null)

  // Date state using Date object for shadcn Calendar
  const [selectedDateObj, setSelectedDateObj] = React.useState<Date | undefined>(() => {
    const now = new Date()
    if (now.getHours() >= 19) {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      return tomorrow
    }
    return now
  })

  const [selectedTime, setSelectedTime] = React.useState("")
  const [notes, setNotes] = React.useState("")

  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")
  const [bookingSuccess, setBookingSuccess] = React.useState<BookingDTO | null>(null)
  const isSubmittingRef = React.useRef(false)

  // Memoized formatted date strings — salon-timezone aware (Europe/Dublin),
  // so a client in another timezone cannot book a slot that already passed in Dublin.
  const todayStr = React.useMemo(() => {
    return salonTodayStr()
  }, [])

  const selectedDate = React.useMemo(() => {
    return selectedDateObj ? format(selectedDateObj, "yyyy-MM-dd") : ""
  }, [selectedDateObj])

  const selectedDateFormatted = React.useMemo(() => {
    return selectedDateObj ? format(selectedDateObj, "EEEE, MMMM d, yyyy") : ""
  }, [selectedDateObj])

  // Check if a time slot on a specific date is in the past.
  // "Now" and the slot are both evaluated as salon-local (Europe/Dublin) wall-clock.
  const isTimeSlotPast = React.useCallback((slotStr: string, dateStr: string) => {
    if (!dateStr || !slotStr) return false
    if (dateStr < todayStr) return true
    if (dateStr > todayStr) return false

    // Same day (in salon time): compare wall-clock HH:mm with a 10 minute buffer
    const nowHHmm = salonNowHHmm()
    const [nowH, nowM] = nowHHmm.split(":").map(Number)
    const [slotH, slotM] = slotStr.split(":").map(Number)
    const nowMinutes = nowH * 60 + nowM
    const slotMinutes = slotH * 60 + slotM

    // Consider slot passed if it's within 10 minutes from now
    return slotMinutes <= nowMinutes + 10
  }, [todayStr])

  // Handle date selection in shadcn Calendar
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return
    if (isBefore(date, startOfToday())) return

    setSelectedDateObj(date)
    const dateStr = format(date, "yyyy-MM-dd")
    // If currently selected time is in the past for this new date, clear it
    if (selectedTime && isTimeSlotPast(selectedTime, dateStr)) {
      setSelectedTime("")
    }
  }

  // Fetch live services from backend
  React.useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data } = await api.get<CatalogService[]>("/services")
        if (data && data.length > 0) {
          setServices(data)
        }
      } catch (err) {
        console.warn("Using fallback service catalog", err)
      }
    }
    fetchServices()
  }, [])

  // Handle preselected service query param
  React.useEffect(() => {
    if (preselectedService && services.length > 0) {
      const match = services.find((s) => s.id === preselectedService)
      if (match) {
        setSelectedService(match)
        setStep(2)
      }
    }
  }, [preselectedService, services])

  const handleBookingSubmit = async () => {
    // 1. Strict synchronous guard to prevent any concurrent click or double submit
    if (isSubmittingRef.current || loading) {
      return
    }
    isSubmittingRef.current = true
    setLoading(true)
    setError("")

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null
      if (!token) {
        isSubmittingRef.current = false
        setLoading(false)
        router.push(`/login?redirect=/booking&service=${selectedService?.id}`)
        return
      }

      if (!selectedService || !selectedDate || !selectedTime) {
        setError("Please select both an appointment date and time.")
        isSubmittingRef.current = false
        setLoading(false)
        return
      }

      // Past date/time validation
      if (selectedDate < todayStr) {
        setError("You cannot select a date in the past. Please select today or a future date.")
        isSubmittingRef.current = false
        setLoading(false)
        return
      }

      if (isTimeSlotPast(selectedTime, selectedDate)) {
        setError("This time slot has already passed for today. Please choose an upcoming time slot or a future date.")
        isSubmittingRef.current = false
        setLoading(false)
        return
      }

      const bookingTimestamp = salonTimeToUtcIso(selectedDate, selectedTime)
      const payload: CreateBookingRequest = {
        service_id: selectedService.id,
        booking_time: bookingTimestamp,
        notes,
      }
      const { data } = await api.post<BookingDTO>("/bookings", payload)
      setBookingSuccess(data)
      setStep(4)
    } catch (err) {
      setError(apiErrorMessage(err, "Failed to confirm appointment. Please try again."))
    } finally {
      setLoading(false)
      // Keep guard active for 2 seconds to prevent rapid repeated clicks
      setTimeout(() => {
        isSubmittingRef.current = false
      }, 2000)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 md:px-8 py-12 max-w-4xl">
        {/* Booking Stepper */}
        <div className="mb-10 text-center">
          <Badge variant="gold" className="mb-3">
            24/7 Concierge Booking
          </Badge>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
            Reserve Your Sanctuary Session
          </h1>
          <p className="text-sm text-muted-foreground mt-2 font-light">
            45 Clarendon Street, Dublin 2 • Open daily until 20:00
          </p>

          {/* Stepper indicators */}
          <div className="flex items-center justify-center gap-3 mt-8 max-w-md mx-auto">
            <div className={`flex items-center gap-2 text-xs font-semibold ${step >= 1 ? "text-primary" : "text-muted-foreground"}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 1 ? "bg-primary text-white" : "bg-muted"}`}>
                1
              </span>
              <span>Treatment</span>
            </div>
            <div className={`w-10 h-0.5 ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
            <div className={`flex items-center gap-2 text-xs font-semibold ${step >= 2 ? "text-primary" : "text-muted-foreground"}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? "bg-primary text-white" : "bg-muted"}`}>
                2
              </span>
              <span>Date & Time</span>
            </div>
            <div className={`w-10 h-0.5 ${step >= 3 ? "bg-primary" : "bg-muted"}`} />
            <div className={`flex items-center gap-2 text-xs font-semibold ${step >= 3 ? "text-primary" : "text-muted-foreground"}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 3 ? "bg-primary text-white" : "bg-muted"}`}>
                3
              </span>
              <span>Confirm</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: Select Service */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-xl font-serif font-semibold mb-6">Select Your Treatment:</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((s) => {
                const isSelected = selectedService?.id === s.id
                return (
                  <Card
                    key={s.id}
                    onClick={() => setSelectedService(s)}
                    className={`cursor-pointer transition-all duration-200 p-4 flex gap-4 items-center rounded-2xl border-2 ${isSelected
                        ? "border-primary bg-primary/5 shadow-md"
                        : "border-border/70 hover:border-primary/40 hover:bg-muted/30"
                      }`}
                  >
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
                      <Image
                        src={s.image || s.image_url || "/images/hero_manicure.jpg"}
                        alt={s.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-grow">
                      <span className="text-[10px] uppercase font-semibold tracking-wider text-primary">
                        {s.category}
                      </span>
                      <h4 className="font-medium text-sm text-foreground line-clamp-1">
                        {s.title}
                      </h4>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">{s.price}</span>
                        <span>•</span>
                        <span>{s.duration || s.duration_minutes} mins</span>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </Card>
                )
              })}
            </div>

            <div className="mt-8 flex justify-end">
              <Button
                variant="luxury"
                size="lg"
                disabled={!selectedService}
                onClick={() => setStep(2)}
                className="gap-2"
              >
                <span>Continue to Schedule</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* STEP 2: Date & Time Selection */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="flex items-center justify-between pb-4 border-b border-border/60">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="rounded-xl">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <div>
                  <h3 className="text-base font-semibold">{selectedService?.title}</h3>
                  <span className="text-xs text-muted-foreground">{selectedService?.price} • {selectedService?.duration || selectedService?.duration_minutes} mins</span>
                </div>
              </div>
            </div>

            {/* Date & Time Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left: shadcn Calendar */}
              <div className="lg:col-span-5 space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-primary" />
                    <span>1. Choose Date (shadcn/ui)</span>
                  </Label>
                  <span className="text-[11px] text-muted-foreground">Past dates disabled</span>
                </div>

                <div className="flex justify-center bg-card/50 rounded-2xl p-1">
                  <Calendar
                    mode="single"
                    selected={selectedDateObj}
                    onSelect={handleDateSelect}
                    disabled={{ before: startOfToday() }}
                    className="w-full shadow-sm"
                  />
                </div>

                {selectedDateFormatted && (
                  <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-center">
                    <span className="text-xs text-muted-foreground block">Selected Appointment Date:</span>
                    <span className="text-sm font-serif font-bold text-primary">{selectedDateFormatted}</span>
                  </div>
                )}
              </div>

              {/* Right: Arrival Time Slots & Requests */}
              <div className="lg:col-span-7 space-y-6">
                {/* Time Slot Picker */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>2. Choose Preferred Arrival Time</span>
                    </Label>
                    {selectedDate === todayStr && (
                      <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                        (Past hours today are unavailable)
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-3 gap-2.5">
                    {timeSlots.map((slot) => {
                      const isSelected = selectedTime === slot
                      const isPast = isTimeSlotPast(slot, selectedDate)

                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={isPast}
                          onClick={() => !isPast && setSelectedTime(slot)}
                          className={`h-12 rounded-xl border text-sm font-medium transition-all ${isPast
                              ? "opacity-30 cursor-not-allowed bg-muted/40 text-muted-foreground line-through border-dashed border-border/40"
                              : isSelected
                                ? "border-primary bg-primary text-primary-foreground shadow-md scale-102 font-semibold"
                                : "border-border bg-card hover:border-primary/50 hover:bg-muted/40 cursor-pointer"
                            }`}
                          title={isPast ? "This time slot has already passed" : slot}
                        >
                          {slot}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm font-medium">3. Special Requests / Nail Allergies (Optional)</Label>
                  <Input
                    id="notes"
                    placeholder="e.g., Sensitive cuticles, gel removal required, almond shape preferred..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="h-12 rounded-xl"
                  />
                </div>

                <div className="p-4 rounded-xl bg-muted/30 border border-border/60 text-xs text-muted-foreground space-y-1">
                  <p className="font-semibold text-foreground">5th Avenue Guarantee:</p>
                  <p>Complimentary sparkling water or artisan tea served upon arrival. Private styling stations reserved exclusively for your scheduled window.</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-6 border-t border-border/60">
              <Button variant="outline" onClick={() => setStep(1)} className="rounded-xl">
                Back to Treatments
              </Button>
              <Button
                variant="luxury"
                size="lg"
                disabled={!selectedDate || !selectedTime}
                onClick={() => setStep(3)}
                className="gap-2"
              >
                <span>Review & Confirm</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: Review & Instant Booking */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <Card className="rounded-3xl border-border/80 shadow-xl overflow-hidden">
              <CardHeader className="bg-muted/30 border-b border-border/60">
                <CardTitle className="font-serif text-2xl">Appointment Summary</CardTitle>
                <CardDescription>
                  Review your treatment schedule at 5th Avenue Beauty Emporium
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between py-2 border-b border-border/40">
                  <span className="text-muted-foreground">Treatment:</span>
                  <span className="font-semibold text-foreground">{selectedService?.title}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/40">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-semibold text-foreground">{selectedDateFormatted || selectedDate}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/40">
                  <span className="text-muted-foreground">Time:</span>
                  <span className="font-semibold text-foreground">{selectedTime}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/40">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-semibold text-foreground">{selectedService?.duration || selectedService?.duration_minutes} minutes</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/40">
                  <span className="text-muted-foreground">Location:</span>
                  <span className="font-semibold text-foreground">45 Clarendon Street, Dublin 2</span>
                </div>
                {notes && (
                  <div className="flex justify-between py-2 border-b border-border/40">
                    <span className="text-muted-foreground">Notes:</span>
                    <span className="text-foreground">{notes}</span>
                  </div>
                )}
                <div className="flex justify-between py-3 text-lg font-serif font-bold">
                  <span>Total Amount (Pay at Salon):</span>
                  <span className="text-primary">{selectedService?.price}</span>
                </div>
              </CardContent>

              <CardFooter className="bg-muted/20 p-6 flex flex-col sm:flex-row gap-4 justify-between border-t border-border/60">
                <Button variant="outline" onClick={() => setStep(2)} className="rounded-xl w-full sm:w-auto">
                  Modify Date/Time
                </Button>
                <Button
                  type="button"
                  variant="luxury"
                  size="lg"
                  onClick={handleBookingSubmit}
                  disabled={loading}
                  className="rounded-xl w-full sm:w-auto gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>{loading ? "Securing Reservation..." : "Confirm Reservation"}</span>
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}

        {/* STEP 4: Booking Success Confirmation */}
        {step === 4 && (
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
            <Card className="p-8 md:p-12 rounded-3xl border-border/80 shadow-2xl bg-card max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-500 mx-auto flex items-center justify-center mb-6">
                <Check className="w-8 h-8" />
              </div>
              <Badge variant="success" className="mb-3">
                Confirmed & Reserved
              </Badge>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
                Your Sanctuary Awaits
              </h2>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                Thank you for reserving with 5th Avenue Beauty Emporium. A confirmation has been added to your client portal.
              </p>

              <div className="bg-muted/40 p-5 rounded-2xl border border-border/60 my-6 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Session:</span>
                  <span className="font-semibold text-foreground">{selectedService?.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Scheduled Time:</span>
                  <span className="font-semibold text-foreground">{selectedDateFormatted || selectedDate} at {selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Address:</span>
                  <span className="text-foreground">45 Clarendon St, Dublin 2</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/dashboard" className="w-full">
                  <Button variant="luxury" className="w-full rounded-xl">
                    View in Client Portal
                  </Button>
                </Link>
                <Link href="/" className="w-full">
                  <Button variant="outline" className="w-full rounded-xl">
                    Return to Home
                  </Button>
                </Link>
              </div>
            </Card>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default function BookingPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
              Loading 5th Avenue Concierge...
            </p>
          </div>
        </div>
      }
    >
      <BookingContent />
    </React.Suspense>
  )
}

