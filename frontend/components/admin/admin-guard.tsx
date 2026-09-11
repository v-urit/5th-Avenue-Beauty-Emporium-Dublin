"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import type { UserDTO } from "@/lib/types"

/**
 * Client-side UX gate for the /admin route tree.
 *
 * This is defense-in-depth for the UI only — the authoritative check is
 * middleware.RequireRole("admin") on the backend, which now rejects any
 * non-admin token regardless of what the browser renders. We mirror it here
 * so an unauthorized visitor is bounced to the client portal instead of
 * seeing a broken admin shell.
 */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [authorized, setAuthorized] = React.useState(false)
  const [checking, setChecking] = React.useState(true)

  React.useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (!token) {
      router.replace("/login?redirect=/admin")
      return
    }

    try {
      const raw = localStorage.getItem("user")
      const user = raw ? (JSON.parse(raw) as Partial<UserDTO>) : null
      if (user?.role === "admin") {
        setAuthorized(true)
      } else {
        // Not an admin — send to the client portal.
        router.replace("/dashboard")
      }
    } catch {
      router.replace("/login?redirect=/admin")
    } finally {
      setChecking(false)
    }
  }, [router])

  if (checking || !authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
            Verifying administrator access...
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
