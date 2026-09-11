import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Book an Appointment | 24/7 Online Booking",
  description:
    "Reserve your signature manicure, spa pedicure or Japanese BIAB treatment at 5th Avenue Beauty Emporium, Dublin 2. Instant online booking open 24/7 — pay at the salon.",
  alternates: { canonical: "/booking" },
  robots: { index: true, follow: true },
}

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return children
}
