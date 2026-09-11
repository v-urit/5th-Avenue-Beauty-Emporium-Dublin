"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { User, Phone, Mail, ShieldCheck, KeyRound, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { profileSchema, type ProfileInput } from "@/lib/validations"
import { api } from "@/lib/api"
import { apiErrorMessage, type UserDTO } from "@/lib/types"
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
import { Badge } from "@/components/ui/badge"

interface EditProfileDialogProps {
  isOpen: boolean
  onClose: () => void
  /** May be a partial profile cached in localStorage before the live fetch resolves. */
  currentUser: Partial<UserDTO> | null
  onProfileUpdated: (updatedUser: UserDTO) => void
}

export function EditProfileDialog({
  isOpen,
  onClose,
  currentUser,
  onProfileUpdated,
}: EditProfileDialogProps) {
  const [loading, setLoading] = React.useState(false)
  const [otpSending, setOtpSending] = React.useState(false)
  const [otpSent, setOtpSent] = React.useState(false)
  const [otpCountdown, setOtpCountdown] = React.useState(0)
  const [formError, setFormError] = React.useState("")
  const [successMsg, setSuccessMsg] = React.useState("")

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: currentUser?.name || "",
      phone: currentUser?.phone || "",
      otp_code: "",
    },
  })

  // Sync form when currentUser changes or dialog opens
  React.useEffect(() => {
    if (isOpen && currentUser) {
      reset({
        name: currentUser.name || "",
        phone: currentUser.phone || "",
        otp_code: "",
      })
      setOtpSent(false)
      setFormError("")
      setSuccessMsg("")
    }
  }, [isOpen, currentUser, reset])

  // Countdown timer for resend OTP
  React.useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setTimeout(() => setOtpCountdown((c) => c - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [otpCountdown])

  const watchedPhone = watch("phone") || ""
  const originalPhone = currentUser?.phone || ""
  const isPhoneChanged = watchedPhone.trim() !== originalPhone.trim() && watchedPhone.trim() !== ""

  const handleSendOTP = async () => {
    setFormError("")
    if (!watchedPhone || watchedPhone.length < 8) {
      setFormError("Please enter a valid phone number (minimum 8 digits)")
      return
    }

    setOtpSending(true)
    try {
      await api.post("/auth/otp/send", { phone: watchedPhone.trim() })
      setOtpSent(true)
      setOtpCountdown(60) // 60s cooldown for resend
    } catch (err) {
      setFormError(apiErrorMessage(err, "Failed to send verification code. Please try again."))
    } finally {
      setOtpSending(false)
    }
  }

  const onSubmit = async (data: ProfileInput) => {
    setFormError("")
    setSuccessMsg("")

    // If phone has changed and OTP was not yet sent, trigger OTP first
    if (isPhoneChanged && !otpSent) {
      await handleSendOTP()
      return
    }

    // If phone has changed and user hasn't entered OTP code
    if (isPhoneChanged && (!data.otp_code || data.otp_code.trim().length !== 6)) {
      setFormError("Please enter the 6-digit verification code sent to your new phone number.")
      return
    }

    setLoading(true)
    try {
      interface ProfileUpdatePayload {
        name: string
        phone?: string
        otp_code?: string
      }
      const payload: ProfileUpdatePayload = {
        name: data.name.trim(),
      }

      if (isPhoneChanged) {
        payload.phone = data.phone?.trim()
        payload.otp_code = data.otp_code?.trim()
      }

      const res = await api.patch<{ user?: UserDTO } | UserDTO>("/user/profile", payload)
      const dataPayload = res.data as { user?: UserDTO }
      const updated = (dataPayload.user || res.data) as UserDTO

      setSuccessMsg("Profile successfully updated!")
      onProfileUpdated(updated)

      setTimeout(() => {
        onClose()
      }, 1200)
    } catch (err) {
      setFormError(apiErrorMessage(err, "Failed to update profile. Please verify your details."))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-card text-foreground border-border/80">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Edit Sanctuary Profile</DialogTitle>
          <DialogDescription className="text-xs">
            Update your personal details. Changing your phone number requires SMS OTP verification.
          </DialogDescription>
        </DialogHeader>

        {formError && (
          <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Full Name */}
          <div className="space-y-1.5">
            <Label htmlFor="profile-name" className="text-xs font-semibold flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-primary" />
              <span>Full Name</span>
            </Label>
            <Input
              id="profile-name"
              placeholder="e.g. Eleanor Vance"
              {...register("name")}
              className="h-11 rounded-xl"
            />
            {errors.name && (
              <p className="text-[11px] text-destructive font-medium">{errors.name.message}</p>
            )}
          </div>

          {/* Email (Read Only) */}
          <div className="space-y-1.5 opacity-80">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Primary Email</span>
              </Label>
              <Badge variant="outline" className="text-[10px] py-0">Primary ID</Badge>
            </div>
            <Input
              value={currentUser?.email || "No email on record"}
              disabled
              className="h-11 rounded-xl bg-muted/40 cursor-not-allowed text-muted-foreground"
            />
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="profile-phone" className="text-xs font-semibold flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-primary" />
                <span>Mobile Phone</span>
              </Label>
              {currentUser?.phone_verified && !isPhoneChanged && (
                <Badge variant="success" className="text-[10px] gap-1 py-0">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Verified</span>
                </Badge>
              )}
            </div>
            <Input
              id="profile-phone"
              placeholder="+353 87 123 4567"
              {...register("phone")}
              className="h-11 rounded-xl"
            />
            {errors.phone && (
              <p className="text-[11px] text-destructive font-medium">{errors.phone.message}</p>
            )}
          </div>

          {/* OTP Verification Section if Phone is Changed */}
          {isPhoneChanged && (
            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-3 transition-all animate-in fade-in-50">
              <div className="flex items-start gap-2">
                <KeyRound className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-semibold text-foreground">Phone Verification Required</p>
                  <p className="text-muted-foreground text-[11px] mt-0.5">
                    We must verify ownership of your new number via SMS before saving.
                  </p>
                </div>
              </div>

              {!otpSent ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSendOTP}
                  disabled={otpSending}
                  className="w-full rounded-xl border-primary/30 text-primary hover:bg-primary/10"
                >
                  {otpSending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      <span>Sending SMS Code...</span>
                    </>
                  ) : (
                    <span>Send Verification Code to {watchedPhone}</span>
                  )}
                </Button>
              ) : (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="otp-code" className="text-xs font-medium">
                      Enter 6-Digit Code
                    </Label>
                    <button
                      type="button"
                      disabled={otpCountdown > 0 || otpSending}
                      onClick={handleSendOTP}
                      className="text-[11px] text-primary hover:underline disabled:opacity-50 disabled:no-underline"
                    >
                      {otpCountdown > 0 ? `Resend in ${otpCountdown}s` : "Resend Code"}
                    </button>
                  </div>
                  <Input
                    id="otp-code"
                    placeholder="123456"
                    maxLength={6}
                    {...register("otp_code")}
                    className="h-11 text-center font-mono tracking-widest text-base rounded-xl font-bold"
                  />
                  <p className="text-[10px] text-muted-foreground text-center">
                    (In local development, the OTP code is logged in the backend console)
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="luxury"
              disabled={loading || (isPhoneChanged && !otpSent)}
              className="rounded-xl min-w-[120px]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  <span>Saving...</span>
                </>
              ) : isPhoneChanged && !otpSent ? (
                <span>Verify Phone</span>
              ) : (
                <span>Save Changes</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
