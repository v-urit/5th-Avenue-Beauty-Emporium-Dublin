# Build Stage
FROM golang:1.26-alpine AS builder

WORKDIR /app

# Install git & certificates
RUN apk add --no-cache git ca-certificates tzdata

# Download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Compile binary statically
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-w -s" -o /app/bin/server ./cmd/api

# Final Stage: Minimal & Secure Alpine Image
FROM alpine:3.20

WORKDIR /app

RUN apk add --no-cache ca-certificates tzdata curl && \
    addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /app/bin/server /app/server
COPY --from=builder /app/migrations /app/migrations

USER appuser

EXPOSE 8080

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

CMD ["/app/server"]
