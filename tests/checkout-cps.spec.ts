import { test, expect } from '@playwright/test';

// Checkout CPS - gaya pemula, tiap test login manual

test('CPS001 - transaksi valid', async ({ page }) => {
  await page.goto('https://simple-pos-pwdk.netlify.app/');
  await page.getByPlaceholder('Enter your email').fill('admin@pos.com');
  await page.getByPlaceholder('Enter your password').fill('admin');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByText('POS System').first()).toBeVisible();

  await page.locator('div.bg-white.rounded-lg.shadow-md.border', { hasText: 'Wireless Headphones' }).locator('button:has-text("Add to Cart")').click();
  await page.getByRole('button', { name: 'Checkout' }).click();
  await expect(page.getByText('Order Summary').first()).toBeVisible();
  await page.getByPlaceholder('Enter customer name').fill('John Doe');
  await page.getByPlaceholder('Enter customer email').fill('johndoe@gmail.com');
  await page.getByRole('button', { name: 'Complete Transaction' }).click();
  await expect(page.getByText('Your cart is empty')).toBeVisible();
});

test('CPS002 - tanpa nama dan email tetap berhasil (bug)', async ({ page }) => {
  await page.goto('https://simple-pos-pwdk.netlify.app/');
  await page.getByPlaceholder('Enter your email').fill('admin@pos.com');
  await page.getByPlaceholder('Enter your password').fill('admin');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByText('POS System').first()).toBeVisible();

  await page.locator('div.bg-white.rounded-lg.shadow-md.border', { hasText: 'Wireless Headphones' }).locator('button:has-text("Add to Cart")').click();
  await page.getByRole('button', { name: 'Checkout' }).click();
  await page.getByPlaceholder('Enter customer name').fill('');
  await page.getByPlaceholder('Enter customer email').fill('');
  let before = await page.evaluate(() => JSON.parse(localStorage.getItem('pos_database')!).transactions.length);
  await page.getByRole('button', { name: 'Complete Transaction' }).click();
  await page.waitForTimeout(500);
  let after = await page.evaluate(() => JSON.parse(localStorage.getItem('pos_database')!).transactions.length);
  // harusnya error tapi sekarang bug jadi malah nambah 1
  expect(after).toBe(before + 1);
});

test('CPS003 - tanpa nama cuma email tetap berhasil (bug)', async ({ page }) => {
  await page.goto('https://simple-pos-pwdk.netlify.app/');
  await page.getByPlaceholder('Enter your email').fill('admin@pos.com');
  await page.getByPlaceholder('Enter your password').fill('admin');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByText('POS System').first()).toBeVisible();

  await page.locator('div.bg-white.rounded-lg.shadow-md.border', { hasText: 'Wireless Headphones' }).locator('button:has-text("Add to Cart")').click();
  await page.getByRole('button', { name: 'Checkout' }).click();
  await page.getByPlaceholder('Enter customer name').fill('');
  await page.getByPlaceholder('Enter customer email').fill('johndoe@gmail.com');
  let before = await page.evaluate(() => JSON.parse(localStorage.getItem('pos_database')!).transactions.length);
  await page.getByRole('button', { name: 'Complete Transaction' }).click();
  await page.waitForTimeout(500);
  let after = await page.evaluate(() => JSON.parse(localStorage.getItem('pos_database')!).transactions.length);
  expect(after).toBe(before + 1);
});

test('CPS004 - tanpa email cuma nama tetap berhasil (bug)', async ({ page }) => {
  await page.goto('https://simple-pos-pwdk.netlify.app/');
  await page.getByPlaceholder('Enter your email').fill('admin@pos.com');
  await page.getByPlaceholder('Enter your password').fill('admin');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByText('POS System').first()).toBeVisible();

  await page.locator('div.bg-white.rounded-lg.shadow-md.border', { hasText: 'Wireless Headphones' }).locator('button:has-text("Add to Cart")').click();
  await page.getByRole('button', { name: 'Checkout' }).click();
  await page.getByPlaceholder('Enter customer name').fill('John Doe');
  await page.getByPlaceholder('Enter customer email').fill('');
  let before = await page.evaluate(() => JSON.parse(localStorage.getItem('pos_database')!).transactions.length);
  await page.getByRole('button', { name: 'Complete Transaction' }).click();
  await page.waitForTimeout(500);
  let after = await page.evaluate(() => JSON.parse(localStorage.getItem('pos_database')!).transactions.length);
  expect(after).toBe(before + 1);
});

test('CPS005 - cart kosong tidak bisa checkout', async ({ page }) => {
  await page.goto('https://simple-pos-pwdk.netlify.app/');
  await page.getByPlaceholder('Enter your email').fill('admin@pos.com');
  await page.getByPlaceholder('Enter your password').fill('admin');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByText('POS System').first()).toBeVisible();

  await expect(page.getByText('Your cart is empty')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Checkout' })).toBeHidden();
});

test('CPS006 - email salah format ada validasi html5', async ({ page }) => {
  await page.goto('https://simple-pos-pwdk.netlify.app/');
  await page.getByPlaceholder('Enter your email').fill('admin@pos.com');
  await page.getByPlaceholder('Enter your password').fill('admin');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByText('POS System').first()).toBeVisible();

  await page.locator('div.bg-white.rounded-lg.shadow-md.border', { hasText: 'Wireless Headphones' }).locator('button:has-text("Add to Cart")').click();
  await page.getByRole('button', { name: 'Checkout' }).click();
  await page.getByPlaceholder('Enter customer name').fill('John Doe');
  await page.getByPlaceholder('Enter customer email').fill('johndoe');
  let before = await page.evaluate(() => JSON.parse(localStorage.getItem('pos_database')!).transactions.length);
  await page.getByRole('button', { name: 'Complete Transaction' }).click();
  let pesan = await page.getByPlaceholder('Enter customer email').evaluate((e: HTMLInputElement) => e.validationMessage);
  expect(pesan.toLowerCase()).toMatch(/email|@/);
  let after = await page.evaluate(() => JSON.parse(localStorage.getItem('pos_database')!).transactions.length);
  expect(after).toBe(before);
});
