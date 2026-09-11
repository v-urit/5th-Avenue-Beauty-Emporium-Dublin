"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import { Sparkles, Shield, User, RotateCcw, ChevronDown, ChevronUp, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MockStore, MOCK_ADMIN_USER, MOCK_CLIENT_USER } from "@/lib/mock-data"

export function DemoBadge() {
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = React.useState(false)
  const [currentUser, setCurrentUser] = React.useState<{ role?: string; name?: string } | null>(null)
  const [resetSuccess, setResetSuccess] = React.useState(false)

  React.useEffect(() => {
    const raw = localStorage.getItem("user")
    if (raw) {
      try {
        setCurrentUser(JSON.parse(raw))
      } catch {}
    } else {
      setCurrentUser(null)
    }
  }, [pathname])

  const switchToRole = (role: "admin" | "customer") => {
    localStorage.setItem("demo_mode", "true")
    localStorage.setItem("access_token", `demo-token-${role}-${Date.now()}`)
    localStorage.setItem("refresh_token", `demo-refresh-${Date.now()}`)

    const user = role === "admin" ? MOCK_ADMIN_USER : MOCK_CLIENT_USER
    localStorage.setItem("user", JSON.stringify(user))
    setCurrentUser(user)
    setIsOpen(false)

    if (role === "admin") {
      router.push("/admin")
    } else {
      router.push("/dashboard")
    }
  }

  const handleResetData = () => {
    MockStore.reset()
    setResetSuccess(true)
    setTimeout(() => {
      setResetSuccess(false)
      setIsOpen(false)
      window.location.reload()
    }, 600)
  }

  return (
    <aside aria-label="Demo Controller" className="fixed bottom-4 right-4 z-[9999]">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-card/90 border border-primary/30 shadow-2xl backdrop-blur-md text-xs font-medium text-foreground hover:border-primary/60 transition-all hover:scale-105 active:scale-95 group cursor-pointer"
          title="Demo Controls"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <Sparkles className="w-3.5 h-3.5 text-primary group-hover:rotate-12 transition-transform" />
          <span className="font-serif tracking-wide text-xs">Demo Mode</span>
          <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      ) : (
        <div className="w-72 rounded-2xl bg-card/95 border border-border/80 shadow-2xl backdrop-blur-xl p-4 space-y-3.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold tracking-wide font-serif">5th Avenue Demo</span>
            </div>
            <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30 font-bold px-1.5 py-0">
              ACTIVE
            </Badge>
            <button
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground text-xs p-1 rounded-md"
              title="Close"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          <div className="text-[11px] text-muted-foreground leading-snug">
            {currentUser ? (
              <p>
                Active Persona:{" "}
                <span className="font-semibold text-foreground">{currentUser.name}</span>{" "}
                <span className="capitalize text-[10px] text-primary">({currentUser.role || "client"})</span>
              </p>
            ) : (
              <p>Browsing as Guest. Switch personas below:</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <Button
              size="sm"
              variant={currentUser?.role === "admin" ? "default" : "outline"}
              onClick={() => switchToRole("admin")}
              className="h-8 text-[11px] rounded-xl gap-1.5 font-medium"
            >
              <Shield className="w-3 h-3" />
              Admin View
            </Button>
            <Button
              size="sm"
              variant={currentUser?.role === "customer" ? "default" : "outline"}
              onClick={() => switchToRole("customer")}
              className="h-8 text-[11px] rounded-xl gap-1.5 font-medium"
            >
              <User className="w-3 h-3" />
              Client View
            </Button>
          </div>

          <div className="pt-2 border-t border-border/50 flex items-center justify-between">
            <button
              onClick={handleResetData}
              className="text-[10px] text-muted-foreground hover:text-destructive flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {resetSuccess ? (
                <>
                  <Check className="w-3 h-3 text-emerald-500" />
                  <span className="text-emerald-500 font-medium">Resetting Data...</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-3 h-3" />
                  Reset Mock Data
                </>
              )}
            </button>

            <span className="text-[9px] text-muted-foreground/70 tracking-widest font-mono">
              Vercel Ready
            </span>
          </div>
        </div>
      )}
    </aside>
  )
}
