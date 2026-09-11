"use client"

import * as React from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Sparkles, Eye } from "lucide-react"

const row1 = [
  { src: "/images/hero_manicure.jpg", title: "Signature Nude Gel", desc: "Glossy finish on cashmere" },
  { src: "/images/gallery_nail_art.jpg", title: "Japanese BIAB & 24k Gold", desc: "Gold flake overlay" },
  { src: "/images/hero_pedicure.jpg", title: "Rose Petal Copper Soak", desc: "Botanical sanctuary" },
  { src: "/images/gallery_french_chic.jpg", title: "Classic Dublin French Tip", desc: "Almond shaped precision" },
  { src: "/images/gallery_spa_hands.jpg", title: "Warm Oil Hand Massage", desc: "Essential lavender & jasmine" },
  { src: "/images/gallery_pedicure_care.jpg", title: "Botanical Exfoliation Ritual", desc: "Therapeutic foot care" },
]

const row2 = [
  { src: "/images/hero_salon.jpg", title: "Clarendon St. Salon Lounge", desc: "Velvet seating & marble counters" },
  { src: "/images/gallery_spa_hands.jpg", title: "Hydrating Treatment", desc: "Organic nourishment" },
  { src: "/images/gallery_nail_art.jpg", title: "Editorial Artisan BIAB", desc: "Architectural apex balance" },
  { src: "/images/hero_manicure.jpg", title: "Couture Manicure Studio", desc: "Refined luxury aesthetic" },
  { src: "/images/gallery_pedicure_care.jpg", title: "Sensory Pedicure Basin", desc: "Pure serenity in Dublin" },
  { src: "/images/gallery_french_chic.jpg", title: "Champagne Lounge Session", desc: "5-star relaxation" },
]

export function MarqueeGallery() {
  return (
    <section id="gallery" className="py-24 bg-muted/20 overflow-hidden border-y border-border/40">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl mb-14 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-widest uppercase mb-4"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Infinite Visual Showcase</span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl md:text-5xl font-serif font-bold tracking-tight text-foreground"
        >
          Craftsmanship & Atmosphere
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto mt-4 font-light leading-relaxed"
        >
          A continuous glimpse into our Dublin salon sanctuary. Hover over any frame to pause and admire the detail.
        </motion.p>
      </div>

      {/* Marquee Container with Pause on Hover */}
      <div className="marquee-container space-y-6 md:space-y-8 select-none">
        {/* Row 1: Scrolling to Left */}
        <div className="flex overflow-hidden relative">
          <div className="animate-marquee-left flex gap-6 md:gap-8 items-center">
            {/* Duplicate array to ensure seamless infinite scroll */}
            {[...row1, ...row1].map((item, idx) => (
              <MarqueeCard key={`row1-${idx}`} item={item} />
            ))}
          </div>
        </div>

        {/* Row 2: Scrolling to Right in Alternating Direction */}
        <div className="flex overflow-hidden relative">
          <div className="animate-marquee-right flex gap-6 md:gap-8 items-center">
            {/* Duplicate array to ensure seamless infinite scroll */}
            {[...row2, ...row2].map((item, idx) => (
              <MarqueeCard key={`row2-${idx}`} item={item} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function MarqueeCard({
  item,
}: {
  item: { src: string; title: string; desc: string }
}) {
  return (
    <div className="group relative flex-shrink-0 w-[280px] sm:w-[340px] md:w-[400px] h-[220px] sm:h-[260px] rounded-2xl overflow-hidden bg-card border border-border/80 shadow-md transition-all duration-500 hover:scale-[1.03] hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-primary/15 hover:border-primary/50">
      <Image
        src={item.src}
        alt={item.title}
        fill
        sizes="(max-width: 768px) 300px, 420px"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-108"
      />
      {/* Subtle Gradient Veil */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-300" />

      {/* Card Caption Overlay */}
      <div className="absolute inset-x-0 bottom-0 p-5 text-white flex flex-col justify-end transform transition-transform duration-300">
        <span className="text-[11px] uppercase tracking-widest text-amber-300/90 font-medium">
          {item.desc}
        </span>
        <h4 className="text-base sm:text-lg font-serif font-semibold text-white tracking-wide mt-1">
          {item.title}
        </h4>
      </div>

      {/* Hover Inspection Badge */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full p-2 bg-black/40 backdrop-blur-md text-white border border-white/20">
        <Eye className="w-4 h-4 text-amber-200" />
      </div>
    </div>
  )
}
