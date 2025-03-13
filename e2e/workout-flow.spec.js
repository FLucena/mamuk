import { test, expect } from '@playwright/test'

test.describe('Workout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/auth/signin')
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    // Esperar a que el login se complete
    await page.waitForURL('/workout')
  })

  test('user can create and view workout', async ({ page }) => {
    // Crear nuevo workout
    await page.goto('/workout/new')
    await page.fill('[name="name"]', 'E2E Test Workout')
    await page.fill('[name="description"]', 'Created by Playwright E2E test')
    await page.click('button[type="submit"]')
    
    // Verificar que fue creado y redirigido
    await page.waitForURL(/\/workout\/\w+/)
    await expect(page.locator('h1')).toContainText('E2E Test Workout')
    
    // Añadir un día
    await page.click('button:has-text("Añadir día")')
    await expect(page.locator('text=Día 1')).toBeVisible()
    
    // Añadir un bloque
    await page.click('button:has-text("Añadir bloque")')
    await expect(page.locator('text=Bloque 1')).toBeVisible()
    
    // Añadir un ejercicio
    await page.click('button:has-text("Añadir ejercicio")')
    await page.fill('input[placeholder="Nombre del ejercicio"]', 'Push-ups')
    await page.fill('input[placeholder="Series"]', '3')
    await page.fill('input[placeholder="Repeticiones"]', '10')
    await page.click('button:has-text("Guardar")')
    
    // Verificar que el ejercicio fue añadido
    await expect(page.locator('text=Push-ups')).toBeVisible()
    await expect(page.locator('text=3 x 10')).toBeVisible()
  })
}) 