"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Calendar, Sparkles, Star } from "lucide-react"
import { Button } from "@/components/ui/button"

const slides = [
  {
    image: "/images/hero_manicure.jpg",
    tag: "COUTURE NAIL CARE",
    title: "Elegance at Your Fingertips",
    subtitle:
      "Dublin's premier sanctuary for bespoke gel manicures, Japanese BIAB overlays, and relaxing aesthetic precision.",
    cta: "Book Signature Manicure",
  },
  {
    image: "/images/hero_pedicure.jpg",
    tag: "RESTFUL SPA PEDICURES",
    title: "Tranquility in Every Ritual",
    subtitle:
      "Unwind with warm copper botanic basins, fresh garden rose petals, and rejuvenating organic foot therapies.",
    cta: "Reserve Spa Pedicure",
  },
  {
    image: "/images/hero_salon.jpg",
    tag: "CLARENDON STREET • DUBLIN 2",
    title: "An Editorial Salon Experience",
    subtitle:
      "A serene escape nestled in the heart of Dublin. Immerse yourself in 5-star hospitality, open until 20:00.",
    cta: "Explore Our Treatments",
  },
]

export function HeroCarousel() {
  const [current, setCurrent] = React.useState(0)
  const [direction, setDirection] = React.useState(1)

  // Auto-scroll every 6 seconds
  React.useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1)
      setCurrent((prev) => (prev + 1) % slides.length)
    }, 6500)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setDirection(1)
    setCurrent((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setDirection(-1)
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const slide = slides[current]

  return (
    <section className="relative w-full h-[86vh] min-h-[580px] max-h-[820px] overflow-hidden bg-black flex items-center justify-center">
      {/* Background Image Carousel */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={current}
          custom={direction}
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 z-0"
        >
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            priority
            className="object-cover object-center"
          />
          {/* Editorial Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/30" />
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/20 to-black/60" />
        </motion.div>
      </AnimatePresence>

      {/* Hero Content with Stagger Animations (Executes on every mount/load) */}
      <div className="relative z-10 container mx-auto px-4 md:px-8 max-w-5xl text-center text-white flex flex-col items-center">
        {/* Rating pill */}
        <motion.div
          key={`rating-${current}`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6"
        >
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-current" />
            ))}
          </div>
          <span className="text-xs tracking-wider uppercase font-medium text-amber-200">
            4.9 Rated • 1,755 Google Reviews
          </span>
        </motion.div>

        {/* Tagline */}
        <motion.span
          key={`tag-${current}`}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-xs md:text-sm font-semibold tracking-[0.3em] uppercase text-amber-200/90 mb-4"
        >
          {slide.tag}
        </motion.span>

        {/* Big Editorial Title */}
        <motion.h1
          key={`title-${current}`}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold tracking-tight text-white mb-6 max-w-3xl leading-[1.1]"
        >
          {slide.title}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          key={`sub-${current}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="text-base md:text-xl text-neutral-200/90 font-light max-w-2xl mb-10 leading-relaxed"
        >
          {slide.subtitle}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          key={`cta-${current}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <Link href="/booking">
            <Button
              variant="luxury"
              size="lg"
              className="rounded-2xl px-8 h-14 text-base font-semibold tracking-wide shadow-2xl gap-3 text-white"
            >
              <Calendar className="h-5 w-5 text-amber-200" />
              <span>{slide.cta}</span>
            </Button>
          </Link>
          <Link href="#services">
            <Button
              variant="outline"
              size="lg"
              className="rounded-2xl px-7 h-14 text-base font-medium border-white/30 text-white bg-black/20 hover:bg-white/10 backdrop-blur-md transition-all"
            >
              <span>View Treatment Menu</span>
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute inset-y-0 left-4 md:left-8 z-20 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={prevSlide}
          className="rounded-full w-12 h-12 bg-black/30 hover:bg-black/60 border border-white/20 text-white backdrop-blur-md"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
      </div>
      <div className="absolute inset-y-0 right-4 md:right-8 z-20 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={nextSlide}
          className="rounded-full w-12 h-12 bg-black/30 hover:bg-black/60 border border-white/20 text-white backdrop-blur-md"
          aria-label="Next slide"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 z-20 flex items-center gap-3">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setDirection(idx > current ? 1 : -1)
              setCurrent(idx)
            }}
            className={`h-2 rounded-full transition-all duration-500 ${
              idx === current
                ? "w-8 bg-amber-400"
                : "w-2 bg-white/40 hover:bg-white/70"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
