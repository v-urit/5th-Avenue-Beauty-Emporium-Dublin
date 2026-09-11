"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { MapPin, Clock, Phone, Mail, ExternalLink, Navigation } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function LocationHours() {
  const mapUrl = "https://maps.google.com/?q=45+Clarendon+Street+Dublin+Ireland"

  return (
    <section id="location" className="py-24 bg-background border-t border-border/50">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Info Details (7 cols) */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 space-y-8"
          >
            <div>
              <Badge variant="gold" className="mb-4">
                Dublin 2 Sanctuary
              </Badge>
              <h2 className="text-3xl md:text-5xl font-serif font-bold tracking-tight text-foreground">
                Visit 5th Avenue Emporium
              </h2>
              <p className="text-muted-foreground text-base mt-4 font-light leading-relaxed max-w-xl">
                Situated just steps off Grafton Street on tranquil Clarendon Street. A refined haven designed for unhurried pampering after work or weekend shopping.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Address card */}
              <div className="p-5 rounded-2xl bg-muted/40 border border-border/60">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                  <MapPin className="w-5 h-5" />
                </div>
                <h4 className="font-semibold text-sm text-foreground uppercase tracking-wider mb-1">
                  Address
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  45 Clarendon Street<br />
                  Dublin 2, D02 YH58<br />
                  Ireland
                </p>
              </div>

              {/* Hours card */}
              <div className="p-5 rounded-2xl bg-muted/40 border border-border/60">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-sm text-foreground uppercase tracking-wider">
                    Opening Hours
                  </h4>
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                  Open until 20:00 Daily
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Monday – Sunday: 09:30 – 20:00
                </p>
              </div>
            </div>

            {/* Contact Info & Google Maps CTA */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="luxury" size="lg" className="rounded-xl gap-2.5">
                  <Navigation className="w-4 h-4" />
                  <span>Get Directions on Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </Button>
              </a>

              <a href="tel:+35316712345">
                <Button variant="outline" size="lg" className="rounded-xl gap-2">
                  <Phone className="w-4 h-4 text-primary" />
                  <span>+353 (01) 671 2345</span>
                </Button>
              </a>
            </div>
          </motion.div>

          {/* Stylized Map View / Visual Card (5 cols) */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5"
          >
            <Card className="overflow-hidden border-border/80 shadow-xl bg-card rounded-3xl relative">
              <div className="p-8 text-center bg-gradient-to-b from-primary/10 to-transparent">
                <div className="inline-flex p-4 rounded-full bg-primary/20 text-primary mb-4">
                  <MapPin className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-serif font-bold text-foreground mb-2">
                  Prime Dublin Location
                </h3>
                <p className="text-sm text-muted-foreground font-light mb-6">
                  Corner of Clarendon & Chatham Street, adjacent to Dublin&apos;s Westbury Quarter.
                </p>
                <div className="space-y-3 text-xs text-left bg-background/80 backdrop-blur-sm p-4 rounded-2xl border border-border/60">
                  <div className="flex justify-between py-1 border-b border-border/40">
                    <span className="text-muted-foreground">Stephen&apos;s Green Luas:</span>
                    <span className="font-medium text-foreground">3 min walk</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/40">
                    <span className="text-muted-foreground">Grafton Street:</span>
                    <span className="font-medium text-foreground">1 min walk</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Parking:</span>
                    <span className="font-medium text-foreground">Brown Thomas Car Park</span>
                  </div>
                </div>
                <div className="mt-6">
                  <a
                    href={mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full"
                  >
                    <Button variant="secondary" className="w-full rounded-xl">
                      Open Live GPS Navigation
                    </Button>
                  </a>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
