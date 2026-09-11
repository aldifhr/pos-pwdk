import { test, expect } from '@playwright/test';

// Logout - gaya pemula

test('LGOUT001 - logout balik ke login', async ({ page }) => {
  await page.goto('https://simple-pos-pwdk.netlify.app/');
  await page.getByPlaceholder('Enter your email').fill('admin@pos.com');
  await page.getByPlaceholder('Enter your password').fill('admin');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByText('POS System').first()).toBeVisible();

  // klik Sign Out di sidebar
  await page.getByRole('button', { name: 'Sign Out' }).click();
  await expect(page.getByText('Welcome Back')).toBeVisible();
  await expect(page.getByPlaceholder('Enter your email')).toBeVisible();
  // coba buka lagi tanpa login harus tetap di login
  await page.goto('https://simple-pos-pwdk.netlify.app/');
  await expect(page.getByText('Welcome Back')).toBeVisible();
});

test('LGOUT001 - logout pakai selector lain', async ({ page }) => {
  await page.goto('https://simple-pos-pwdk.netlify.app/');
  await page.getByPlaceholder('Enter your email').fill('admin@pos.com');
  await page.getByPlaceholder('Enter your password').fill('admin');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByText('POS System').first()).toBeVisible();

  await page.getByText('Sign Out').click();
  await expect(page.getByText('Welcome Back')).toBeVisible();
});
