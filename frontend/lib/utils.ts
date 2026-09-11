import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** IANA timezone of the physical salon. All appointment slots are wall-clock times in this zone. */
export const SALON_TIME_ZONE = "Europe/Dublin"

/**
 * Convert a salon-local wall-clock date/time ("yyyy-MM-dd" + "HH:mm") into a
 * correct UTC ISO-8601 string (RFC 3339 with `Z`), honoring Dublin's DST.
 *
 * Previously the client appended `Z` to a browser-local wall time, which
 * silently shifted every booking by the difference between the visitor's
 * timezone (and their clock's DST rules) and Dublin's actual UTC offset.
 */
export function salonTimeToUtcIso(dateStr: string, timeStr: string, timeZone: string = SALON_TIME_ZONE): string {
  if (!dateStr || !timeStr) return ""

  const [y, m, d] = dateStr.split("-").map(Number)
  const [hh, mi] = timeStr.split(":").map(Number)
  const requested = Date.UTC(y, m - 1, d, hh, mi, 0)

  let guess = requested
  for (let i = 0; i < 3; i++) {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date(guess))
    const get = (type: Intl.DateTimeFormatPartTypes) =>
      Number(parts.find((p) => p.type === type)?.value ?? 0)
    const rendered = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), 0)
    const diff = requested - rendered
    guess += diff
    if (diff === 0) break
  }

  return new Date(guess).toISOString()
}

/** Current time in the salon timezone as "HH:mm" wall-clock (used for past-slot checks). */
export function salonNowHHmm(timeZone: string = SALON_TIME_ZONE): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date())
}

/** Today's date in the salon timezone as "yyyy-MM-dd". */
export function salonTodayStr(timeZone: string = SALON_TIME_ZONE): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone }).format(new Date()) // en-CA yields yyyy-mm-dd
}
