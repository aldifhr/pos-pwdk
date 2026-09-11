import { test, expect } from '@playwright/test';

// Report - gaya pemula, tidak pakai class

async function bikinTransaksi(page: any, produk: string[], nama: string, email: string) {
  for (let p of produk) {
    await page.locator('div.bg-white.rounded-lg.shadow-md.border', { hasText: p }).locator('button:has-text("Add to Cart")').click();
    await page.waitForTimeout(300);
  }
  await page.getByRole('button', { name: 'Checkout' }).click();
  await page.getByPlaceholder('Enter customer name').fill(nama);
  await page.getByPlaceholder('Enter customer email').fill(email);
  await page.getByRole('button', { name: 'Complete Transaction' }).click();
  await expect(page.getByText('Your cart is empty').first()).toBeVisible();
}

test('RPT001 - filter Today', async ({ page }) => {
  await page.goto('https://simple-pos-pwdk.netlify.app/');
  await page.getByPlaceholder('Enter your email').fill('admin@pos.com');
  await page.getByPlaceholder('Enter your password').fill('admin');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByText('POS System').first()).toBeVisible();

  await bikinTransaksi(page, ['Wireless Headphones', 'Smartphone Case'], 'RPT', 'rpt@test.com');
  await page.getByRole('button', { name: 'Reports' }).click();
  await expect(page.getByText('Sales Reports').first()).toBeVisible();
  await page.locator('select').first().selectOption('today');
  await expect(page.locator('select').first()).toHaveValue('today');
  await expect(page.getByText('Total Sales').first()).toBeVisible();
});

test('RPT002 - filter Last 7 Days', async ({ page }) => {
  await page.goto('https://simple-pos-pwdk.netlify.app/');
  await page.getByPlaceholder('Enter your email').fill('admin@pos.com');
  await page.getByPlaceholder('Enter your password').fill('admin');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await bikinTransaksi(page, ['Wireless Headphones'], 'RPT', 'rpt@test.com');
  await page.getByRole('button', { name: 'Reports' }).click();
  await page.locator('select').first().selectOption('week');
  await expect(page.locator('select').first()).toHaveValue('week');
  await expect(page.getByText('Total Sales').first()).toBeVisible();
});

test('RPT003 - filter This Month', async ({ page }) => {
  await page.goto('https://simple-pos-pwdk.netlify.app/');
  await page.getByPlaceholder('Enter your email').fill('admin@pos.com');
  await page.getByPlaceholder('Enter your password').fill('admin');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await bikinTransaksi(page, ['Wireless Headphones'], 'RPT', 'rpt@test.com');
  await page.getByRole('button', { name: 'Reports' }).click();
  await page.locator('select').first().selectOption('month');
  await expect(page.locator('select').first()).toHaveValue('month');
});

test('RPT004 - filter This Year', async ({ page }) => {
  await page.goto('https://simple-pos-pwdk.netlify.app/');
  await page.getByPlaceholder('Enter your email').fill('admin@pos.com');
  await page.getByPlaceholder('Enter your password').fill('admin');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await bikinTransaksi(page, ['Wireless Headphones'], 'RPT', 'rpt@test.com');
  await page.getByRole('button', { name: 'Reports' }).click();
  await page.locator('select').first().selectOption('year');
  await expect(page.locator('select').first()).toHaveValue('year');
});

test('RPT005 - Total Sales bener', async ({ page }) => {
  await page.goto('https://simple-pos-pwdk.netlify.app/');
  await page.getByPlaceholder('Enter your email').fill('admin@pos.com');
  await page.getByPlaceholder('Enter your password').fill('admin');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await bikinTransaksi(page, ['Wireless Headphones', 'Smartphone Case', 'Cotton T-Shirt'], 'A', 'a@test.com');
  await bikinTransaksi(page, ['Coffee Beans'], 'B', 'b@test.com');
  await page.getByRole('button', { name: 'Reports' }).click();
  await page.locator('select').first().selectOption('today');
  // ambil total dari database
  let db = await page.evaluate(() => JSON.parse(localStorage.getItem('pos_database')!));
  let total = 0;
  for (let t of db.transactions) total += t.total_amount;
  let tampil = await page.locator('div.bg-white.rounded-lg.shadow-md.p-6').filter({ hasText: 'Total Sales' }).locator('p.text-2xl').first().textContent();
  let angka = parseFloat(tampil!.replace('$', ''));
  expect(angka).toBeCloseTo(total, 1);
});

test('RPT006 - Transactions bener', async ({ page }) => {
  await page.goto('https://simple-pos-pwdk.netlify.app/');
  await page.getByPlaceholder('Enter your email').fill('admin@pos.com');
  await page.getByPlaceholder('Enter your password').fill('admin');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await bikinTransaksi(page, ['Wireless Headphones'], 'A', 'a@test.com');
  await bikinTransaksi(page, ['Coffee Beans'], 'B', 'b@test.com');
  await page.getByRole('button', { name: 'Reports' }).click();
  let tampil = await page.locator('div.bg-white.rounded-lg.shadow-md.p-6').filter({ hasText: 'Transactions' }).locator('p.text-2xl').first().textContent();
  expect(parseInt(tampil!.trim())).toBe(2);
});

test('RPT007 - Average Order bener', async ({ page }) => {
  await page.goto('https://simple-pos-pwdk.netlify.app/');
  await page.getByPlaceholder('Enter your email').fill('admin@pos.com');
  await page.getByPlaceholder('Enter your password').fill('admin');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await bikinTransaksi(page, ['Wireless Headphones', 'Smartphone Case'], 'A', 'a@test.com');
  await page.getByRole('button', { name: 'Reports' }).click();
  let total = await page.locator('div.bg-white.rounded-lg.shadow-md.p-6').filter({ hasText: 'Total Sales' }).locator('p.text-2xl').first().textContent();
  let avg = await page.locator('div.bg-white.rounded-lg.shadow-md.p-6').filter({ hasText: 'Average Order' }).locator('p.text-2xl').first().textContent();
  let t = parseFloat(total!.replace('$', ''));
  let a = parseFloat(avg!.replace('$', ''));
  // avg harus sekitar total / 1 transaksi
  expect(a).toBeCloseTo(t, 1);
});

test('RPT008 - Daily Sales bener', async ({ page }) => {
  await page.goto('https://simple-pos-pwdk.netlify.app/');
  await page.getByPlaceholder('Enter your email').fill('admin@pos.com');
  await page.getByPlaceholder('Enter your password').fill('admin');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await bikinTransaksi(page, ['Wireless Headphones'], 'A', 'a@test.com');
  await page.getByRole('button', { name: 'Reports' }).click();
  await expect(page.getByText('Daily Sales').first()).toBeVisible();
  let daily = await page.locator('h3:has-text("Daily Sales")').locator('..').locator('span.text-sm.font-medium').first().textContent();
  expect(daily).toContain('$');
});

test('RPT009 - Top Products bener', async ({ page }) => {
  await page.goto('https://simple-pos-pwdk.netlify.app/');
  await page.getByPlaceholder('Enter your email').fill('admin@pos.com');
  await page.getByPlaceholder('Enter your password').fill('admin');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await bikinTransaksi(page, ['Wireless Headphones', 'Smartphone Case'], 'A', 'a@test.com');
  await page.getByRole('button', { name: 'Reports' }).click();
  await expect(page.locator('h3:has-text("Top Products")').last()).toBeVisible();
  let teks = await page.locator('h3:has-text("Top Products")').last().locator('..').innerText();
  expect(teks).toContain('Wireless Headphones');
  expect(teks).toContain('Smartphone Case');
});
