"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sparkles, Calendar, User, LogOut } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"

export function Navbar() {
  const pathname = usePathname()
  const [user, setUser] = React.useState<{ name: string; email?: string } | null>(null)

  React.useEffect(() => {
    const rawUser = localStorage.getItem("user")
    if (rawUser) {
      try {
        setUser(JSON.parse(rawUser))
      } catch {
        setUser(null)
      }
    }
  }, [pathname])

  const handleLogout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    localStorage.removeItem("user")
    setUser(null)
    window.location.href = "/"
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl transition-all">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-8 max-w-7xl">
        {/* Brand Logo */}
        <Link href="/" className="flex flex-col group">
          <span className="text-xl md:text-2xl font-serif tracking-[0.25em] font-semibold text-foreground group-hover:text-primary transition-colors">
            5TH AVENUE
          </span>
          <span className="text-[10px] tracking-[0.35em] text-muted-foreground uppercase font-medium">
            BEAUTY EMPORIUM • DUBLIN
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium tracking-wide">
          <Link
            href="#services"
            className="text-muted-foreground hover:text-foreground transition-colors hover:translate-y-[-1px]"
          >
            Services
          </Link>
          <Link
            href="#gallery"
            className="text-muted-foreground hover:text-foreground transition-colors hover:translate-y-[-1px]"
          >
            Gallery
          </Link>
          <Link
            href="#experience"
            className="text-muted-foreground hover:text-foreground transition-colors hover:translate-y-[-1px]"
          >
            Testimonials
          </Link>
          <Link
            href="#location"
            className="text-muted-foreground hover:text-foreground transition-colors hover:translate-y-[-1px]"
          >
            Location
          </Link>
          <Link
            href="/admin"
            className="text-primary hover:text-primary/80 font-medium transition-colors hover:translate-y-[-1px]"
          >
            Admin
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          <ThemeToggle />

          {user ? (
            <div className="flex items-center space-x-2">
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="hidden sm:inline-flex rounded-xl gap-2 font-medium">
                  <User className="h-4 w-4 text-primary" />
                  <span>{user.name.split(" ")[0]}</span>
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                title="Sign Out"
                className="h-10 w-10 text-muted-foreground hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Link href="/login">
              <Button variant="ghost" size="sm" className="rounded-xl text-sm font-medium">
                Sign In
              </Button>
            </Link>
          )}

          <Link href="/booking">
            <Button variant="luxury" size="default" className="rounded-xl shadow-md gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Book Appointment</span>
              <span className="sm:hidden">Book</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
