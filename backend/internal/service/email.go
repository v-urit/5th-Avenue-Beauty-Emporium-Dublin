package service

import (
	"context"
	"fmt"
	"log"
	"net/smtp"
	"strings"

	"github.com/v-urit/5th/internal/config"
)

type EmailProvider interface {
	SendEmail(ctx context.Context, toEmail, toName, subject, htmlBody string) error
}

type MockConsoleEmailProvider struct{}

func NewMockConsoleEmailProvider() *MockConsoleEmailProvider {
	return &MockConsoleEmailProvider{}
}

func (m *MockConsoleEmailProvider) SendEmail(ctx context.Context, toEmail, toName, subject, htmlBody string) error {
	log.Printf("\n======================================================\n"+
		"[EMAIL NOTIFICATION DISPATCHED]\n"+
		"To: %s <%s>\n"+
		"Subject: %s\n"+
		"Preview: %s\n"+
		"======================================================\n",
		toName, toEmail, subject, stripTags(htmlBody))
	return nil
}

type SMTPEmailProvider struct {
	host string
	port string
	user string
	pass string
	from string
}

func NewSMTPEmailProvider(host, port, user, pass, from string) *SMTPEmailProvider {
	return &SMTPEmailProvider{
		host: host,
		port: port,
		user: user,
		pass: pass,
		from: from,
	}
}

func (s *SMTPEmailProvider) SendEmail(ctx context.Context, toEmail, toName, subject, htmlBody string) error {
	addr := fmt.Sprintf("%s:%s", s.host, s.port)
	auth := smtp.PlainAuth("", s.user, s.pass, s.host)

	mime := "MIME-version: 1.0;\nContent-Type: text/html; charset=\"UTF-8\";\n\n"
	msg := []byte(fmt.Sprintf("From: %s\nTo: %s\nSubject: %s\n%s%s", s.from, toEmail, subject, mime, htmlBody))

	return smtp.SendMail(addr, auth, s.from, []string{toEmail}, msg)
}

func NewEmailProvider(cfg *config.Config) EmailProvider {
	if cfg.SMTPHost != "" && cfg.SMTPUser != "" && cfg.SMTPPass != "" {
		port := cfg.SMTPPort
		if port == "" {
			port = "587"
		}
		log.Printf("Using SMTP Email Provider (%s:%s)", cfg.SMTPHost, port)
		return NewSMTPEmailProvider(cfg.SMTPHost, port, cfg.SMTPUser, cfg.SMTPPass, cfg.SMTPFrom)
	}
	log.Println("Using Mock Console Email Provider (Email notifications output to console)")
	return NewMockConsoleEmailProvider()
}

func BuildLuxuryEmailTemplate(toName, subject, messageContent string) string {
	return fmt.Sprintf(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0d0c0b; color: #f5f0eb; margin: 0; padding: 24px; }
    .container { max-width: 580px; margin: 0 auto; background-color: #171513; border: 1px solid rgba(201, 163, 126, 0.25); border-radius: 20px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #1c1917 0%%, #29231e 100%%); padding: 32px 24px; text-align: center; border-bottom: 1px solid rgba(201, 163, 126, 0.2); }
    .brand { font-size: 22px; font-weight: 700; letter-spacing: 0.2em; color: #c9a37e; text-transform: uppercase; margin: 0; }
    .subtitle { font-size: 10px; letter-spacing: 0.3em; color: #9e7552; text-transform: uppercase; margin-top: 6px; }
    .content { padding: 32px 28px; line-height: 1.7; font-size: 14px; color: #d6cfc7; }
    .message-box { background: rgba(201, 163, 126, 0.07); border-left: 3px solid #c9a37e; padding: 18px 20px; border-radius: 12px; margin: 20px 0; font-size: 14px; color: #f5f0eb; }
    .footer { padding: 24px; text-align: center; font-size: 11px; color: #78716c; border-top: 1px solid rgba(255, 255, 255, 0.05); }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="brand">5th Avenue</h1>
      <div class="subtitle">Beauty Emporium • Dublin 2</div>
    </div>
    <div class="content">
      <p>Dear <strong>%s</strong>,</p>
      <p>You have received an official communication regarding your sanctuary account at 5th Avenue Beauty Emporium:</p>
      <div class="message-box">
        %s
      </div>
      <p>You may review your treatment history and reply directly via your bespoke client portal at <a href="http://localhost:3000/dashboard" style="color: #c9a37e; text-decoration: underline;">5th Avenue Client Sanctuary</a>.</p>
    </div>
    <div class="footer">
      45 Clarendon Street, Dublin 2, Ireland • Open daily until 20:00<br>
      Rated 4.9 ★ from 1,755 Google Reviews
    </div>
  </div>
</body>
</html>`, toName, messageContent)
}

func stripTags(s string) string {
	var b strings.Builder
	inTag := false
	for _, r := range s {
		if r == '<' {
			inTag = true
		} else if r == '>' {
			inTag = false
		} else if !inTag {
			b.WriteRune(r)
		}
	}
	out := strings.TrimSpace(b.String())
	if len(out) > 200 {
		return out[:200] + "..."
	}
	return out
}
