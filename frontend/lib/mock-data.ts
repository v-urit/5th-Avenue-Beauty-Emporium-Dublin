import {
  AdminStatsDTO,
  BookingDTO,
  BookingStatus,
  CatalogService,
  CategoryRevenueSummary,
  ClientDetailDTO,
  DailyRevenuePoint,
  TicketDTO,
  TicketMessageDTO,
  TicketPriority,
  TicketStatus,
  UserDTO,
} from "./types"

// Storage keys
const STORAGE_KEY_STATE = "5th_avenue_demo_store_v1"
const STORAGE_KEY_DEMO_MODE = "demo_mode"

// Seed Users
export const MOCK_ADMIN_USER: UserDTO = {
  id: "admin-demo-id",
  name: "Salon Administrator",
  email: "admin@5thavenue.ie",
  phone: "+353870000001",
  phone_verified: true,
  role: "admin",
}

export const MOCK_CLIENT_USER: UserDTO = {
  id: "client-demo-id",
  name: "Elena Rostova",
  email: "elena.client@5thavenue.ie",
  phone: "+353871234567",
  phone_verified: true,
  role: "customer",
}

// 15 Realistic Dublin Clients
export const INITIAL_CLIENTS: ClientDetailDTO[] = [
  {
    id: "client-demo-id",
    name: "Elena Rostova",
    email: "elena.client@5thavenue.ie",
    phone: "+353871234567",
    phone_verified: true,
    role: "customer",
    created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
  },
  {
    id: "client-2",
    name: "Saoirse O'Connor",
    email: "saoirse.oc@dublinluxury.ie",
    phone: "+353872345678",
    phone_verified: true,
    role: "customer",
    created_at: new Date(Date.now() - 120 * 86400000).toISOString(),
  },
  {
    id: "client-3",
    name: "Aoife Murphy",
    email: "aoife.murphy@horizon.ie",
    phone: "+353873456789",
    phone_verified: true,
    role: "customer",
    created_at: new Date(Date.now() - 65 * 86400000).toISOString(),
  },
  {
    id: "client-4",
    name: "Ciara Kelly",
    email: "ciara.kelly@studiocreative.ie",
    phone: "+353874567890",
    phone_verified: true,
    role: "customer",
    created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
  },
  {
    id: "client-5",
    name: "Niamh Walsh",
    email: "niamh.walsh@solicitors.ie",
    phone: "+353875678901",
    phone_verified: true,
    role: "customer",
    created_at: new Date(Date.now() - 110 * 86400000).toISOString(),
  },
  {
    id: "client-6",
    name: "Siobhan Byrne",
    email: "siobhan.byrne@architects.ie",
    phone: "+353876789012",
    phone_verified: true,
    role: "customer",
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: "client-7",
    name: "Roisin Gallagher",
    email: "roisin.g@aerlingus.ie",
    phone: "+353877890123",
    phone_verified: true,
    role: "customer",
    created_at: new Date(Date.now() - 75 * 86400000).toISOString(),
  },
  {
    id: "client-8",
    name: "Emma Fitzpatrick",
    email: "emma.fitz@trinityalumni.ie",
    phone: "+353878901234",
    phone_verified: false,
    role: "customer",
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  {
    id: "client-9",
    name: "Sophie Higgins",
    email: "sophie.h@vogueconsulting.ie",
    phone: "+353879012345",
    phone_verified: true,
    role: "customer",
    created_at: new Date(Date.now() - 85 * 86400000).toISOString(),
  },
  {
    id: "client-10",
    name: "Chloe Kavanagh",
    email: "chloe.k@merrionhotel.ie",
    phone: "+353870123456",
    phone_verified: true,
    role: "customer",
    created_at: new Date(Date.now() - 50 * 86400000).toISOString(),
  },
  {
    id: "client-11",
    name: "Sarah O'Brien",
    email: "sarah.obrien@kpmg.ie",
    phone: "+353871122334",
    phone_verified: true,
    role: "customer",
    created_at: new Date(Date.now() - 40 * 86400000).toISOString(),
  },
  {
    id: "client-12",
    name: "Laura McCarthy",
    email: "laura.mc@designbureau.ie",
    phone: "+353872233445",
    phone_verified: true,
    role: "customer",
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
  },
  {
    id: "client-13",
    name: "Rachel Dunne",
    email: "rachel.dunne@dublinhealth.ie",
    phone: "+353873344556",
    phone_verified: true,
    role: "customer",
    created_at: new Date(Date.now() - 18 * 86400000).toISOString(),
  },
  {
    id: "client-14",
    name: "Hannah Connolly",
    email: "hannah.c@investments.ie",
    phone: "+353874455667",
    phone_verified: false,
    role: "customer",
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: "client-15",
    name: "Grace O'Neill",
    email: "grace.oneill@fashionhouse.ie",
    phone: "+353875566778",
    phone_verified: true,
    role: "customer",
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
]

// 8 Catalog Services
export const INITIAL_SERVICES: CatalogService[] = [
  {
    id: "sig-manicure",
    title: "5th Avenue Signature Gel Manicure",
    category: "Manicure",
    price: "€55",
    duration: 60,
    duration_minutes: 60,
    image_url: "/images/hero_manicure.jpg",
    image: "/images/hero_manicure.jpg",
    description: "Couture shaping, cuticle revival, BIAB fortification, and rich high-gloss gel finish with soothing botanical hand massage.",
  },
  {
    id: "rose-pedicure",
    title: "Royal Rose Petal Spa Pedicure",
    category: "Pedicure",
    price: "€75",
    duration: 75,
    duration_minutes: 75,
    image_url: "/images/hero_pedicure.jpg",
    image: "/images/hero_pedicure.jpg",
    description: "Copper basin soak, fresh garden rose petals, volcanic pumice scrub, callus smoothing, and hot stone leg relaxation.",
  },
  {
    id: "biab-extensions",
    title: "Japanese BIAB & 24k Gold Flakes",
    category: "Manicure",
    price: "€90",
    duration: 90,
    duration_minutes: 90,
    image_url: "/images/gallery_nail_art.jpg",
    image: "/images/gallery_nail_art.jpg",
    description: "Sculpted builder gel overlays with hand-placed 24k gold foil accents, providing superior apex strength and 4+ weeks retention.",
  },
  {
    id: "paraffin-treatment",
    title: "Warm Paraffin Wax Treatment & Polish",
    category: "Treatment",
    price: "€65",
    duration: 60,
    duration_minutes: 60,
    image_url: "/images/gallery_spa_hands.jpg",
    image: "/images/gallery_spa_hands.jpg",
    description: "Intensive deep-hydration thermal wax bath for silk-soft skin renewal, melting muscle tension and restoring elasticity.",
  },
  {
    id: "express-manicure",
    title: "Executive Express Manicure",
    category: "Manicure",
    price: "€40",
    duration: 45,
    duration_minutes: 45,
    image_url: "/images/gallery_french_chic.jpg",
    image: "/images/gallery_french_chic.jpg",
    description: "Rapid nail care, buffer shine, and signature botanical cream for busy professionals on Clarendon Street.",
  },
  {
    id: "herbal-foot-ritual",
    title: "Detoxifying Botanical Foot Ritual",
    category: "Pedicure",
    price: "€80",
    duration: 75,
    duration_minutes: 75,
    image_url: "/images/gallery_pedicure_care.jpg",
    image: "/images/gallery_pedicure_care.jpg",
    description: "Organic eucalyptus and Dead Sea salt exfoliation followed by tension-release acupressure massage.",
  },
  {
    id: "diamond-microderm",
    title: "Diamond Microdermabrasion Hand Facial",
    category: "Treatment",
    price: "€85",
    duration: 60,
    duration_minutes: 60,
    image_url: "/images/gallery_spa_hands.jpg",
    image: "/images/gallery_spa_hands.jpg",
    description: "Anti-aging resurfacing treatment targeting sun spots and dehydration, finished with hyaluronic serum infusion.",
  },
  {
    id: "french-ombré",
    title: "French Couture Ombré Gel Extensions",
    category: "Manicure",
    price: "€95",
    duration: 90,
    duration_minutes: 90,
    image_url: "/images/gallery_french_chic.jpg",
    image: "/images/gallery_french_chic.jpg",
    description: "Airbrushed subtle baby-boomer gradient overlay on Japanese sculpting gel with crystal topcoat.",
  },
]

// Date helpers for dynamic appointments
const relativeDate = (daysOffset: number, hours = 14, minutes = 0) => {
  const d = new Date()
  d.setDate(d.getDate() + daysOffset)
  d.setHours(hours, minutes, 0, 0)
  return d.toISOString()
}

// 25 Realistic Bookings
export const INITIAL_BOOKINGS: BookingDTO[] = [
  // Elena Rostova Bookings
  {
    id: "BK-89211",
    user_id: "client-demo-id",
    user_name: "Elena Rostova",
    user_email: "elena.client@5thavenue.ie",
    user_phone: "+353871234567",
    user_phone_verified: true,
    service_id: "sig-manicure",
    service_title: "5th Avenue Signature Gel Manicure",
    service_price: "€55.00",
    service_duration: 60,
    service_category: "Manicure",
    service_image_url: "/images/hero_manicure.jpg",
    booking_time: relativeDate(1, 14, 0), // Tomorrow at 14:00
    status: "confirmed",
    notes: "Please add bridal pearl dust sample accents. Client prefers square-oval shape.",
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "BK-89212",
    user_id: "client-demo-id",
    user_name: "Elena Rostova",
    user_email: "elena.client@5thavenue.ie",
    user_phone: "+353871234567",
    user_phone_verified: true,
    service_id: "rose-pedicure",
    service_title: "Royal Rose Petal Spa Pedicure",
    service_price: "€75.00",
    service_duration: 75,
    service_category: "Pedicure",
    service_image_url: "/images/hero_pedicure.jpg",
    booking_time: relativeDate(6, 11, 30), // In 6 days
    status: "pending",
    notes: "Would like therapist Sarah if available.",
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: "BK-88405",
    user_id: "client-demo-id",
    user_name: "Elena Rostova",
    user_email: "elena.client@5thavenue.ie",
    user_phone: "+353871234567",
    user_phone_verified: true,
    service_id: "biab-extensions",
    service_title: "Japanese BIAB & 24k Gold Flakes",
    service_price: "€90.00",
    service_duration: 90,
    service_category: "Manicure",
    service_image_url: "/images/gallery_nail_art.jpg",
    booking_time: relativeDate(-14, 15, 0),
    status: "completed",
    notes: "Flawless apex build. Client exceptionally pleased with gold leaf placement.",
    created_at: new Date(Date.now() - 18 * 86400000).toISOString(),
  },
  {
    id: "BK-87890",
    user_id: "client-demo-id",
    user_name: "Elena Rostova",
    user_email: "elena.client@5thavenue.ie",
    user_phone: "+353871234567",
    user_phone_verified: true,
    service_id: "paraffin-treatment",
    service_title: "Warm Paraffin Wax Treatment & Polish",
    service_price: "€65.00",
    service_duration: 60,
    service_category: "Treatment",
    service_image_url: "/images/gallery_spa_hands.jpg",
    booking_time: relativeDate(-35, 12, 0),
    status: "completed",
    created_at: new Date(Date.now() - 40 * 86400000).toISOString(),
  },

  // Today's Bookings
  {
    id: "BK-90101",
    user_id: "client-2",
    user_name: "Saoirse O'Connor",
    user_email: "saoirse.oc@dublinluxury.ie",
    user_phone: "+353872345678",
    user_phone_verified: true,
    service_id: "rose-pedicure",
    service_title: "Royal Rose Petal Spa Pedicure",
    service_price: "€75.00",
    service_duration: 75,
    service_category: "Pedicure",
    service_image_url: "/images/hero_pedicure.jpg",
    booking_time: relativeDate(0, 10, 30), // Today 10:30
    status: "confirmed",
    notes: "Organic jojoba oil only (mild nut allergy note).",
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "BK-90102",
    user_id: "client-3",
    user_name: "Aoife Murphy",
    user_email: "aoife.murphy@horizon.ie",
    user_phone: "+353873456789",
    user_phone_verified: true,
    service_id: "biab-extensions",
    service_title: "Japanese BIAB & 24k Gold Flakes",
    service_price: "€90.00",
    service_duration: 90,
    service_category: "Manicure",
    service_image_url: "/images/gallery_nail_art.jpg",
    booking_time: relativeDate(0, 12, 0), // Today 12:00
    status: "confirmed",
    notes: "Short almond shape, discreet gold leaf flecks.",
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: "BK-90103",
    user_id: "client-4",
    user_name: "Ciara Kelly",
    user_email: "ciara.kelly@studiocreative.ie",
    user_phone: "+353874567890",
    user_phone_verified: true,
    service_id: "french-ombré",
    service_title: "French Couture Ombré Gel Extensions",
    service_price: "€95.00",
    service_duration: 90,
    service_category: "Manicure",
    service_image_url: "/images/gallery_french_chic.jpg",
    booking_time: relativeDate(0, 14, 30), // Today 14:30
    status: "pending",
    notes: "Awaiting client confirmation call.",
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: "BK-90104",
    user_id: "client-5",
    user_name: "Niamh Walsh",
    user_email: "niamh.walsh@solicitors.ie",
    user_phone: "+353875678901",
    user_phone_verified: true,
    service_id: "sig-manicure",
    service_title: "5th Avenue Signature Gel Manicure",
    service_price: "€55.00",
    service_duration: 60,
    service_category: "Manicure",
    service_image_url: "/images/hero_manicure.jpg",
    booking_time: relativeDate(0, 16, 0), // Today 16:00
    status: "confirmed",
    notes: "Deep nude shade selection.",
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "BK-90105",
    user_id: "client-6",
    user_name: "Siobhan Byrne",
    user_email: "siobhan.byrne@architects.ie",
    user_phone: "+353876789012",
    user_phone_verified: true,
    service_id: "paraffin-treatment",
    service_title: "Warm Paraffin Wax Treatment & Polish",
    service_price: "€65.00",
    service_duration: 60,
    service_category: "Treatment",
    service_image_url: "/images/gallery_spa_hands.jpg",
    booking_time: relativeDate(0, 17, 30), // Today 17:30
    status: "confirmed",
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },

  // Tomorrow & Upcoming
  {
    id: "BK-90110",
    user_id: "client-7",
    user_name: "Roisin Gallagher",
    user_email: "roisin.g@aerlingus.ie",
    user_phone: "+353877890123",
    user_phone_verified: true,
    service_id: "herbal-foot-ritual",
    service_title: "Detoxifying Botanical Foot Ritual",
    service_price: "€80.00",
    service_duration: 75,
    service_category: "Pedicure",
    service_image_url: "/images/gallery_pedicure_care.jpg",
    booking_time: relativeDate(1, 11, 0),
    status: "confirmed",
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "BK-90111",
    user_id: "client-9",
    user_name: "Sophie Higgins",
    user_email: "sophie.h@vogueconsulting.ie",
    user_phone: "+353879012345",
    user_phone_verified: true,
    service_id: "diamond-microderm",
    service_title: "Diamond Microdermabrasion Hand Facial",
    service_price: "€85.00",
    service_duration: 60,
    service_category: "Treatment",
    service_image_url: "/images/gallery_spa_hands.jpg",
    booking_time: relativeDate(2, 13, 0),
    status: "confirmed",
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: "BK-90112",
    user_id: "client-10",
    user_name: "Chloe Kavanagh",
    user_email: "chloe.k@merrionhotel.ie",
    user_phone: "+353870123456",
    user_phone_verified: true,
    service_id: "express-manicure",
    service_title: "Executive Express Manicure",
    service_price: "€40.00",
    service_duration: 45,
    service_category: "Manicure",
    service_image_url: "/images/gallery_french_chic.jpg",
    booking_time: relativeDate(2, 15, 30),
    status: "pending",
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: "BK-90113",
    user_id: "client-11",
    user_name: "Sarah O'Brien",
    user_email: "sarah.obrien@kpmg.ie",
    user_phone: "+353871122334",
    user_phone_verified: true,
    service_id: "rose-pedicure",
    service_title: "Royal Rose Petal Spa Pedicure",
    service_price: "€75.00",
    service_duration: 75,
    service_category: "Pedicure",
    service_image_url: "/images/hero_pedicure.jpg",
    booking_time: relativeDate(3, 10, 0),
    status: "confirmed",
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    id: "BK-90114",
    user_id: "client-12",
    user_name: "Laura McCarthy",
    user_email: "laura.mc@designbureau.ie",
    user_phone: "+353872233445",
    user_phone_verified: true,
    service_id: "biab-extensions",
    service_title: "Japanese BIAB & 24k Gold Flakes",
    service_price: "€90.00",
    service_duration: 90,
    service_category: "Manicure",
    service_image_url: "/images/gallery_nail_art.jpg",
    booking_time: relativeDate(4, 16, 30),
    status: "confirmed",
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: "BK-90115",
    user_id: "client-13",
    user_name: "Rachel Dunne",
    user_email: "rachel.dunne@dublinhealth.ie",
    user_phone: "+353873344556",
    user_phone_verified: true,
    service_id: "sig-manicure",
    service_title: "5th Avenue Signature Gel Manicure",
    service_price: "€55.00",
    service_duration: 60,
    service_category: "Manicure",
    service_image_url: "/images/hero_manicure.jpg",
    booking_time: relativeDate(5, 14, 0),
    status: "pending",
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },

  // Completed & Cancelled History
  {
    id: "BK-88901",
    user_id: "client-2",
    user_name: "Saoirse O'Connor",
    user_email: "saoirse.oc@dublinluxury.ie",
    user_phone: "+353872345678",
    user_phone_verified: true,
    service_id: "sig-manicure",
    service_title: "5th Avenue Signature Gel Manicure",
    service_price: "€55.00",
    service_duration: 60,
    service_category: "Manicure",
    service_image_url: "/images/hero_manicure.jpg",
    booking_time: relativeDate(-3, 11, 0),
    status: "completed",
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: "BK-88902",
    user_id: "client-3",
    user_name: "Aoife Murphy",
    user_email: "aoife.murphy@horizon.ie",
    user_phone: "+353873456789",
    user_phone_verified: true,
    service_id: "herbal-foot-ritual",
    service_title: "Detoxifying Botanical Foot Ritual",
    service_price: "€80.00",
    service_duration: 75,
    service_category: "Pedicure",
    service_image_url: "/images/gallery_pedicure_care.jpg",
    booking_time: relativeDate(-5, 14, 30),
    status: "completed",
    created_at: new Date(Date.now() - 9 * 86400000).toISOString(),
  },
  {
    id: "BK-88903",
    user_id: "client-8",
    user_name: "Emma Fitzpatrick",
    user_email: "emma.fitz@trinityalumni.ie",
    user_phone: "+353878901234",
    user_phone_verified: false,
    service_id: "express-manicure",
    service_title: "Executive Express Manicure",
    service_price: "€40.00",
    service_duration: 45,
    service_category: "Manicure",
    service_image_url: "/images/gallery_french_chic.jpg",
    booking_time: relativeDate(-2, 16, 0),
    status: "cancelled",
    notes: "Cancelled by client due to business travel.",
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: "BK-88904",
    user_id: "client-14",
    user_name: "Hannah Connolly",
    user_email: "hannah.c@investments.ie",
    user_phone: "+353874455667",
    user_phone_verified: false,
    service_id: "diamond-microderm",
    service_title: "Diamond Microdermabrasion Hand Facial",
    service_price: "€85.00",
    service_duration: 60,
    service_category: "Treatment",
    service_image_url: "/images/gallery_spa_hands.jpg",
    booking_time: relativeDate(-8, 12, 0),
    status: "completed",
    created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
  },
  {
    id: "BK-88905",
    user_id: "client-15",
    user_name: "Grace O'Neill",
    user_email: "grace.oneill@fashionhouse.ie",
    user_phone: "+353875566778",
    user_phone_verified: true,
    service_id: "french-ombré",
    service_title: "French Couture Ombré Gel Extensions",
    service_price: "€95.00",
    service_duration: 90,
    service_category: "Manicure",
    service_image_url: "/images/gallery_french_chic.jpg",
    booking_time: relativeDate(-10, 15, 0),
    status: "completed",
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
]

// 5 Detailed Support Tickets
export const INITIAL_TICKETS: TicketDTO[] = [
  {
    id: "TCK-401",
    user_id: "client-demo-id",
    user_name: "Elena Rostova",
    user_email: "elena.client@5thavenue.ie",
    user_phone: "+353871234567",
    subject: "BIAB Nail Art consultation for upcoming wedding",
    priority: "high",
    status: "answered",
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    messages: [
      {
        id: "MSG-101",
        ticket_id: "TCK-401",
        sender_id: "client-demo-id",
        sender_name: "Elena Rostova",
        sender_email: "elena.client@5thavenue.ie",
        sender_role: "customer",
        message: "Hello! I am having my wedding at Luttrellstown Castle in three weeks. Can the Japanese BIAB treatment incorporate delicate pearl dust with the 24k gold leaf?",
        is_email_sent: true,
        created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
      {
        id: "MSG-102",
        ticket_id: "TCK-401",
        sender_id: "admin-demo-id",
        sender_name: "Salon Concierge",
        sender_email: "admin@5thavenue.ie",
        sender_role: "admin",
        message: "Dear Elena, congratulations on your upcoming wedding! Yes, our master nail artisan Keiko specializes in bespoke bridal BIAB with pearl dust and 24k gold accents. We have reserved complimentary custom color testing for you during your session tomorrow.",
        is_email_sent: true,
        created_at: new Date(Date.now() - 1.5 * 86400000).toISOString(),
      },
      {
        id: "MSG-103",
        ticket_id: "TCK-401",
        sender_id: "client-demo-id",
        sender_name: "Elena Rostova",
        sender_email: "elena.client@5thavenue.ie",
        sender_role: "customer",
        message: "That sounds wonderful! Thank you so much for the thoughtful arrangement. Looking forward to tomorrow afternoon.",
        is_email_sent: true,
        created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
      },
    ],
  },
  {
    id: "TCK-402",
    user_id: "client-2",
    user_name: "Saoirse O'Connor",
    user_email: "saoirse.oc@dublinluxury.ie",
    user_phone: "+353872345678",
    subject: "Allergy inquiry regarding organic cuticle oils",
    priority: "normal",
    status: "answered",
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    messages: [
      {
        id: "MSG-201",
        ticket_id: "TCK-402",
        sender_id: "client-2",
        sender_name: "Saoirse O'Connor",
        sender_email: "saoirse.oc@dublinluxury.ie",
        sender_role: "customer",
        message: "Good afternoon, could you confirm if your signature cuticle oils contain almond or tree nut extracts? I have a mild nut sensitivity.",
        is_email_sent: true,
        created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
      },
      {
        id: "MSG-202",
        ticket_id: "TCK-402",
        sender_id: "admin-demo-id",
        sender_name: "Salon Concierge",
        sender_email: "admin@5thavenue.ie",
        sender_role: "admin",
        message: "Hello Saoirse, thank you for checking with us. We use pure organic jojoba and cold-pressed grapeseed oil which are 100% nut-free. We will add a permanent note to your client file as well.",
        is_email_sent: true,
        created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      },
    ],
  },
  {
    id: "TCK-403",
    user_id: "client-3",
    user_name: "Aoife Murphy",
    user_email: "aoife.murphy@horizon.ie",
    user_phone: "+353873456789",
    subject: "Private group booking inquiry for bridal party of 5",
    priority: "urgent",
    status: "open",
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    messages: [
      {
        id: "MSG-301",
        ticket_id: "TCK-403",
        sender_id: "client-3",
        sender_name: "Aoife Murphy",
        sender_email: "aoife.murphy@horizon.ie",
        sender_role: "customer",
        message: "Hi there! I am organizing a pampering afternoon for 5 guests on Friday the 28th. Do you accommodate private salon lounge reservations with prosecco service?",
        is_email_sent: true,
        created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
      },
    ],
  },
  {
    id: "TCK-404",
    user_id: "client-4",
    user_name: "Ciara Kelly",
    user_email: "ciara.kelly@studiocreative.ie",
    user_phone: "+353874567890",
    subject: "Rescheduling request for Saturday appointment",
    priority: "normal",
    status: "resolved",
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    messages: [
      {
        id: "MSG-401",
        ticket_id: "TCK-404",
        sender_id: "client-4",
        sender_name: "Ciara Kelly",
        sender_email: "ciara.kelly@studiocreative.ie",
        sender_role: "customer",
        message: "Hi, I have a sudden conflict at 10:00 AM this Saturday. Is it possible to move my Rose Petal Pedicure to 3:30 PM?",
        is_email_sent: true,
        created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
      },
      {
        id: "MSG-402",
        ticket_id: "TCK-404",
        sender_id: "admin-demo-id",
        sender_name: "Salon Concierge",
        sender_email: "admin@5thavenue.ie",
        sender_role: "admin",
        message: "Good morning Ciara, we have rescheduled your appointment to Saturday at 15:30 with Senior Therapist Sarah. A confirmation SMS has been dispatched.",
        is_email_sent: true,
        created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
      },
    ],
  },
  {
    id: "TCK-405",
    user_id: "client-5",
    user_name: "Niamh Walsh",
    user_email: "niamh.walsh@solicitors.ie",
    user_phone: "+353875678901",
    subject: "Post-treatment care recommendation for BIAB overlays",
    priority: "low",
    status: "closed",
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    messages: [
      {
        id: "MSG-501",
        ticket_id: "TCK-405",
        sender_id: "client-5",
        sender_name: "Niamh Walsh",
        sender_email: "niamh.walsh@solicitors.ie",
        sender_role: "customer",
        message: "Hello! My BIAB nails still look flawless after two weeks. How often do you recommend coming in for infills?",
        is_email_sent: true,
        created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
      },
      {
        id: "MSG-502",
        ticket_id: "TCK-405",
        sender_id: "admin-demo-id",
        sender_name: "Salon Concierge",
        sender_email: "admin@5thavenue.ie",
        sender_role: "admin",
        message: "Hello Niamh, we recommend booking infills between 3 to 4 weeks to maintain apex structural balance and nail health.",
        is_email_sent: true,
        created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
      },
    ],
  },
]

// 30 Days Financial & Revenue Timeline Generator
export function generateMockStats(bookings: BookingDTO[] = INITIAL_BOOKINGS): AdminStatsDTO {
  const dailyPoints: DailyRevenuePoint[] = []
  const now = new Date()

  let total30DayRev = 0
  let totalBookingsCount = 0
  let peakDay: DailyRevenuePoint | null = null

  // Base patterns for realistic luxury salon performance
  const weekdayMultipliers = [0.85, 0.7, 0.8, 1.05, 1.25, 1.4, 0.9] // Sun - Sat

  for (let i = 29; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)

    const dayIndex = d.getDay()
    const mult = weekdayMultipliers[dayIndex]
    const baseRev = Math.round((550 + Math.sin(i * 0.4) * 120 + (i % 7) * 45) * mult)
    const bookingsCount = Math.max(3, Math.round(baseRev / 72))

    const maniRev = Math.round(baseRev * 0.5)
    const pediRev = Math.round(baseRev * 0.32)
    const treatRev = baseRev - maniRev - pediRev

    total30DayRev += baseRev
    totalBookingsCount += bookingsCount

    const point: DailyRevenuePoint = {
      date: d.toISOString().split("T")[0],
      short_date: d.toLocaleDateString("en-IE", { day: "2-digit", month: "short" }),
      day_name: d.toLocaleDateString("en-IE", { weekday: "short" }),
      revenue: baseRev,
      bookings_count: bookingsCount,
      manicure_revenue: maniRev,
      pedicure_revenue: pediRev,
      treatment_revenue: treatRev,
      top_service: i % 3 === 0 ? "Japanese BIAB" : i % 2 === 0 ? "Signature Gel Manicure" : "Rose Petal Pedicure",
      services_breakdown: {
        Manicure: maniRev,
        Pedicure: pediRev,
        Treatment: treatRev,
      },
    }

    dailyPoints.push(point)
    if (!peakDay || point.revenue > peakDay.revenue) {
      peakDay = point
    }
  }

  const categoryBreakdown: CategoryRevenueSummary[] = [
    {
      category: "Manicure",
      revenue: Math.round(total30DayRev * 0.5),
      bookings: Math.round(totalBookingsCount * 0.52),
      percentage: 50,
      color: "#d4af37", // luxury gold
    },
    {
      category: "Pedicure",
      revenue: Math.round(total30DayRev * 0.32),
      bookings: Math.round(totalBookingsCount * 0.3),
      percentage: 32,
      color: "#e6c387",
    },
    {
      category: "Treatment",
      revenue: Math.round(total30DayRev * 0.18),
      bookings: Math.round(totalBookingsCount * 0.18),
      percentage: 18,
      color: "#c0a062",
    },
  ]

  const todayStr = now.toISOString().split("T")[0]
  const todayBookingsCount = bookings.filter((b) => b.booking_time.startsWith(todayStr)).length || 5

  return {
    total_revenue: `€${(total30DayRev + 12850).toLocaleString("en-IE", { minimumFractionDigits: 2 })}`,
    past_30_days_revenue: `€${total30DayRev.toLocaleString("en-IE", { minimumFractionDigits: 2 })}`,
    avg_daily_revenue: `€${Math.round(total30DayRev / 30).toLocaleString("en-IE", { minimumFractionDigits: 2 })}`,
    total_bookings: 184,
    today_bookings: todayBookingsCount,
    confirmed_bookings: bookings.filter((b) => b.status === "confirmed").length,
    completed_bookings: bookings.filter((b) => b.status === "completed").length + 110,
    cancelled_bookings: bookings.filter((b) => b.status === "cancelled").length + 3,
    total_clients: INITIAL_CLIENTS.length,
    daily_revenue: dailyPoints,
    category_breakdown: categoryBreakdown,
    peak_day: peakDay,
  }
}

// Persistent Store Structure
export interface MockStoreState {
  services: CatalogService[]
  bookings: BookingDTO[]
  clients: ClientDetailDTO[]
  tickets: TicketDTO[]
}

// Local Storage Manager
export class MockStore {
  private static state: MockStoreState | null = null

  static getState(): MockStoreState {
    if (this.state) return this.state

    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY_STATE)
      if (stored) {
        try {
          this.state = JSON.parse(stored)
          return this.state!
        } catch (e) {
          console.warn("Failed to parse demo state, re-seeding...", e)
        }
      }
    }

    // Default Seed
    this.state = {
      services: [...INITIAL_SERVICES],
      bookings: [...INITIAL_BOOKINGS],
      clients: [...INITIAL_CLIENTS],
      tickets: [...INITIAL_TICKETS],
    }

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY_STATE, JSON.stringify(this.state))
      } catch {}
    }

    return this.state
  }

  static saveState(state: MockStoreState) {
    this.state = state
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY_STATE, JSON.stringify(state))
      } catch (e) {
        console.error("Failed to persist mock state to localStorage", e)
      }
    }
  }

  static reset() {
    this.state = {
      services: [...INITIAL_SERVICES],
      bookings: [...INITIAL_BOOKINGS],
      clients: [...INITIAL_CLIENTS],
      tickets: [...INITIAL_TICKETS],
    }
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY_STATE, JSON.stringify(this.state))
      } catch {}
    }
    return this.state
  }

  // --- Services ---
  static getServices(): CatalogService[] {
    return this.getState().services
  }

  static saveService(service: CatalogService): CatalogService {
    const s = this.getState()
    const index = s.services.findIndex((item) => item.id === service.id)
    if (index >= 0) {
      s.services[index] = { ...s.services[index], ...service }
    } else {
      s.services.unshift({
        ...service,
        id: service.id || `srv-${Date.now()}`,
      })
    }
    this.saveState(s)
    return service
  }

  static deleteService(id: string): boolean {
    const s = this.getState()
    s.services = s.services.filter((item) => item.id !== id)
    this.saveState(s)
    return true
  }

  // --- Bookings ---
  static getBookings(): BookingDTO[] {
    return this.getState().bookings
  }

  static getUserBookings(userId: string): BookingDTO[] {
    return this.getState().bookings.filter((b) => b.user_id === userId)
  }

  static createBooking(data: Partial<BookingDTO>): BookingDTO {
    const s = this.getState()
    const matchedService = s.services.find((srv) => srv.id === data.service_id)

    const newBooking: BookingDTO = {
      id: `BK-${Math.floor(10000 + Math.random() * 90000)}`,
      user_id: data.user_id || "client-demo-id",
      user_name: data.user_name || "Elena Rostova",
      user_email: data.user_email || "elena.client@5thavenue.ie",
      user_phone: data.user_phone || "+353871234567",
      user_phone_verified: true,
      service_id: data.service_id || "sig-manicure",
      service_title: matchedService?.title || data.service_title || "5th Avenue Bespoke Treatment",
      service_price: matchedService?.price || data.service_price || "€60.00",
      service_duration: matchedService?.duration || matchedService?.duration_minutes || data.service_duration || 60,
      service_category: matchedService?.category || "Manicure",
      service_image_url: matchedService?.image_url || "/images/hero_manicure.jpg",
      booking_time: data.booking_time || new Date().toISOString(),
      status: "confirmed",
      notes: data.notes || "",
      created_at: new Date().toISOString(),
    }

    s.bookings.unshift(newBooking)
    this.saveState(s)
    return newBooking
  }

  static updateBookingStatus(id: string, status: BookingStatus): BookingDTO | null {
    const s = this.getState()
    const match = s.bookings.find((b) => b.id === id)
    if (!match) return null
    match.status = status
    this.saveState(s)
    return match
  }

  // --- Clients ---
  static getClients(): ClientDetailDTO[] {
    return this.getState().clients
  }

  static getClientById(id: string): ClientDetailDTO | null {
    return this.getState().clients.find((c) => c.id === id) || null
  }

  static updateClient(id: string, updates: Partial<ClientDetailDTO>): ClientDetailDTO | null {
    const s = this.getState()
    const match = s.clients.find((c) => c.id === id)
    if (!match) return null
    Object.assign(match, updates)
    this.saveState(s)
    return match
  }

  // --- Tickets ---
  static getTickets(): TicketDTO[] {
    return this.getState().tickets
  }

  static getUserTickets(userId: string): TicketDTO[] {
    return this.getState().tickets.filter((t) => t.user_id === userId)
  }

  static getTicketById(id: string): TicketDTO | null {
    return this.getState().tickets.find((t) => t.id === id) || null
  }

  static createTicket(data: { subject: string; priority: TicketPriority; message: string; user?: UserDTO }): TicketDTO {
    const s = this.getState()
    const user = data.user || MOCK_CLIENT_USER
    const ticketId = `TCK-${Math.floor(500 + Math.random() * 500)}`

    const newTicket: TicketDTO = {
      id: ticketId,
      user_id: user.id,
      user_name: user.name,
      user_email: user.email,
      user_phone: user.phone,
      subject: data.subject,
      priority: data.priority,
      status: "open",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      messages: [
        {
          id: `MSG-${Date.now()}`,
          ticket_id: ticketId,
          sender_id: user.id,
          sender_name: user.name,
          sender_email: user.email,
          sender_role: user.role,
          message: data.message,
          is_email_sent: true,
          created_at: new Date().toISOString(),
        },
      ],
    }

    s.tickets.unshift(newTicket)
    this.saveState(s)
    return newTicket
  }

  static addTicketMessage(ticketId: string, message: string, senderRole: "admin" | "customer"): TicketMessageDTO | null {
    const s = this.getState()
    const match = s.tickets.find((t) => t.id === ticketId)
    if (!match) return null

    const sender = senderRole === "admin" ? MOCK_ADMIN_USER : MOCK_CLIENT_USER

    const newMsg: TicketMessageDTO = {
      id: `MSG-${Date.now()}`,
      ticket_id: ticketId,
      sender_id: sender.id,
      sender_name: senderRole === "admin" ? "Salon Concierge" : match.user_name || sender.name,
      sender_email: sender.email,
      sender_role: senderRole,
      message,
      is_email_sent: true,
      created_at: new Date().toISOString(),
    }

    if (!match.messages) match.messages = []
    match.messages.push(newMsg)
    match.updated_at = new Date().toISOString()
    match.status = senderRole === "admin" ? "answered" : "open"

    this.saveState(s)
    return newMsg
  }

  static updateTicketStatus(ticketId: string, status: TicketStatus): TicketDTO | null {
    const s = this.getState()
    const match = s.tickets.find((t) => t.id === ticketId)
    if (!match) return null
    match.status = status
    match.updated_at = new Date().toISOString()
    this.saveState(s)
    return match
  }

  // --- Stats ---
  static getStats(): AdminStatsDTO {
    return generateMockStats(this.getBookings())
  }
}

// Initialize on import if in browser
if (typeof window !== "undefined") {
  MockStore.getState()
}
