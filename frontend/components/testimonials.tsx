"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Star, Quote, CheckCircle2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const reviews = [
  {
    name: "Aoife Gallagher",
    location: "Dublin 2",
    date: "2 days ago",
    service: "Signature Gel Manicure",
    text: "The most relaxing manicure and pedicure session I've had in Ireland. The attention to detail, warm rose tea, and luxurious chairs made me forget I was in the middle of Dublin city center.",
    verified: true,
  },
  {
    name: "Dr. Siobhan O'Connor",
    location: "Ballsbridge",
    date: "1 week ago",
    service: "Royal Rose Petal Pedicure",
    text: "5th Avenue is an absolute gem on Clarendon Street. The copper basin rose petal treatment is pure bliss after long hospital shifts. Meticulous hygiene standards and gorgeous aesthetics.",
    verified: true,
  },
  {
    name: "Emma Fitzgerald",
    location: "Ranelagh",
    date: "2 weeks ago",
    service: "Japanese BIAB & Gold Flakes",
    text: "My BIAB nails have lasted four weeks without a single chip. The nail artist was gentle, precise, and created the exact editorial aesthetic I wanted for my wedding.",
    verified: true,
  },
]

export function TestimonialsSection() {
  return (
    <section id="experience" className="py-24 bg-muted/40 relative overflow-hidden border-t border-border/40">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        {/* Massive Social Proof Banner */}
        <div className="bg-gradient-to-br from-card via-card/90 to-accent/30 rounded-3xl p-8 md:p-14 border border-border/80 shadow-xl mb-16 text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center"
          >
            {/* Stars */}
            <div className="flex items-center gap-1.5 text-amber-400 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 md:w-8 md:h-8 fill-current" />
              ))}
            </div>

            {/* Big 4.9 Rating */}
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-5xl md:text-7xl font-serif font-bold text-foreground">
                4.9
              </span>
              <span className="text-xl md:text-2xl text-muted-foreground font-light">
                / 5.0
              </span>
            </div>

            <p className="text-sm md:text-base font-medium tracking-wide text-foreground uppercase tracking-widest mb-4">
              Rated Outstanding Based on 1,755 Google Reviews
            </p>

            {/* Featured Quote Highlight */}
            <div className="relative mt-6 pt-6 border-t border-border/60 max-w-2xl">
              <Quote className="w-10 h-10 text-primary/25 absolute -top-5 left-1/2 transform -translate-x-1/2" />
              <p className="text-lg md:text-2xl font-serif italic text-foreground leading-snug">
                &ldquo;The most relaxing manicure and pedicure session I&apos;ve had in Ireland&rdquo;
              </p>
              <span className="block text-xs uppercase tracking-widest text-primary font-semibold mt-3">
                — Verified Dublin Client
              </span>
            </div>
          </motion.div>
        </div>

        {/* Client Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full bg-card border-border/70 p-6 flex flex-col justify-between hover:shadow-lg transition-all duration-300">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground font-light">
                      {rev.date}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/90 leading-relaxed font-light mb-6">
                    &ldquo;{rev.text}&rdquo;
                  </p>
                </CardContent>

                <div className="pt-4 border-t border-border/50 flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                      {rev.name}
                      {rev.verified && (
                        <span title="Verified Customer">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        </span>
                      )}
                    </h5>
                    <span className="text-xs text-muted-foreground">
                      {rev.location} • {rev.service}
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
