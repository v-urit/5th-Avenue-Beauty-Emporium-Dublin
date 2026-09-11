package service_test

import (
	"strings"
	"testing"

	"github.com/v-urit/5th/internal/service"
)

func TestLuxuryEmailTemplateGeneration(t *testing.T) {
	toName := "Elena Rostova"
	subject := "Appointment Rescheduled"
	message := "Your Royal Rose Petal Spa session is confirmed for Friday at 14:00."

	html := service.BuildLuxuryEmailTemplate(toName, subject, message)

	if !strings.Contains(html, "Elena Rostova") {
		t.Errorf("Expected email HTML to contain recipient name")
	}
	if !strings.Contains(html, "5th Avenue") {
		t.Errorf("Expected email HTML to contain salon branding")
	}
	if !strings.Contains(html, "Royal Rose Petal Spa session") {
		t.Errorf("Expected email HTML to contain message content")
	}
	if !strings.Contains(html, "45 Clarendon Street, Dublin 2") {
		t.Errorf("Expected email HTML to contain Dublin address")
	}
}

func TestMockConsoleEmailProvider(t *testing.T) {
	provider := service.NewMockConsoleEmailProvider()
	err := provider.SendEmail(nil, "client@test.ie", "Client", "Test Subject", "<p>Hello</p>")
	if err != nil {
		t.Errorf("Expected MockConsoleEmailProvider to return nil, got %v", err)
	}
}
