import { test, expect } from '@playwright/test'

test.describe('Réservation de chambre', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('Affichage de la liste des chambres', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Bienvenue')
    await expect(page.locator('[data-testid="room-card"]')).toHaveCount(5)
  })

  test('Filtrage des chambres par type', async ({ page }) => {
    await page.click('[data-testid="filter-standard"]')
    await expect(page.locator('[data-testid="room-card"]')).toHaveCount(1)
  })

  test('Vérification de disponibilité', async ({ page }) => {
    await page.click('[data-testid="room-card"]:first-child')
    await page.click('[data-testid="check-availability"]')
    await expect(page.locator('[data-testid="availability-result"]')).toBeVisible()
  })

  test('Processus de réservation complet', async ({ page }) => {
    await page.click('[data-testid="room-card"]:first-child')
    await page.fill('[data-testid="check-in"]', '2024-07-01')
    await page.fill('[data-testid="check-out"]', '2024-07-05')
    await page.click('[data-testid="book-now"]')
    
    await expect(page).toHaveURL(/\/booking/)
    await page.fill('[data-testid="guest-name"]', 'Jean Dupont')
    await page.fill('[data-testid="guest-email"]', 'jean@example.com')
    await page.fill('[data-testid="guest-phone"]', '+33123456789')
    await page.click('[data-testid="confirm-booking"]')
    
    await expect(page.locator('[data-testid="booking-success"]')).toBeVisible()
  })

  test('Validation du formulaire de réservation', async ({ page }) => {
    await page.goto('/booking')
    await page.click('[data-testid="confirm-booking"]')
    
    await expect(page.locator('[data-testid="error-name"]')).toBeVisible()
    await expect(page.locator('[data-testid="error-email"]')).toBeVisible()
  })
})

test.describe('Paiement Stripe', () => {
  test('Affichage du formulaire de paiement', async ({ page }) => {
    await page.goto('/payment')
    await expect(page.locator('[data-testid="stripe-form"]')).toBeVisible()
    await expect(page.locator('[data-testid="card-element"]')).toBeVisible()
  })

  test('Traitement du paiement réussi', async ({ page }) => {
    await page.goto('/payment')
    await page.fill('[data-testid="card-number"]', '4242424242424242')
    await page.fill('[data-testid="card-expiry"]', '12/25')
    await page.fill('[data-testid="card-cvc"]', '123')
    await page.click('[data-testid="pay-button"]')
    
    await expect(page).toHaveURL(/\/payment\/success/)
  })
})

test.describe('Authentification', () => {
  test('Connexion utilisateur', async ({ page }) => {
    await page.goto('/auth/login')
    await page.fill('[data-testid="email"]', 'test@example.com')
    await page.fill('[data-testid="password"]', 'password123')
    await page.click('[data-testid="login-button"]')
    
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('Inscription nouvel utilisateur', async ({ page }) => {
    await page.goto('/auth/register')
    await page.fill('[data-testid="name"]', 'Nouveau Utilisateur')
    await page.fill('[data-testid="email"]', 'new@example.com')
    await page.fill('[data-testid="password"]', 'password123')
    await page.click('[data-testid="register-button"]')
    
    await expect(page.locator('[data-testid="register-success"]')).toBeVisible()
  })
})

test.describe('Reviews et avis', () => {
  test('Affichage des avis', async ({ page }) => {
    await page.goto('/reviews')
    await expect(page.locator('[data-testid="review-card"]')).toHaveCount.greaterThan(0)
  })

  test('Soumission d\'un avis', async ({ page }) => {
    await page.goto('/reviews')
    await page.click('[data-testid="write-review"]')
    await page.fill('[data-testid="review-title"]', 'Excellent séjour')
    await page.fill('[data-testid="review-comment"]', 'Très bon hôtel')
    await page.click('[data-testid="rating-5"]')
    await page.click('[data-testid="submit-review"]')
    
    await expect(page.locator('[data-testid="review-success"]')).toBeVisible()
  })
})

test.describe('Dashboard admin', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login')
    await page.fill('[data-testid="email"]', 'admin@example.com')
    await page.fill('[data-testid="password"]', 'admin123')
    await page.click('[data-testid="login-button"]')
  })

  test('Affichage des statistiques', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.locator('[data-testid="total-bookings"]')).toBeVisible()
    await expect(page.locator('[data-testid="revenue"]')).toBeVisible()
    await expect(page.locator('[data-testid="occupancy-rate"]')).toBeVisible()
  })

  test('Gestion des réservations', async ({ page }) => {
    await page.goto('/dashboard/bookings')
    await expect(page.locator('[data-testid="booking-table"]')).toBeVisible()
  })
})
