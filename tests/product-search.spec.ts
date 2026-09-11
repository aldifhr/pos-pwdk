import { test, expect } from '@playwright/test';

// Product Search and Selection - gaya pemula, tidak pakai POM
// semua langkah tulis langsung biar gampang dibaca

test('PSS001 - search Wireless Headphones', async ({ page }) => {
  await page.goto('https://simple-pos-pwdk.netlify.app/');
  await page.getByPlaceholder('Enter your email').fill('admin@pos.com');
  await page.getByPlaceholder('Enter your password').fill('admin');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByText('POS System').first()).toBeVisible();

  // klik sidebar Point of Sale
  await page.getByRole('button', { name: 'Point of Sale' }).click();
  // search
  await page.getByPlaceholder('Search products...').fill('Wireless Headphones');
  // harus cuma 1 produk
  await expect(page.locator('div.bg-white.rounded-lg.shadow-md.border')).toHaveCount(1);
  await expect(page.getByText('Wireless Headphones').first()).toBeVisible();
});

test('PSS002 - filter by category', async ({ page }) => {
  await page.goto('https://simple-pos-pwdk.netlify.app/');
  await page.getByPlaceholder('Enter your email').fill('admin@pos.com');
  await page.getByPlaceholder('Enter your password').fill('admin');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByText('POS System').first()).toBeVisible();

  // pilih Electronics
  await page.locator('select').first().selectOption({ label: 'Electronics' });
  await expect(page.locator('div.bg-white.rounded-lg.shadow-md.border')).toHaveCount(2);
  await expect(page.locator('div.bg-white.rounded-lg.shadow-md.border', { hasText: 'Wireless Headphones' })).toBeVisible();
  await expect(page.locator('div.bg-white.rounded-lg.shadow-md.border', { hasText: 'Smartphone Case' })).toBeVisible();

  // pilih Clothing
  await page.locator('select').first().selectOption({ label: 'Clothing' });
  await expect(page.locator('div.bg-white.rounded-lg.shadow-md.border')).toHaveCount(1);
  await expect(page.getByText('Cotton T-Shirt').first()).toBeVisible();
});

test('PSS003 - add 1 product Cotton T-Shirt', async ({ page }) => {
  await page.goto('https://simple-pos-pwdk.netlify.app/');
  await page.getByPlaceholder('Enter your email').fill('admin@pos.com');
  await page.getByPlaceholder('Enter your password').fill('admin');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByText('POS System').first()).toBeVisible();

  let card = page.locator('div.bg-white.rounded-lg.shadow-md.border', { hasText: 'Cotton T-Shirt' });
  await card.locator('button:has-text("Add to Cart")').click();
  await expect(page.getByText(/Cart \(1 items\)/)).toBeVisible();
  await expect(page.getByText('1 in cart').first()).toBeVisible();
});

test('PSS004 - add lebih dari 2 produk', async ({ page }) => {
  await page.goto('https://simple-pos-pwdk.netlify.app/');
  await page.getByPlaceholder('Enter your email').fill('admin@pos.com');
  await page.getByPlaceholder('Enter your password').fill('admin');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByText('POS System').first()).toBeVisible();

  await page.locator('div.bg-white.rounded-lg.shadow-md.border', { hasText: 'Wireless Headphones' }).locator('button:has-text("Add to Cart")').click();
  await expect(page.getByText(/Cart \(1 items\)/)).toBeVisible();
  await page.locator('div.bg-white.rounded-lg.shadow-md.border', { hasText: 'Coffee Beans' }).locator('button:has-text("Add to Cart")').click();
  await expect(page.getByText(/Cart \(2 items\)/)).toBeVisible();
  await page.locator('div.bg-white.rounded-lg.shadow-md.border', { hasText: 'Cotton T-Shirt' }).locator('button:has-text("Add to Cart")').click();
  await expect(page.getByText(/Cart \(3 items\)/)).toBeVisible();
});

test('PSS005 - search nama tidak ada', async ({ page }) => {
  await page.goto('https://simple-pos-pwdk.netlify.app/');
  await page.getByPlaceholder('Enter your email').fill('admin@pos.com');
  await page.getByPlaceholder('Enter your password').fill('admin');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByText('POS System').first()).toBeVisible();

  await page.getByPlaceholder('Search products...').fill('Invalid Name');
  await expect(page.getByText('No products found')).toBeVisible();
  await expect(page.locator('div.bg-white.rounded-lg.shadow-md.border')).toHaveCount(0);
});

test('PSS006 - out of stock tombol jadi disabled', async ({ page }) => {
  await page.goto('https://simple-pos-pwdk.netlify.app/');
  await page.getByPlaceholder('Enter your email').fill('admin@pos.com');
  await page.getByPlaceholder('Enter your password').fill('admin');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByText('POS System').first()).toBeVisible();

  // bikin stok jadi 0 dulu
  await page.evaluate(() => {
    let db = JSON.parse(localStorage.getItem('pos_database')!);
    let p = db.products.find((x: any) => x.name === 'Wireless Headphones');
    p.stock_quantity = 0;
    localStorage.setItem('pos_database', JSON.stringify(db));
  });
  await page.reload();
  await page.getByPlaceholder('Enter your email').fill('admin@pos.com');
  await page.getByPlaceholder('Enter your password').fill('admin');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByText('POS System').first()).toBeVisible();

  await page.getByPlaceholder('Search products...').fill('Wireless Headphones');
  let card = page.locator('div.bg-white.rounded-lg.shadow-md.border', { hasText: 'Wireless Headphones' });
  await expect(card).toContainText('Stock: 0');
  let tombol = card.locator('button').first();
  await expect(tombol).toContainText('Out of Stock');
  await expect(tombol).toBeDisabled();
});
