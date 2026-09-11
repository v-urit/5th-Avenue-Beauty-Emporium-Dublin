"use client"

import * as React from "react"
import { Search, Plus, Moon, Sun, Bell, RefreshCw, Menu } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface AdminHeaderProps {
  activeTabTitle: string
  searchQuery: string
  setSearchQuery: (q: string) => void
  onNewBookingClick: () => void
  onRefreshClick: () => void
  isRefreshing?: boolean
  onToggleMobileSidebar?: () => void
}

export function AdminHeader({
  activeTabTitle,
  searchQuery,
  setSearchQuery,
  onNewBookingClick,
  onRefreshClick,
  isRefreshing = false,
  onToggleMobileSidebar,
}: AdminHeaderProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="h-16 border-b border-border/70 bg-card/60 backdrop-blur-md px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Breadcrumbs & Mobile Trigger */}
      <div className="flex items-center gap-3">
        {onToggleMobileSidebar && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleMobileSidebar}
            className="lg:hidden h-9 w-9 rounded-xl"
          >
            <Menu className="w-5 h-5" />
          </Button>
        )}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground font-medium hidden sm:inline">5th Avenue</span>
          <span className="text-muted-foreground/50 hidden sm:inline">/</span>
          <span className="text-muted-foreground font-medium">Admin</span>
          <span className="text-muted-foreground/50">/</span>
          <span className="font-semibold text-foreground capitalize">{activeTabTitle}</span>
        </div>
      </div>

      {/* Right: Search, Actions, Theme & New Booking */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search bookings or clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 pl-9 text-xs rounded-xl bg-muted/40 border-border/60"
          />
        </div>

        {/* Refresh */}
        <Button
          variant="outline"
          size="icon"
          onClick={onRefreshClick}
          disabled={isRefreshing}
          title="Refresh Data"
          className="h-9 w-9 rounded-xl border-border/60 text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
        </Button>

        {/* Theme Toggle */}
        {mounted && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-9 w-9 rounded-xl border-border/60 text-muted-foreground hover:text-foreground"
            title="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-primary" />}
          </Button>
        )}
      </div>
    </header>
  )
}
