import * as React from "react"
import Link from "next/link"
import { Phone, Mail, MapPin, Heart } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-muted/60 border-t border-border/80 text-muted-foreground pt-16 pb-12">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
          {/* Brand Col */}
          <div className="space-y-4">
            <Link href="/" className="flex flex-col">
              <span className="text-xl font-serif tracking-[0.25em] font-bold text-foreground">
                5TH AVENUE
              </span>
              <span className="text-[10px] tracking-[0.35em] uppercase font-medium text-primary">
                BEAUTY EMPORIUM • DUBLIN
              </span>
            </Link>
            <p className="text-sm font-light leading-relaxed max-w-xs">
              Dublin&apos;s award-winning destination for luxury manicures, soothing spa pedicures, and bespoke Japanese BIAB nail care.
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-background border border-border/70 flex items-center justify-center hover:text-primary hover:border-primary transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-background border border-border/70 flex items-center justify-center hover:text-primary hover:border-primary transition-colors"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.57 5H18V0h-3.808C10.592 0 9 1.583 9 4.615V8z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-xs uppercase tracking-widest text-foreground mb-4">
              Treatments
            </h4>
            <ul className="space-y-2.5 text-sm font-light">
              <li>
                <Link href="/booking?service=sig-manicure" className="hover:text-foreground transition-colors">
                  Signature Gel Manicure
                </Link>
              </li>
              <li>
                <Link href="/booking?service=rose-pedicure" className="hover:text-foreground transition-colors">
                  Royal Rose Petal Pedicure
                </Link>
              </li>
              <li>
                <Link href="/booking?service=biab-extensions" className="hover:text-foreground transition-colors">
                  Japanese BIAB & Gold Flakes
                </Link>
              </li>
              <li>
                <Link href="/booking?service=paraffin-treatment" className="hover:text-foreground transition-colors">
                  Warm Paraffin Hand Wrap
                </Link>
              </li>
              <li>
                <Link href="/booking?service=herbal-foot-ritual" className="hover:text-foreground transition-colors">
                  Detox Foot Reflexology
                </Link>
              </li>
            </ul>
          </div>

          {/* Salon Details */}
          <div>
            <h4 className="font-semibold text-xs uppercase tracking-widest text-foreground mb-4">
              Visit Us
            </h4>
            <ul className="space-y-3 text-sm font-light">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>45 Clarendon Street, Dublin 2, Ireland</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <span>+353 (01) 671 2345</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                <span>concierge@5thavenue.ie</span>
              </li>
            </ul>
          </div>

          {/* Opening Schedule */}
          <div>
            <h4 className="font-semibold text-xs uppercase tracking-widest text-foreground mb-4">
              Opening Hours
            </h4>
            <div className="space-y-2 text-sm font-light">
              <div className="flex justify-between">
                <span>Monday – Friday:</span>
                <span className="text-foreground font-medium">09:30 – 20:00</span>
              </div>
              <div className="flex justify-between">
                <span>Saturday:</span>
                <span className="text-foreground font-medium">09:00 – 19:30</span>
              </div>
              <div className="flex justify-between">
                <span>Sunday:</span>
                <span className="text-foreground font-medium">10:00 – 18:30</span>
              </div>
              <div className="pt-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                • 24/7 Online Booking System
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="pt-8 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between text-xs font-light gap-4">
          <p>© {new Date().getFullYear()} 5th Avenue Beauty Emporium. All rights reserved.</p>
          <p className="flex items-center gap-1 text-muted-foreground">
            Designed with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for Dublin&apos;s Finest.
          </p>
        </div>
      </div>
    </footer>
  )
}
