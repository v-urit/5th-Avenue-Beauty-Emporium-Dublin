"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Calendar,
  Users,
  Sparkles,
  Clock,
  MapPin,
  ExternalLink,
  Shield,
  ChevronRight,
  LogOut,
  MessageSquare,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { UserDTO } from "@/lib/types"

interface AdminSidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  currentUser: Partial<UserDTO> | null
  onLogout: () => void
  totalBookingsCount?: number
  todayBookingsCount?: number
  totalClientsCount?: number
  openTicketsCount?: number
}

export function AdminSidebar({
  activeTab,
  setActiveTab,
  currentUser,
  onLogout,
  totalBookingsCount = 0,
  todayBookingsCount = 0,
  totalClientsCount = 0,
  openTicketsCount = 0,
}: AdminSidebarProps) {
  const navItems = [
    {
      id: "overview",
      label: "Overview",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: "appointments",
      label: "Appointments",
      icon: Calendar,
      badge: totalBookingsCount > 0 ? totalBookingsCount.toString() : null,
    },
    {
      id: "schedule",
      label: "Today's Schedule",
      icon: Clock,
      badge: todayBookingsCount > 0 ? `${todayBookingsCount} Today` : null,
      badgeVariant: "gold" as const,
    },
    {
      id: "clients",
      label: "Client Directory",
      icon: Users,
      badge: totalClientsCount > 0 ? totalClientsCount.toString() : null,
    },
    {
      id: "tickets",
      label: "Tickets & Inquiries",
      icon: MessageSquare,
      badge: openTicketsCount > 0 ? `${openTicketsCount} New` : null,
      badgeVariant: "gold" as const,
    },
    {
      id: "services",
      label: "Treatment Menu",
      icon: Sparkles,
      badge: null,
    },
  ]

  return (
    <aside className="w-full lg:w-72 bg-card border-r border-border/70 flex flex-col justify-between shrink-0 min-h-screen">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-border/60">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#9e7552] to-[#c9a37e] text-white flex items-center justify-center font-serif text-lg font-bold shadow-md shadow-primary/25 group-hover:scale-105 transition-transform">
              5th
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-base tracking-wide text-foreground">
                  5th Avenue
                </span>
                <Badge variant="gold" className="text-[9px] px-1.5 py-0">
                  ADMIN
                </Badge>
              </div>
              <span className="text-[11px] text-muted-foreground block -mt-0.5 font-light">
                Sanctuary Management Portal
              </span>
            </div>
          </Link>

          {/* Salon Status Pill */}
          <div className="mt-4 p-2.5 rounded-xl bg-muted/40 border border-border/50 text-[11px] text-muted-foreground flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-medium text-foreground">Salon Open</span>
            </div>
            <span>Until 20:00</span>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="p-4 space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/70 px-3 mb-2 block">
            Navigation
          </span>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-primary-foreground" : "text-primary"}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <Badge
                    variant={item.badgeVariant || (isActive ? "secondary" : "outline")}
                    className={`text-[10px] px-1.5 py-0 ${
                      isActive ? "bg-primary-foreground/20 text-primary-foreground border-transparent" : ""
                    }`}
                  >
                    {item.badge}
                  </Badge>
                )}
              </button>
            )
          })}
        </div>

        {/* Quick Links */}
        <div className="p-4 pt-2 space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/70 px-3 mb-2 block">
            Salon Links
          </span>
          <Link
            href="/"
            target="_blank"
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Client Showcase (Live)</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 opacity-50" />
          </Link>
          <Link
            href="/booking"
            target="_blank"
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Client Booking Flow</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 opacity-50" />
          </Link>
        </div>
      </div>

      {/* Admin User Footer Card */}
      <div className="p-4 border-t border-border/60">
        <div className="p-3 rounded-2xl bg-muted/30 border border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-serif text-xs font-bold shrink-0">
              {currentUser?.name ? currentUser.name[0].toUpperCase() : "A"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">
                {currentUser?.name || "Salon Administrator"}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                {currentUser?.email || "admin@5thavenue.ie"}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onLogout}
            title="Sign Out"
            className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </aside>
  )
}
