package service

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"

	"github.com/v-urit/5th/internal/repository"
)

var (
	ErrTicketNotFound = errors.New("ticket not found")
	ErrForbidden      = errors.New("you do not have permission to access this resource")
)

type TicketMessageDTO struct {
	ID          string    `json:"id"`
	TicketID    string    `json:"ticket_id"`
	SenderID    string    `json:"sender_id"`
	SenderName  string    `json:"sender_name"`
	SenderEmail string    `json:"sender_email"`
	SenderRole  string    `json:"sender_role"`
	Message     string    `json:"message"`
	IsEmailSent bool      `json:"is_email_sent"`
	CreatedAt   time.Time `json:"created_at"`
}

type TicketDTO struct {
	ID        string             `json:"id"`
	UserID    string             `json:"user_id"`
	Subject   string             `json:"subject"`
	Status    string             `json:"status"`
	Priority  string             `json:"priority"`
	CreatedAt time.Time          `json:"created_at"`
	UpdatedAt time.Time          `json:"updated_at"`
	UserName  string             `json:"user_name,omitempty"`
	UserEmail string             `json:"user_email,omitempty"`
	UserPhone string             `json:"user_phone,omitempty"`
	Messages  []TicketMessageDTO `json:"messages,omitempty"`
}

type TicketService struct {
	repo          *repository.Queries
	emailProvider EmailProvider
}

func NewTicketService(repo *repository.Queries, emailProvider EmailProvider) *TicketService {
	return &TicketService{
		repo:          repo,
		emailProvider: emailProvider,
	}
}

func (s *TicketService) CreateTicket(ctx context.Context, targetUserID, subject, priority, initialMessage, senderRole string) (*TicketDTO, error) {
	uid, err := uuid.Parse(targetUserID)
	if err != nil {
		return nil, err
	}

	if priority == "" {
		priority = "normal"
	}

	ticket, err := s.repo.CreateTicket(ctx, repository.CreateTicketParams{
		UserID:   uuidToPg(uid),
		Subject:  subject,
		Status:   "open",
		Priority: priority,
	})
	if err != nil {
		return nil, err
	}

	var messages []TicketMessageDTO
	if initialMessage != "" {
		isEmailSent := false
		if senderRole == "admin" {
			// Find user email to send notification
			user, _ := s.repo.GetUserByID(ctx, ticket.UserID)
			if user.Email.Valid && user.Email.String != "" {
				html := BuildLuxuryEmailTemplate(user.Name, subject, initialMessage)
				_ = s.emailProvider.SendEmail(ctx, user.Email.String, user.Name, subject, html)
				isEmailSent = true
			}
		}

		msg, err := s.repo.CreateTicketMessage(ctx, repository.CreateTicketMessageParams{
			TicketID:    ticket.ID,
			SenderID:    uuidToPg(uid),
			SenderRole:  senderRole,
			Message:     initialMessage,
			IsEmailSent: isEmailSent,
		})
		if err == nil {
			messages = append(messages, TicketMessageDTO{
				ID:          uuidFromPg(msg.ID).String(),
				TicketID:    uuidFromPg(msg.TicketID).String(),
				SenderID:    uuidFromPg(msg.SenderID).String(),
				SenderRole:  msg.SenderRole,
				Message:     msg.Message,
				IsEmailSent: msg.IsEmailSent,
				CreatedAt:   msg.CreatedAt.Time,
			})
		}
	}

	return &TicketDTO{
		ID:        uuidFromPg(ticket.ID).String(),
		UserID:    uuidFromPg(ticket.UserID).String(),
		Subject:   ticket.Subject,
		Status:    ticket.Status,
		Priority:  ticket.Priority,
		CreatedAt: ticket.CreatedAt.Time,
		UpdatedAt: ticket.UpdatedAt.Time,
		Messages:  messages,
	}, nil
}

func (s *TicketService) ListTickets(ctx context.Context, currentUserID, role string) ([]TicketDTO, error) {
	if role == "admin" {
		rows, err := s.repo.ListAllTickets(ctx)
		if err != nil {
			return nil, err
		}
		out := make([]TicketDTO, len(rows))
		for i, r := range rows {
			var email, phone string
			if r.UserEmail.Valid {
				email = r.UserEmail.String
			}
			if r.UserPhone.Valid {
				phone = r.UserPhone.String
			}
			out[i] = TicketDTO{
				ID:        uuidFromPg(r.ID).String(),
				UserID:    uuidFromPg(r.UserID).String(),
				Subject:   r.Subject,
				Status:    r.Status,
				Priority:  r.Priority,
				CreatedAt: r.CreatedAt.Time,
				UpdatedAt: r.UpdatedAt.Time,
				UserName:  r.UserName,
				UserEmail: email,
				UserPhone: phone,
			}
		}
		return out, nil
	}

	// Customer view: only their own tickets
	uid, err := uuid.Parse(currentUserID)
	if err != nil {
		return nil, err
	}
	rows, err := s.repo.ListTicketsByUserID(ctx, uuidToPg(uid))
	if err != nil {
		return nil, err
	}
	out := make([]TicketDTO, len(rows))
	for i, r := range rows {
		var email string
		if r.UserEmail.Valid {
			email = r.UserEmail.String
		}
		out[i] = TicketDTO{
			ID:        uuidFromPg(r.ID).String(),
			UserID:    uuidFromPg(r.UserID).String(),
			Subject:   r.Subject,
			Status:    r.Status,
			Priority:  r.Priority,
			CreatedAt: r.CreatedAt.Time,
			UpdatedAt: r.UpdatedAt.Time,
			UserName:  r.UserName,
			UserEmail: email,
		}
	}
	return out, nil
}

func (s *TicketService) GetTicketWithMessages(ctx context.Context, ticketIDStr, currentUserID, role string) (*TicketDTO, error) {
	tid, err := uuid.Parse(ticketIDStr)
	if err != nil {
		return nil, err
	}

	t, err := s.repo.GetTicketByID(ctx, uuidToPg(tid))
	if err != nil || !t.ID.Valid {
		return nil, ErrTicketNotFound
	}

	// Customer isolation check: Customer can only view their own ticket
	if role != "admin" {
		uid, err := uuid.Parse(currentUserID)
		if err != nil || uuidFromPg(t.UserID) != uid {
			return nil, ErrForbidden
		}
	}

	msgs, err := s.repo.ListTicketMessages(ctx, uuidToPg(tid))
	if err != nil {
		return nil, err
	}

	messages := make([]TicketMessageDTO, len(msgs))
	for i, m := range msgs {
		var email string
		if m.SenderEmail.Valid {
			email = m.SenderEmail.String
		}
		messages[i] = TicketMessageDTO{
			ID:          uuidFromPg(m.ID).String(),
			TicketID:    uuidFromPg(m.TicketID).String(),
			SenderID:    uuidFromPg(m.SenderID).String(),
			SenderName:  m.SenderName,
			SenderEmail: email,
			SenderRole:  m.SenderRole,
			Message:     m.Message,
			IsEmailSent: m.IsEmailSent,
			CreatedAt:   m.CreatedAt.Time,
		}
	}

	var email, phone string
	if t.UserEmail.Valid {
		email = t.UserEmail.String
	}
	if t.UserPhone.Valid {
		phone = t.UserPhone.String
	}

	return &TicketDTO{
		ID:        uuidFromPg(t.ID).String(),
		UserID:    uuidFromPg(t.UserID).String(),
		Subject:   t.Subject,
		Status:    t.Status,
		Priority:  t.Priority,
		CreatedAt: t.CreatedAt.Time,
		UpdatedAt: t.UpdatedAt.Time,
		UserName:  t.UserName,
		UserEmail: email,
		UserPhone: phone,
		Messages:  messages,
	}, nil
}

func (s *TicketService) AddMessage(ctx context.Context, ticketIDStr, senderIDStr, senderRole, messageText string) (*TicketMessageDTO, error) {
	tid, err := uuid.Parse(ticketIDStr)
	if err != nil {
		return nil, err
	}
	sid, err := uuid.Parse(senderIDStr)
	if err != nil {
		return nil, err
	}

	t, err := s.repo.GetTicketByID(ctx, uuidToPg(tid))
	if err != nil || !t.ID.Valid {
		return nil, ErrTicketNotFound
	}

	// Security check: customer cannot post to tickets they do not own
	if senderRole != "admin" && uuidFromPg(t.UserID) != sid {
		return nil, ErrForbidden
	}

	isEmailSent := false
	if senderRole == "admin" {
		// Send email to client
		if t.UserEmail.Valid && t.UserEmail.String != "" {
			html := BuildLuxuryEmailTemplate(t.UserName, "Response to your inquiry: "+t.Subject, messageText)
			_ = s.emailProvider.SendEmail(ctx, t.UserEmail.String, t.UserName, "Update on: "+t.Subject, html)
			isEmailSent = true
		}
		// Update status to answered
		_, _ = s.repo.UpdateTicketStatus(ctx, repository.UpdateTicketStatusParams{
			ID:     t.ID,
			Status: "answered",
		})
	} else {
		// Update status to open if customer replies
		_, _ = s.repo.UpdateTicketStatus(ctx, repository.UpdateTicketStatusParams{
			ID:     t.ID,
			Status: "open",
		})
	}

	msg, err := s.repo.CreateTicketMessage(ctx, repository.CreateTicketMessageParams{
		TicketID:    uuidToPg(tid),
		SenderID:    uuidToPg(sid),
		SenderRole:  senderRole,
		Message:     messageText,
		IsEmailSent: isEmailSent,
	})
	if err != nil {
		return nil, err
	}

	sender, _ := s.repo.GetUserByID(ctx, uuidToPg(sid))
	var senderEmail string
	if sender.Email.Valid {
		senderEmail = sender.Email.String
	}

	return &TicketMessageDTO{
		ID:          uuidFromPg(msg.ID).String(),
		TicketID:    uuidFromPg(msg.TicketID).String(),
		SenderID:    uuidFromPg(msg.SenderID).String(),
		SenderName:  sender.Name,
		SenderEmail: senderEmail,
		SenderRole:  msg.SenderRole,
		Message:     msg.Message,
		IsEmailSent: msg.IsEmailSent,
		CreatedAt:   msg.CreatedAt.Time,
	}, nil
}

func (s *TicketService) UpdateStatus(ctx context.Context, ticketIDStr, status, currentUserID, role string) (*TicketDTO, error) {
	tid, err := uuid.Parse(ticketIDStr)
	if err != nil {
		return nil, err
	}

	t, err := s.repo.GetTicketByID(ctx, uuidToPg(tid))
	if err != nil || !t.ID.Valid {
		return nil, ErrTicketNotFound
	}

	if role != "admin" {
		uid, err := uuid.Parse(currentUserID)
		if err != nil || uuidFromPg(t.UserID) != uid {
			return nil, ErrForbidden
		}
	}

	updated, err := s.repo.UpdateTicketStatus(ctx, repository.UpdateTicketStatusParams{
		ID:     uuidToPg(tid),
		Status: status,
	})
	if err != nil {
		return nil, err
	}

	return &TicketDTO{
		ID:        uuidFromPg(updated.ID).String(),
		UserID:    uuidFromPg(updated.UserID).String(),
		Subject:   updated.Subject,
		Status:    updated.Status,
		Priority:  updated.Priority,
		CreatedAt: updated.CreatedAt.Time,
		UpdatedAt: updated.UpdatedAt.Time,
	}, nil
}
