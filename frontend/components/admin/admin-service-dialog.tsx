"use client"

import * as React from "react"
import { Sparkles, Clock, Euro, Image as ImageIcon, Loader2, AlertCircle } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/lib/api"
import { apiErrorMessage, type CatalogService } from "@/lib/types"

interface AdminServiceDialogProps {
  isOpen: boolean
  onClose: () => void
  onSaved: () => void
  serviceToEdit?: CatalogService | null
}

const presetImages = [
  { url: "/images/hero_manicure.jpg", label: "Signature Gel Manicure" },
  { url: "/images/hero_pedicure.jpg", label: "Rose Petal Pedicure" },
  { url: "/images/hero_salon.jpg", label: "Salon Interior" },
  { url: "/images/gallery_nail_art.jpg", label: "Japanese BIAB & Gold" },
  { url: "/images/gallery_pedicure_care.jpg", label: "Botanical Foot Ritual" },
  { url: "/images/gallery_french_chic.jpg", label: "French Chic Manicure" },
  { url: "/images/gallery_spa_hands.jpg", label: "Paraffin Hand Ritual" },
]

export function AdminServiceDialog({
  isOpen,
  onClose,
  onSaved,
  serviceToEdit,
}: AdminServiceDialogProps) {
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [price, setPrice] = React.useState("55")
  const [duration, setDuration] = React.useState("60")
  const [category, setCategory] = React.useState("manicure")
  const [imageUrl, setImageUrl] = React.useState("/images/hero_manicure.jpg")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")

  React.useEffect(() => {
    if (isOpen) {
      if (serviceToEdit) {
        setTitle(serviceToEdit.title || "")
        setDescription(serviceToEdit.description || "")
        const numPrice = serviceToEdit.price ? serviceToEdit.price.toString().replace(/[^0-9.]/g, "") : "55"
        setPrice(numPrice)
        setDuration(String(serviceToEdit.duration_minutes || serviceToEdit.duration || 60))
        setCategory(serviceToEdit.category || "manicure")
        setImageUrl(serviceToEdit.image_url || serviceToEdit.image || "/images/hero_manicure.jpg")
      } else {
        setTitle("")
        setDescription("")
        setPrice("55")
        setDuration("60")
        setCategory("manicure")
        setImageUrl("/images/hero_manicure.jpg")
      }
      setError("")
    }
  }, [isOpen, serviceToEdit])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!title.trim()) {
      setError("Please provide a service title")
      return
    }

    const parsedPrice = parseInt(price, 10)
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setError("Please enter a valid price (e.g. 55)")
      return
    }

    const parsedDuration = parseInt(duration, 10)
    if (isNaN(parsedDuration) || parsedDuration <= 0) {
      setError("Please enter a valid treatment duration in minutes (e.g. 60)")
      return
    }

    setLoading(true)

    try {
      if (serviceToEdit?.id) {
        await api.patch(`/admin/services/${serviceToEdit.id}`, {
          title: title.trim(),
          description: description.trim(),
          price: parsedPrice,
          duration_minutes: parsedDuration,
          category,
          image_url: imageUrl,
        })
      } else {
        await api.post("/admin/services", {
          title: title.trim(),
          description: description.trim(),
          price: parsedPrice,
          duration_minutes: parsedDuration,
          category,
          image_url: imageUrl,
        })
      }

      onSaved()
      onClose()
    } catch (err) {
      setError(apiErrorMessage(err, "Failed to save treatment service"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-3xl p-6 bg-card border-border/80">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            {serviceToEdit ? "Edit Treatment Service" : "Add New Treatment"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Configure treatment title, duration, pricing, and showcase image for 5th Avenue salon.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {error && (
            <div className="p-3 text-xs text-red-600 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="service-title" className="text-xs font-semibold">
              Treatment Title
            </Label>
            <Input
              id="service-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Signature Rose Gold Pedicure"
              required
              className="rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="service-price" className="text-xs font-semibold flex items-center gap-1">
                <Euro className="w-3.5 h-3.5 text-primary" />
                Price (€)
              </Label>
              <Input
                id="service-price"
                type="number"
                min="1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="55"
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="service-duration" className="text-xs font-semibold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-primary" />
                Duration (Mins)
              </Label>
              <Input
                id="service-duration"
                type="number"
                min="15"
                step="5"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="60"
                required
                className="rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="service-cat" className="text-xs font-semibold">
              Category
            </Label>
            <select
              id="service-cat"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="manicure">Manicure</option>
              <option value="pedicure">Pedicure</option>
              <option value="treatment">Therapeutic Treatment</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5 text-primary" />
              Showcase Photography
            </Label>
            <div className="grid grid-cols-4 gap-2 pt-1">
              {presetImages.map((img) => (
                <button
                  key={img.url}
                  type="button"
                  onClick={() => setImageUrl(img.url)}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                    imageUrl === img.url
                      ? "border-primary ring-2 ring-primary/40 scale-105"
                      : "border-border/60 opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <Input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Or enter custom image URL"
              className="rounded-xl mt-2 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="service-desc" className="text-xs font-semibold">
              Description
            </Label>
            <Textarea
              id="service-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the luxury treatment ritual, steps, and techniques..."
              className="rounded-xl text-xs"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="luxury"
              disabled={loading}
              className="rounded-xl shadow-md min-w-[120px]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : serviceToEdit ? (
                "Save Changes"
              ) : (
                "Add Treatment"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
