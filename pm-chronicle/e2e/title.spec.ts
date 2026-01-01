import { test, expect } from '@playwright/test';

/**
 * タイトル画面テスト
 */
test.describe('Title Screen', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should display title', async ({ page }) => {
        await expect(page.getByText('PM Chronicle')).toBeVisible();
    });

    test('should have new game button', async ({ page }) => {
        await expect(page.getByRole('button', { name: /新規ゲーム|New Game/i })).toBeVisible();
    });

    test('should have continue button', async ({ page }) => {
        await expect(page.getByRole('button', { name: /続きから|Continue/i })).toBeVisible();
    });
});
