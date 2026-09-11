import { test, expect } from '@playwright/test';

// Cart Management - gaya pemula, tiap test login sendiri

test('CART003 - tambah quantity jadi 2', async ({ page }) => {
  await page.goto('https://simple-pos-pwdk.netlify.app/');
  await page.getByPlaceholder('Enter your email').fill('admin@pos.com');
  await page.getByPlaceholder('Enter your password').fill('admin');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByText('POS System').first()).toBeVisible();

  await page.locator('div.bg-white.rounded-lg.shadow-md.border', { hasText: 'Wireless Headphones' }).locator('button:has-text("Add to Cart")').click();
  // tombol + ada di panel kanan cart
  let plus = page.locator('div.grid > div').last().locator('button').filter({ has: page.locator('svg.lucide-plus') });
  await plus.click();
  // quantity sekarang 2
  await expect(page.locator('div.grid > div').last().locator('span.w-8.text-center')).toHaveText('2');
});

test('CART004 - tambah sampai habis stock', async ({ page }) => {
  await page.goto('https://simple-pos-pwdk.netlify.app/');
  await page.getByPlaceholder('Enter your email').fill('admin@pos.com');
  await page.getByPlaceholder('Enter your password').fill('admin');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByText('POS System').first()).toBeVisible();

  // biar cepat, set stok jadi 3
  await page.evaluate(() => {
    let db = JSON.parse(localStorage.getItem('pos_database')!);
    db.products.find((x: any) => x.name === 'Wireless Headphones').stock_quantity = 3;
    localStorage.setItem('pos_database', JSON.stringify(db));
  });
  await page.reload();
  await page.getByPlaceholder('Enter your email').fill('admin@pos.com');
  await page.getByPlaceholder('Enter your password').fill('admin');
  await page.getByRole('button', { name: 'Sign In' }).click();

  await page.locator('div.bg-white.rounded-lg.shadow-md.border', { hasText: 'Wireless Headphones' }).locator('button:has-text("Add to Cart")').click();
  let plus = page.locator('div.grid > div').last().locator('button').filter({ has: page.locator('svg.lucide-plus') });
  await plus.click(); // jadi 2
  await plus.click(); // jadi 3
  await expect(page.locator('div.grid > div').last().locator('span.w-8.text-center')).toHaveText('3');
  await expect(page.getByText('Available: 0').first()).toBeVisible();
  await expect(plus).toBeDisabled();
});

test('CART005 - kurangin quantity', async ({ page }) => {
  await page.goto('https://simple-pos-pwdk.netlify.app/');
  await page.getByPlaceholder('Enter your email').fill('admin@pos.com');
  await page.getByPlaceholder('Enter your password').fill('admin');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByText('POS System').first()).toBeVisible();

  await page.locator('div.bg-white.rounded-lg.shadow-md.border', { hasText: 'Wireless Headphones' }).locator('button:has-text("Add to Cart")').click();
  let plus = page.locator('div.grid > div').last().locator('button').filter({ has: page.locator('svg.lucide-plus') });
  let minus = page.locator('div.grid > div').last().locator('button').filter({ has: page.locator('svg.lucide-minus') });
  await plus.click(); // jadi 2
  await minus.click(); // balik 1
  await expect(page.locator('div.grid > div').last().locator('span.w-8.text-center')).toHaveText('1');
});

test('CART006 - hapus product dari cart', async ({ page }) => {
  await page.goto('https://simple-pos-pwdk.netlify.app/');
  await page.getByPlaceholder('Enter your email').fill('admin@pos.com');
  await page.getByPlaceholder('Enter your password').fill('admin');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByText('POS System').first()).toBeVisible();

  await page.locator('div.bg-white.rounded-lg.shadow-md.border', { hasText: 'Wireless Headphones' }).locator('button:has-text("Add to Cart")').click();
  await page.locator('div.grid > div').last().locator('button.bg-red-100').click();
  await expect(page.getByText('Your cart is empty')).toBeVisible();
});

test('CART007 - klik checkout muncul modal', async ({ page }) => {
  await page.goto('https://simple-pos-pwdk.netlify.app/');
  await page.getByPlaceholder('Enter your email').fill('admin@pos.com');
  await page.getByPlaceholder('Enter your password').fill('admin');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByText('POS System').first()).toBeVisible();

  await page.locator('div.bg-white.rounded-lg.shadow-md.border', { hasText: 'Wireless Headphones' }).locator('button:has-text("Add to Cart")').click();
  await page.getByRole('button', { name: 'Checkout' }).click();
  await expect(page.getByText('Order Summary').first()).toBeVisible();
  await expect(page.getByPlaceholder('Enter customer name')).toBeVisible();
});

test('CART008 - tambah sampai max tombol plus mati', async ({ page }) => {
  await page.goto('https://simple-pos-pwdk.netlify.app/');
  await page.getByPlaceholder('Enter your email').fill('admin@pos.com');
  await page.getByPlaceholder('Enter your password').fill('admin');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByText('POS System').first()).toBeVisible();

  await page.evaluate(() => {
    let db = JSON.parse(localStorage.getItem('pos_database')!);
    db.products.find((x: any) => x.name === 'Wireless Headphones').stock_quantity = 3;
    localStorage.setItem('pos_database', JSON.stringify(db));
  });
  await page.reload();
  await page.getByPlaceholder('Enter your email').fill('admin@pos.com');
  await page.getByPlaceholder('Enter your password').fill('admin');
  await page.getByRole('button', { name: 'Sign In' }).click();

  await page.locator('div.bg-white.rounded-lg.shadow-md.border', { hasText: 'Wireless Headphones' }).locator('button:has-text("Add to Cart")').click();
  let plus = page.locator('div.grid > div').last().locator('button').filter({ has: page.locator('svg.lucide-plus') });
  await plus.click();
  await plus.click();
  await expect(plus).toBeDisabled();
  await expect(page.locator('div.grid > div').last().locator('span.w-8.text-center')).toHaveText('3');
});

test('CART009 - kurangin sampai 0 auto hilang', async ({ page }) => {
  await page.goto('https://simple-pos-pwdk.netlify.app/');
  await page.getByPlaceholder('Enter your email').fill('admin@pos.com');
  await page.getByPlaceholder('Enter your password').fill('admin');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByText('POS System').first()).toBeVisible();

  await page.locator('div.bg-white.rounded-lg.shadow-md.border', { hasText: 'Wireless Headphones' }).locator('button:has-text("Add to Cart")').click();
  let minus = page.locator('div.grid > div').last().locator('button').filter({ has: page.locator('svg.lucide-minus') });
  await minus.click();
  await expect(page.getByText('Your cart is empty')).toBeVisible();
});
