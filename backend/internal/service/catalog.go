package service

import (
	"context"
	"math/big"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"

	"github.com/v-urit/5th/internal/repository"
)

type ServiceCatalogDTO struct {
	ID              string `json:"id"`
	Title           string `json:"title"`
	Description     string `json:"description"`
	Price           string `json:"price"`
	DurationMinutes int32  `json:"duration_minutes"`
	ImageURL        string `json:"image_url"`
	Category        string `json:"category"`
}

type GalleryItemDTO struct {
	ID         string `json:"id"`
	URL        string `json:"url"`
	Caption    string `json:"caption"`
	OrderIndex int32  `json:"order_index"`
}

type CatalogService struct {
	repo *repository.Queries
}

func NewCatalogService(repo *repository.Queries) *CatalogService {
	return &CatalogService{repo: repo}
}

func (c *CatalogService) ListServices(ctx context.Context) ([]ServiceCatalogDTO, error) {
	services, err := c.repo.ListServices(ctx)
	if err != nil {
		return nil, err
	}

	out := make([]ServiceCatalogDTO, len(services))
	for i, s := range services {
		out[i] = ServiceCatalogDTO{
			ID:              uuidFromPg(s.ID).String(),
			Title:           s.Title,
			Description:     s.Description,
			Price:           formatNumericPrice(s.Price),
			DurationMinutes: s.DurationMinutes,
			ImageURL:        s.ImageUrl,
			Category:        s.Category,
		}
	}
	return out, nil
}

func (c *CatalogService) ListGallery(ctx context.Context) ([]GalleryItemDTO, error) {
	items, err := c.repo.ListGalleryImages(ctx)
	if err != nil {
		return nil, err
	}

	out := make([]GalleryItemDTO, len(items))
	for i, item := range items {
		var caption string
		if item.Caption.Valid {
			caption = item.Caption.String
		}
		out[i] = GalleryItemDTO{
			ID:         uuidFromPg(item.ID).String(),
			URL:        item.Url,
			Caption:    caption,
			OrderIndex: item.OrderIndex,
		}
	}
	return out, nil
}

func (c *CatalogService) SeedDefaultsIfEmpty(ctx context.Context) error {
	existingServices, err := c.repo.ListServices(ctx)
	if err == nil && len(existingServices) == 0 {
		defaultServices := []struct {
			title    string
			desc     string
			price    int64
			duration int32
			image    string
			cat      string
		}{
			{
				title:    "5th Avenue Signature Gel Manicure",
				desc:     "Meticulous cuticle care, nourishing organic massage, tailored nail shaping, and chip-free premium gel finish.",
				price:    55,
				duration: 60,
				image:    "/images/hero_manicure.jpg",
				cat:      "manicure",
			},
			{
				title:    "Royal Rose Petal Spa Pedicure",
				desc:     "Foot bath in warm copper basin with fresh pink rose petals, Himalayan salt scrub, calloused skin refinement, and therapeutic foot massage.",
				price:    75,
				duration: 75,
				image:    "/images/hero_pedicure.jpg",
				cat:      "pedicure",
			},
			{
				title:    "Japanese BIAB & 24k Gold Foil Extensions",
				desc:     "Builder in a bottle strengthening overlay with hand-applied 24k gold leaf flakes for ultimate natural strength and high glamour.",
				price:    90,
				duration: 90,
				image:    "/images/gallery_nail_art.jpg",
				cat:      "manicure",
			},
			{
				title:    "Warm Paraffin Wax Treatment & Polish",
				desc:     "Deep hydration warm peach paraffin cocoon, restoring youthfulness to hands followed by a classic French or bespoke lacquer.",
				price:    65,
				duration: 60,
				image:    "/images/gallery_spa_hands.jpg",
				cat:      "treatment",
			},
			{
				title:    "Executive Express Manicure",
				desc:     "Ideal for busy professionals in Dublin city center: swift shaping, cuticle cleanup, buff, and high-shine breathable topcoat.",
				price:    40,
				duration: 45,
				image:    "/images/gallery_french_chic.jpg",
				cat:      "manicure",
			},
			{
				title:    "Detoxifying Botanical Foot Ritual",
				desc:     "Eucalyptus, tea tree, and magnesium foot soak, hot stone lower leg tension relief, and organic essential oil nourishment.",
				price:    80,
				duration: 75,
				image:    "/images/gallery_pedicure_care.jpg",
				cat:      "pedicure",
			},
		}

		for _, s := range defaultServices {
			_, _ = c.repo.CreateService(ctx, repository.CreateServiceParams{
				Title:           s.title,
				Description:     s.desc,
				Price:           pgtype.Numeric{Int: big.NewInt(s.price), Exp: 0, Valid: true},
				DurationMinutes: s.duration,
				ImageUrl:        s.image,
				Category:        s.cat,
			})
		}
	}

	existingGallery, err := c.repo.ListGalleryImages(ctx)
	if err == nil && len(existingGallery) == 0 {
		defaultGallery := []struct {
			url     string
			caption string
			order   int32
		}{
			{"/images/hero_manicure.jpg", "Signature Gel Manicure in Natural Rose", 1},
			{"/images/hero_pedicure.jpg", "Copper Basin Rose Petal Spa Sanctuary", 2},
			{"/images/hero_salon.jpg", "5th Avenue Beauty Emporium Dublin Salon Interior", 3},
			{"/images/gallery_nail_art.jpg", "Japanese BIAB with 24k Gold Flakes", 4},
			{"/images/gallery_pedicure_care.jpg", "Deluxe Botanical Exfoliation & Foot Care", 5},
			{"/images/gallery_french_chic.jpg", "Minimalist Modern French Tips with Champagne", 6},
			{"/images/gallery_spa_hands.jpg", "Therapeutic Scented Oil Hand Massage", 7},
		}

		for _, g := range defaultGallery {
			_, _ = c.repo.CreateGalleryImage(ctx, repository.CreateGalleryImageParams{
				Url:        g.url,
				Caption:    pgtype.Text{String: g.caption, Valid: true},
				OrderIndex: g.order,
			})
		}
	}

	return nil
}

func formatNumericPrice(num pgtype.Numeric) string {
	if !num.Valid {
		return "€55.00"
	}
	return "€" + num.Int.String()
}

func (c *CatalogService) CreateService(ctx context.Context, title, description string, price int64, durationMinutes int32, imageURL, category string) (*ServiceCatalogDTO, error) {
	created, err := c.repo.CreateService(ctx, repository.CreateServiceParams{
		Title:           title,
		Description:     description,
		Price:           pgtype.Numeric{Int: big.NewInt(price), Exp: 0, Valid: true},
		DurationMinutes: durationMinutes,
		ImageUrl:        imageURL,
		Category:        category,
	})
	if err != nil {
		return nil, err
	}

	return &ServiceCatalogDTO{
		ID:              uuidFromPg(created.ID).String(),
		Title:           created.Title,
		Description:     created.Description,
		Price:           formatNumericPrice(created.Price),
		DurationMinutes: created.DurationMinutes,
		ImageURL:        created.ImageUrl,
		Category:        created.Category,
	}, nil
}

func (c *CatalogService) UpdateService(ctx context.Context, idStr string, title, description string, price int64, durationMinutes int32, imageURL, category string) (*ServiceCatalogDTO, error) {
	uid, err := uuid.Parse(idStr)
	if err != nil {
		return nil, err
	}

	updated, err := c.repo.UpdateService(ctx, repository.UpdateServiceParams{
		ID:              uuidToPg(uid),
		Title:           title,
		Description:     description,
		Price:           pgtype.Numeric{Int: big.NewInt(price), Exp: 0, Valid: true},
		DurationMinutes: durationMinutes,
		ImageUrl:        imageURL,
		Category:        category,
	})
	if err != nil {
		return nil, err
	}

	return &ServiceCatalogDTO{
		ID:              uuidFromPg(updated.ID).String(),
		Title:           updated.Title,
		Description:     updated.Description,
		Price:           formatNumericPrice(updated.Price),
		DurationMinutes: updated.DurationMinutes,
		ImageURL:        updated.ImageUrl,
		Category:        updated.Category,
	}, nil
}

func (c *CatalogService) DeleteService(ctx context.Context, idStr string) error {
	uid, err := uuid.Parse(idStr)
	if err != nil {
		return err
	}
	return c.repo.DeleteService(ctx, uuidToPg(uid))
}

