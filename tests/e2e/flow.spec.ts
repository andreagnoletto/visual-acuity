import { test, expect } from '@playwright/test';

test.describe('Visual Acuity Test Flow', () => {
  test('complete flow: calibration → test → finish', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('h1')).toContainText('TV Visual Check');

    const setupButton = page.locator('button:has-text("Configuração")').first();
    await setupButton.click();

    await expect(page).toHaveURL(/.*\/setup\/distance/);

    const distanceOption = page.locator('button:has-text("3 metros")').first();
    await distanceOption.click();

    const confirmButton = page.locator('button:has-text("Confirmar")').first();
    await confirmButton.click();

    await expect(page).toHaveURL(/.*\/setup\/screen/);

    const increaseButton = page.locator('button:has-text("Aumentar")').first();
    await increaseButton.click();

    const screenConfirmButton = page.locator('button:has-text("Confirmar Calibração")').first();
    await screenConfirmButton.click();

    await expect(page).toHaveURL('/');

    const testButton = page.locator('button:has-text("Teste Snellen")').first();
    await testButton.click();

    await expect(page).toHaveURL(/.*\/test\/snellen/);

    await expect(page.locator('h2')).toContainText('Teste Snellen');

    const assistedToggle = page.locator('button:has-text("Modo Assistido")').first();
    await assistedToggle.click();

    await expect(page.locator('.assisted-hint')).toBeVisible();

    const confirmSeenButton = page.locator('button:has-text("Vi essa linha")').first();
    await confirmSeenButton.click();

    const finishButton = page.locator('button:has-text("Finalizar")').first();
    if (await finishButton.isVisible()) {
      await finishButton.click();
    }

    await expect(page).toHaveURL('/');
  });

  test('test pages blocked without calibration', async ({ page }) => {
    await page.goto('/test/snellen');

    await expect(page.locator('.calibration-gate')).toBeVisible();
    await expect(page.locator('h2')).toContainText('Calibração Necessária');

    const setupButton = page.locator('button:has-text("Ir para Configuração")').first();
    await setupButton.click();

    await expect(page).toHaveURL(/.*\/setup\/distance/);
  });
});

