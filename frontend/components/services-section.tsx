"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Clock, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const services = [
  {
    id: "sig-manicure",
    title: "5th Avenue Signature Gel Manicure",
    category: "Manicure",
    description:
      "Full cuticle wellness, gentle exfoliating scrub, meticulous shaping, and long-lasting glossy gel finish with soothing botanical hand massage.",
    duration: "60 mins",
    price: "€55",
    image: "/images/hero_manicure.jpg",
    badge: "Most Popular",
    highlights: ["Detailed cuticle work", "LED-cured gel polish", "Organic nourishing oils"],
  },
  {
    id: "rose-pedicure",
    title: "Royal Rose Petal Spa Pedicure",
    category: "Pedicure",
    description:
      "Deeply calming copper basin soak in fragrant garden rose petals and Himalayan salts, callus smoothing, and hot stone leg relaxation.",
    duration: "75 mins",
    price: "€75",
    image: "/images/hero_pedicure.jpg",
    badge: "Client Favorite",
    highlights: ["Copper bowl hydrotherapy", "Rose petal botanicals", "Lower leg hot stone massage"],
  },
  {
    id: "biab-extensions",
    title: "Japanese BIAB & 24k Gold Flake Extensions",
    category: "Couture Nails",
    description:
      "Builder in a Bottle (BIAB) structure overlay to strengthen natural nails, finished with bespoke hand-applied 24-karat gold leaf artistry.",
    duration: "90 mins",
    price: "€90",
    image: "/images/gallery_nail_art.jpg",
    badge: "Artisan Signature",
    highlights: ["High apex reinforcement", "Real 24k gold leaf flakes", "Up to 4 weeks durability"],
  },
  {
    id: "paraffin-treatment",
    title: "Warm Paraffin Cocoon & Polish",
    category: "Restorative Spa",
    description:
      "Deep moisture infusion through warm scented paraffin wax, melting muscle tension and rejuvenating tired hands, followed by elegant polish.",
    duration: "60 mins",
    price: "€65",
    image: "/images/gallery_spa_hands.jpg",
    badge: "Deep Hydration",
    highlights: ["Thermal wax wrap", "Intense hydration", "Velvet hand finish"],
  },
  {
    id: "express-manicure",
    title: "Executive Express City Manicure",
    category: "Manicure",
    description:
      "Designed for busy Dublin professionals. Swift nail shaping, tidy cuticles, high-buff shine, or quick-dry breathable lacquer.",
    duration: "45 mins",
    price: "€40",
    image: "/images/gallery_french_chic.jpg",
    badge: "Fast & Chic",
    highlights: ["Time-efficient", "Clean cuticles & shape", "High-shine finish"],
  },
  {
    id: "herbal-foot-ritual",
    title: "Detoxifying Botanical Foot Ritual",
    category: "Pedicure",
    description:
      "Eucalyptus and lavender organic essential oil bath, invigorating salt exfoliation, and tension-releasing reflexology foot pressure therapy.",
    duration: "75 mins",
    price: "€80",
    image: "/images/gallery_pedicure_care.jpg",
    badge: "Detox Therapy",
    highlights: ["Eucalyptus & magnesium soak", "Foot reflexology", "Intense heel recovery"],
  },
]

export function ServicesSection() {
  return (
    <section id="services" className="py-24 bg-background relative">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-widest uppercase mb-4"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated Treatment Menu</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-5xl font-serif font-bold tracking-tight text-foreground"
          >
            Signature Services
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-muted-foreground text-base mt-4 font-light leading-relaxed"
          >
            Every treatment is performed with non-toxic, cruelty-free formulas, sterile single-use tools, and unhurried Dublin hospitality.
          </motion.p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.6, delay: index * 0.08 }}
            >
              <Card className="h-full flex flex-col overflow-hidden border-border/80 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 group">
                {/* Image & Price Tag */}
                <div className="relative h-56 w-full overflow-hidden bg-muted">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute top-4 left-4">
                    <Badge variant="gold" className="backdrop-blur-md bg-black/40 font-semibold">
                      {service.badge}
                    </Badge>
                  </div>
                  <div className="absolute bottom-4 right-4 bg-background/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-border/80 shadow-md">
                    <span className="text-lg font-serif font-bold text-foreground">
                      {service.price}
                    </span>
                  </div>
                </div>

                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-medium mb-1">
                    <span className="uppercase tracking-widest text-primary font-semibold">
                      {service.category}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      {service.duration}
                    </span>
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {service.title}
                  </CardTitle>
                  <CardDescription className="pt-2 text-sm text-muted-foreground/90 leading-relaxed">
                    {service.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-grow pt-2">
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    {service.highlights.map((h, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="pt-4 border-t border-border/40">
                  <Link href={`/booking?service=${service.id}`} className="w-full">
                    <Button variant="outline" className="w-full rounded-xl justify-between group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all">
                      <span>Reserve This Treatment</span>
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
