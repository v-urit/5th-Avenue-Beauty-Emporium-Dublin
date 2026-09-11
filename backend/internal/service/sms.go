package service

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"strings"
)

type SMSProvider interface {
	SendSMS(ctx context.Context, to, body string) error
}

type TwilioSMSProvider struct {
	AccountSID  string
	AuthToken   string
	PhoneNumber string
}

func NewTwilioSMSProvider(accountSID, authToken, phoneNumber string) *TwilioSMSProvider {
	return &TwilioSMSProvider{
		AccountSID:  accountSID,
		AuthToken:   authToken,
		PhoneNumber: phoneNumber,
	}
}

func (t *TwilioSMSProvider) SendSMS(ctx context.Context, to, body string) error {
	apiURL := fmt.Sprintf("https://api.twilio.com/2010-04-01/Accounts/%s/Messages.json", t.AccountSID)

	data := url.Values{}
	data.Set("To", to)
	data.Set("From", t.PhoneNumber)
	data.Set("Body", body)

	req, err := http.NewRequestWithContext(ctx, "POST", apiURL, strings.NewReader(data.Encode()))
	if err != nil {
		return err
	}
	req.SetBasicAuth(t.AccountSID, t.AuthToken)
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("twilio API returned status %d", resp.StatusCode)
	}
	return nil
}

type MockConsoleSMSProvider struct{}

func NewMockConsoleSMSProvider() *MockConsoleSMSProvider {
	return &MockConsoleSMSProvider{}
}

func (m *MockConsoleSMSProvider) SendSMS(ctx context.Context, to, body string) error {
	log.Printf("[DEV SMS MOCK] => To: %s | Message: %s", to, body)
	return nil
}
