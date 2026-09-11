"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff, AlertCircle, Shield, User, Sparkles } from "lucide-react"
import { api } from "@/lib/api"
import { apiErrorMessage, type AuthResponse } from "@/lib/types"
import { signupSchema, type SignupInput } from "@/lib/validations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignupPage() {
  const router = useRouter()
  const [serverError, setServerError] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [testLoading, setTestLoading] = React.useState<string | null>(null)

  // React Hook Form with Zod schema resolver
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
    },
  })

  const onSubmit = async (data: SignupInput) => {
    setServerError("")
    try {
      const resp = await api.post<AuthResponse>("/auth/register", {
        name: data.name.trim(),
        email: data.email.trim(),
        phone: data.phone?.trim() || undefined,
        password: data.password,
      })

      localStorage.setItem("access_token", resp.data.access_token)
      localStorage.setItem("refresh_token", resp.data.refresh_token)
      localStorage.setItem("user", JSON.stringify(resp.data.user))
      router.push("/dashboard")
    } catch (err) {
      setServerError(apiErrorMessage(err, "Registration failed. Please verify your details."))
    }
  }

  const handleGoogleLogin = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    if (apiUrl && !apiUrl.includes("localhost")) {
      window.location.href = `${apiUrl}/auth/google`
    } else {
      // Instant demo client login
      localStorage.setItem("demo_mode", "true")
      localStorage.setItem("access_token", `demo-token-google-${Date.now()}`)
      localStorage.setItem("refresh_token", `demo-refresh-google-${Date.now()}`)
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: "client-demo-id",
          name: "Elena Rostova",
          email: "elena.client@5thavenue.ie",
          phone: "+353871234567",
          role: "customer",
          phone_verified: true,
        })
      )
      router.push("/dashboard")
    }
  }

  const handleTestLogin = (role: "admin" | "user") => {
    setTestLoading(role)
    setServerError("")

    const testAccounts = {
      admin: {
        name: "Salon Administrator",
        email: "admin@5thavenue.ie",
        phone: "+353870000001",
        role: "admin" as const,
        redirectTo: "/admin",
      },
      user: {
        name: "Elena Rostova",
        email: "elena.client@5thavenue.ie",
        phone: "+353871234567",
        role: "customer" as const,
        redirectTo: "/dashboard",
      },
    }

    const target = testAccounts[role]

    localStorage.setItem("demo_mode", "true")
    localStorage.setItem("access_token", `demo-token-${role}-${Date.now()}`)
    localStorage.setItem("refresh_token", `demo-refresh-${Date.now()}`)
    localStorage.setItem(
      "user",
      JSON.stringify({
        id: role === "admin" ? "admin-demo-id" : "client-demo-id",
        name: target.name,
        email: target.email,
        phone: target.phone,
        role: target.role,
        phone_verified: true,
      })
    )

    setTimeout(() => {
      router.push(target.redirectTo)
    }, 150)
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-muted/20 selection:bg-primary/20">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex flex-col items-center group">
            <span className="text-2xl font-serif tracking-[0.25em] font-bold text-foreground group-hover:text-primary transition-colors">
              5TH AVENUE
            </span>
            <span className="text-[10px] tracking-[0.35em] text-primary uppercase font-semibold">
              BEAUTY EMPORIUM • DUBLIN
            </span>
          </Link>
          <p className="text-xs text-muted-foreground font-light pt-1">
            Create your client profile for bespoke care
          </p>
        </div>

        {/* shadcn Auth Block */}
        <Card className="border-border/80 shadow-2xl bg-card rounded-3xl overflow-hidden">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-serif text-center">Join 5th Avenue</CardTitle>
            <CardDescription className="text-center text-xs">
              Instant 24/7 appointments and bespoke treatments
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {serverError && (
              <div className="p-3 text-xs text-red-600 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            {/* Quick Demo / Test Access Buttons */}
            <div className="p-3.5 bg-primary/5 border border-primary/20 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  Quick Demo Access
                </span>
                <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30 px-2 py-0.5 font-bold">
                  DEMO
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                To evaluate the portals, sign in instantly as an administrator or a client:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  disabled={!!testLoading}
                  onClick={() => handleTestLogin("admin")}
                  className="h-10 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Shield className="w-3.5 h-3.5" />
                  {testLoading === "admin" ? "Signing in..." : "Demo: Admin"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!!testLoading}
                  onClick={() => handleTestLogin("user")}
                  className="h-10 text-xs font-semibold rounded-xl border-primary/30 hover:bg-primary/10 flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <User className="w-3.5 h-3.5" />
                  {testLoading === "user" ? "Signing in..." : "Demo: Client"}
                </Button>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleLogin}
              className="w-full h-12 rounded-xl border-border/80 flex items-center justify-center gap-3 text-sm font-medium hover:bg-accent"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign Up with Google</span>
            </Button>

            <div className="relative flex items-center justify-center py-2">
              <div className="border-t border-border w-full" />
              <span className="bg-card px-3 text-[11px] uppercase tracking-wider text-muted-foreground absolute">
                or with email
              </span>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
              {/* Name input */}
              <div className="space-y-1.5">
                <Label htmlFor="name">Full Name (Letters only, no emojis)</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Elena Rostova"
                  {...register("name")}
                  className={errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-[11px] text-red-500">{errors.name.message}</p>
                )}
              </div>

              {/* Email input */}
              <div className="space-y-1.5">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="elena@luxury.ie"
                  {...register("email")}
                  className={errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-[11px] text-red-500">{errors.email.message}</p>
                )}
              </div>

              {/* Phone input */}
              <div className="space-y-1.5">
                <Label htmlFor="phone">Mobile Phone (Digits only, e.g. +353 87 123 4567)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+353 87 123 4567"
                  {...register("phone")}
                  className={errors.phone ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {errors.phone && (
                  <p className="text-[11px] text-red-500">{errors.phone.message}</p>
                )}
              </div>

              {/* Password input with show/hide toggle */}
              <div className="space-y-1.5">
                <Label htmlFor="password">Password (Minimum 6 characters)</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("password")}
                    className={`pr-10 ${errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                    tabIndex={-1}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-primary" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[11px] text-red-500">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                variant="luxury"
                className="w-full h-11 mt-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating Profile..." : "Create Client Account"}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-2 border-t border-border/50 pt-4 text-center">
            <p className="text-xs text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-semibold hover:underline">
                Sign In
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
