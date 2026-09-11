package service

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"

	"github.com/v-urit/5th/internal/repository"
)

var (
	ErrBookingNotFound = errors.New("booking not found or not owned by user")
)

type BookingDTO struct {
	ID                string    `json:"id"`
	UserID            string    `json:"user_id"`
	ServiceID         string    `json:"service_id"`
	ServiceTitle      string    `json:"service_title"`
	ServicePrice      string    `json:"service_price"`
	ServiceDuration   int32     `json:"service_duration"`
	ServiceImageURL   string    `json:"service_image_url,omitempty"`
	ServiceCategory   string    `json:"service_category,omitempty"`
	BookingTime       time.Time `json:"booking_time"`
	Status            string    `json:"status"`
	Notes             string    `json:"notes,omitempty"`
	CreatedAt         time.Time `json:"created_at"`
	UserName          string    `json:"user_name,omitempty"`
	UserEmail         string    `json:"user_email,omitempty"`
	UserPhone         string    `json:"user_phone,omitempty"`
	UserPhoneVerified bool      `json:"user_phone_verified,omitempty"`
}

type BookingService struct {
	repo *repository.Queries
}

func NewBookingService(repo *repository.Queries) *BookingService {
	return &BookingService{repo: repo}
}

func (s *BookingService) CreateBooking(ctx context.Context, userIDStr, serviceIDStr string, bookingTime time.Time, notes string) (*BookingDTO, error) {
	uid, err := uuid.Parse(userIDStr)
	if err != nil {
		return nil, err
	}
	sid, err := uuid.Parse(serviceIDStr)
	if err != nil {
		return nil, err
	}

	serviceItem, err := s.repo.GetServiceByID(ctx, uuidToPg(sid))
	if err != nil || !serviceItem.ID.Valid {
		return nil, errors.New("selected service not found")
	}

	priceStr := "€" + serviceItem.Price.Int.String()
	if serviceItem.Price.Exp < 0 {
		priceStr = "€55.00"
	}

	// Idempotency: Check if user already booked this exact service recently (within 20 seconds) or at the exact same time
	existingBookings, err := s.repo.ListBookingsByUserID(ctx, uuidToPg(uid))
	if err == nil {
		for _, b := range existingBookings {
			if b.ServiceID == uuidToPg(sid) && b.Status != "cancelled" {
				// Prevent duplicate if same booking time or created within last 20 seconds
				if b.BookingTime.Time.Equal(bookingTime) || time.Since(b.CreatedAt.Time) < 20*time.Second {
					var existingNotes string
					if b.Notes.Valid {
						existingNotes = b.Notes.String
					}
					return &BookingDTO{
						ID:              uuidFromPg(b.ID).String(),
						UserID:          userIDStr,
						ServiceID:       serviceIDStr,
						ServiceTitle:    serviceItem.Title,
						ServicePrice:    priceStr,
						ServiceDuration: serviceItem.DurationMinutes,
						ServiceImageURL: serviceItem.ImageUrl,
						BookingTime:     b.BookingTime.Time,
						Status:          b.Status,
						Notes:           existingNotes,
						CreatedAt:       b.CreatedAt.Time,
					}, nil
				}
			}
		}
	}

	booking, err := s.repo.CreateBooking(ctx, repository.CreateBookingParams{
		UserID:      uuidToPg(uid),
		ServiceID:   uuidToPg(sid),
		BookingTime: pgtype.Timestamptz{Time: bookingTime, Valid: true},
		Status:      "confirmed",
		Notes:       pgtype.Text{String: notes, Valid: notes != ""},
	})
	if err != nil {
		// Handle duplicate concurrent requests: if unique constraint triggered, return existing record
		if strings.Contains(err.Error(), "idx_unique_active_user_booking") || strings.Contains(err.Error(), "duplicate key") || strings.Contains(err.Error(), "23505") {
			existingBookings, listErr := s.repo.ListBookingsByUserID(ctx, uuidToPg(uid))
			if listErr == nil {
				for _, b := range existingBookings {
					if b.BookingTime.Time.Equal(bookingTime) && b.Status != "cancelled" {
						var existingNotes string
						if b.Notes.Valid {
							existingNotes = b.Notes.String
						}
						return &BookingDTO{
							ID:              uuidFromPg(b.ID).String(),
							UserID:          userIDStr,
							ServiceID:       serviceIDStr,
							ServiceTitle:    serviceItem.Title,
							ServicePrice:    priceStr,
							ServiceDuration: serviceItem.DurationMinutes,
							ServiceImageURL: serviceItem.ImageUrl,
							BookingTime:     b.BookingTime.Time,
							Status:          b.Status,
							Notes:           existingNotes,
							CreatedAt:       b.CreatedAt.Time,
						}, nil
					}
				}
			}
			return nil, errors.New("you already have an active reservation for this date and time")
		}
		return nil, err
	}


	return &BookingDTO{
		ID:              uuidFromPg(booking.ID).String(),
		UserID:          userIDStr,
		ServiceID:       serviceIDStr,
		ServiceTitle:    serviceItem.Title,
		ServicePrice:    priceStr,
		ServiceDuration: serviceItem.DurationMinutes,
		BookingTime:     booking.BookingTime.Time,
		Status:          booking.Status,
		Notes:           notes,
		CreatedAt:       booking.CreatedAt.Time,
	}, nil
}

func (s *BookingService) ListUserBookings(ctx context.Context, userIDStr string) ([]BookingDTO, error) {
	uid, err := uuid.Parse(userIDStr)
	if err != nil {
		return nil, err
	}

	records, err := s.repo.ListBookingsByUserID(ctx, uuidToPg(uid))
	if err != nil {
		return nil, err
	}

	out := make([]BookingDTO, len(records))
	for i, r := range records {
		var notes string
		if r.Notes.Valid {
			notes = r.Notes.String
		}
		out[i] = BookingDTO{
			ID:              uuidFromPg(r.ID).String(),
			UserID:          uuidFromPg(r.UserID).String(),
			ServiceID:       uuidFromPg(r.ServiceID).String(),
			ServiceTitle:    r.ServiceTitle,
			ServicePrice:    "€" + r.ServicePrice.Int.String(),
			ServiceDuration: r.ServiceDuration,
			ServiceImageURL: r.ServiceImageUrl,
			BookingTime:     r.BookingTime.Time,
			Status:          r.Status,
			Notes:           notes,
			CreatedAt:       r.CreatedAt.Time,
		}
	}
	return out, nil
}

func (s *BookingService) CancelBooking(ctx context.Context, bookingIDStr, userIDStr string) error {
	bid, err := uuid.Parse(bookingIDStr)
	if err != nil {
		return err
	}
	uid, err := uuid.Parse(userIDStr)
	if err != nil {
		return err
	}

	updated, err := s.repo.UpdateBookingStatus(ctx, repository.UpdateBookingStatusParams{
		ID:     uuidToPg(bid),
		Status: "cancelled",
		UserID: uuidToPg(uid),
	})
	if err != nil || !updated.ID.Valid {
		return ErrBookingNotFound
	}
	return nil
}

func (s *BookingService) ListAllBookings(ctx context.Context) ([]BookingDTO, error) {
	records, err := s.repo.ListAllBookings(ctx)
	if err != nil {
		return nil, err
	}

	out := make([]BookingDTO, len(records))
	for i, r := range records {
		var notes, email, phone string
		if r.Notes.Valid {
			notes = r.Notes.String
		}
		if r.UserEmail.Valid {
			email = r.UserEmail.String
		}
		if r.UserPhone.Valid {
			phone = r.UserPhone.String
		}

		out[i] = BookingDTO{
			ID:                uuidFromPg(r.ID).String(),
			UserID:            uuidFromPg(r.UserID).String(),
			ServiceID:         uuidFromPg(r.ServiceID).String(),
			ServiceTitle:      r.ServiceTitle,
			ServicePrice:      "€" + r.ServicePrice.Int.String(),
			ServiceDuration:   r.ServiceDuration,
			ServiceImageURL:   r.ServiceImageUrl,
			ServiceCategory:   r.ServiceCategory,
			BookingTime:       r.BookingTime.Time,
			Status:            r.Status,
			Notes:             notes,
			CreatedAt:         r.CreatedAt.Time,
			UserName:          r.UserName,
			UserEmail:         email,
			UserPhone:         phone,
			UserPhoneVerified: r.UserPhoneVerified,
		}
	}
	return out, nil
}

func (s *BookingService) AdminUpdateBookingStatus(ctx context.Context, bookingIDStr, newStatus string) (*BookingDTO, error) {
	bid, err := uuid.Parse(bookingIDStr)
	if err != nil {
		return nil, err
	}

	booking, err := s.repo.AdminUpdateBookingStatus(ctx, repository.AdminUpdateBookingStatusParams{
		ID:     uuidToPg(bid),
		Status: newStatus,
	})
	if err != nil || !booking.ID.Valid {
		return nil, errors.New("booking not found")
	}

	serviceItem, _ := s.repo.GetServiceByID(ctx, booking.ServiceID)
	userItem, _ := s.repo.GetUserByID(ctx, booking.UserID)

	var notes, email, phone string
	if booking.Notes.Valid {
		notes = booking.Notes.String
	}
	if userItem.Email.Valid {
		email = userItem.Email.String
	}
	if userItem.Phone.Valid {
		phone = userItem.Phone.String
	}

	return &BookingDTO{
		ID:                uuidFromPg(booking.ID).String(),
		UserID:            uuidFromPg(booking.UserID).String(),
		ServiceID:         uuidFromPg(booking.ServiceID).String(),
		ServiceTitle:      serviceItem.Title,
		ServicePrice:      "€" + serviceItem.Price.Int.String(),
		ServiceDuration:   serviceItem.DurationMinutes,
		ServiceImageURL:   serviceItem.ImageUrl,
		ServiceCategory:   serviceItem.Category,
		BookingTime:       booking.BookingTime.Time,
		Status:            booking.Status,
		Notes:             notes,
		CreatedAt:         booking.CreatedAt.Time,
		UserName:          userItem.Name,
		UserEmail:         email,
		UserPhone:         phone,
		UserPhoneVerified: userItem.PhoneVerified,
	}, nil
}

type DailyRevenuePoint struct {
	Date              string             `json:"date"`
	ShortDate         string             `json:"short_date"`
	DayName           string             `json:"day_name"`
	Revenue           float64            `json:"revenue"`
	BookingsCount     int                `json:"bookings_count"`
	ManicureRevenue   float64            `json:"manicure_revenue"`
	PedicureRevenue   float64            `json:"pedicure_revenue"`
	TreatmentRevenue  float64            `json:"treatment_revenue"`
	TopService        string             `json:"top_service"`
	ServicesBreakdown map[string]float64 `json:"services_breakdown"`
}

type CategoryRevenueSummary struct {
	Category   string  `json:"category"`
	Revenue    float64 `json:"revenue"`
	Bookings   int     `json:"bookings"`
	Percentage float64 `json:"percentage"`
	Color      string  `json:"color"`
}

func (s *BookingService) GetAdminStats(ctx context.Context) (map[string]interface{}, error) {
	bookings, err := s.repo.ListAllBookings(ctx)
	if err != nil {
		return nil, err
	}

	users, err := s.repo.ListAllUsers(ctx)
	if err != nil {
		return nil, err
	}

	now := time.Now()
	// Build 30-day timeline
	dailyMap := make(map[string]*DailyRevenuePoint)
	dailyList := make([]*DailyRevenuePoint, 0, 30)

	for i := 29; i >= 0; i-- {
		t := now.AddDate(0, 0, -i)
		dateKey := t.Format("2006-01-02")
		dp := &DailyRevenuePoint{
			Date:              dateKey,
			ShortDate:         t.Format("02 Jan"),
			DayName:           t.Format("Mon"),
			Revenue:           0,
			BookingsCount:     0,
			ManicureRevenue:   0,
			PedicureRevenue:   0,
			TreatmentRevenue:  0,
			TopService:        "None",
			ServicesBreakdown: make(map[string]float64),
		}
		dailyMap[dateKey] = dp
		dailyList = append(dailyList, dp)
	}

	var totalRevenue float64
	var past30DaysRevenue float64
	var confirmedCount, completedCount, cancelledCount, todayCount int
	todayYear, todayMonth, todayDay := now.Date()

	categoryTotals := map[string]*CategoryRevenueSummary{
		"manicure":  {Category: "Manicure", Color: "#c9a37e"},
		"pedicure":  {Category: "Pedicure", Color: "#9e7552"},
		"treatment": {Category: "Treatment & Spa", Color: "#8c6239"},
	}

	for _, b := range bookings {
		bTime := b.BookingTime.Time
		bYear, bMonth, bDay := bTime.Date()
		if bYear == todayYear && bMonth == todayMonth && bDay == todayDay {
			todayCount++
		}

		var price float64 = 55.0
		val, _ := b.ServicePrice.Float64Value()
		if val.Valid {
			price = val.Float64
		}

		switch b.Status {
		case "confirmed", "completed":
			if b.Status == "confirmed" {
				confirmedCount++
			} else {
				completedCount++
			}
			totalRevenue += price

			dateKey := bTime.Format("2006-01-02")
			if dp, exists := dailyMap[dateKey]; exists {
				dp.Revenue += price
				dp.BookingsCount++
				past30DaysRevenue += price

				catLower := strings.ToLower(b.ServiceCategory)
				if strings.Contains(catLower, "pedicure") {
					dp.PedicureRevenue += price
					categoryTotals["pedicure"].Revenue += price
					categoryTotals["pedicure"].Bookings++
				} else if strings.Contains(catLower, "treatment") || strings.Contains(catLower, "spa") {
					dp.TreatmentRevenue += price
					categoryTotals["treatment"].Revenue += price
					categoryTotals["treatment"].Bookings++
				} else {
					dp.ManicureRevenue += price
					categoryTotals["manicure"].Revenue += price
					categoryTotals["manicure"].Bookings++
				}

				dp.ServicesBreakdown[b.ServiceTitle] += price
			}

		case "cancelled":
			cancelledCount++
		}
	}

	// Resolve TopService for each daily point and find peak day
	var peakDay *DailyRevenuePoint
	for _, dp := range dailyList {
		var maxServiceRev float64
		var bestService string
		for sTitle, sRev := range dp.ServicesBreakdown {
			if sRev > maxServiceRev {
				maxServiceRev = sRev
				bestService = sTitle
			}
		}
		if bestService != "" {
			dp.TopService = bestService
		}
		if peakDay == nil || dp.Revenue > peakDay.Revenue {
			peakDay = dp
		}
	}

	// Calculate percentages
	catList := make([]CategoryRevenueSummary, 0, len(categoryTotals))
	for _, cs := range categoryTotals {
		if past30DaysRevenue > 0 {
			cs.Percentage = (cs.Revenue / past30DaysRevenue) * 100
		}
		catList = append(catList, *cs)
	}

	avgDaily := 0.0
	if len(dailyList) > 0 {
		avgDaily = past30DaysRevenue / float64(len(dailyList))
	}

	return map[string]interface{}{
		"total_revenue":        fmt.Sprintf("€%.2f", totalRevenue),
		"past_30_days_revenue": fmt.Sprintf("€%.2f", past30DaysRevenue),
		"avg_daily_revenue":    fmt.Sprintf("€%.2f", avgDaily),
		"daily_revenue":        dailyList,
		"category_breakdown":   catList,
		"peak_day":             peakDay,
		"total_bookings":       len(bookings),
		"today_bookings":       todayCount,
		"confirmed_bookings":   confirmedCount,
		"completed_bookings":   completedCount,
		"cancelled_bookings":   cancelledCount,
		"total_clients":        len(users),
		"google_rating":        "4.9 ★ (1,755 reviews)",
	}, nil
}

func (s *BookingService) ListAllClients(ctx context.Context) ([]UserDTO, error) {
	users, err := s.repo.ListAllUsers(ctx)
	if err != nil {
		return nil, err
	}

	out := make([]UserDTO, len(users))
	for i, u := range users {
		out[i] = mapUserToDTO(u)
	}
	return out, nil
}

