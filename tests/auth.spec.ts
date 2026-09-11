import { test, expect } from '@playwright/test';

// LOGIN - tes paling simpel, tidak pakai class POM
// semua langsung pakai page.getBy...

test('LGN001 - login valid', async ({ page }) => {
  await page.goto('https://simple-pos-pwdk.netlify.app/');
  await page.getByPlaceholder('Enter your email').fill('admin@pos.com');
  await page.getByPlaceholder('Enter your password').fill('admin');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByText('POS System').first()).toBeVisible();
});

test('LGN002 - klik link sign up', async ({ page }) => {
  await page.goto('https://simple-pos-pwdk.netlify.app/');
  await page.getByText("Don't have an account? Sign up").click();
  await expect(page.getByText('Join Our POS')).toBeVisible();
  await expect(page.getByText('Create your account to get started')).toBeVisible();
});

test('LGN003 - email ada spasi di belakang tetap bisa login', async ({ page }) => {
  await page.goto('https://simple-pos-pwdk.netlify.app/');
  await page.getByPlaceholder('Enter your email').fill('admin@pos.com ');
  await page.getByPlaceholder('Enter your password').fill('admin');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByText('POS System').first()).toBeVisible();
});

test('LGN004 - email huruf besar harusnya bisa tapi sekarang gagal (bug)', async ({ page }) => {
  await page.goto('https://simple-pos-pwdk.netlify.app/');
  await page.getByPlaceholder('Enter your email').fill('ADMIN@POS.COM');
  await page.getByPlaceholder('Enter your password').fill('admin');
  await page.getByRole('button', { name: 'Sign In' }).click();
  // sekarang masih bug jadi muncul Invalid credentials
  await expect(page.locator('div.bg-red-50')).toBeVisible();
  await expect(page.locator('div.bg-red-50')).toContainText('Invalid credentials');
});

test('LGN005 - email dan password kosong', async ({ page }) => {
  await page.goto('https://simple-pos-pwdk.netlify.app/');
  await page.getByPlaceholder('Enter your email').fill('');
  await page.getByPlaceholder('Enter your password').fill('');
  await page.getByRole('button', { name: 'Sign In' }).click();
  // muncul validasi html5
  let pesan = await page.getByPlaceholder('Enter your email').evaluate((e: HTMLInputElement) => e.validationMessage);
  expect(pesan.length).toBeGreaterThan(0);
});

test('LGN006 - email kosong', async ({ page }) => {
  await page.goto('https://simple-pos-pwdk.netlify.app/');
  await page.getByPlaceholder('Enter your email').fill('');
  await page.getByPlaceholder('Enter your password').fill('admin');
  await page.getByRole('button', { name: 'Sign In' }).click();
  let pesan = await page.getByPlaceholder('Enter your email').evaluate((e: HTMLInputElement) => e.validationMessage);
  expect(pesan).toContain('Please fill out this field');
});

test('LGN007 - password kosong', async ({ page }) => {
  await page.goto('https://simple-pos-pwdk.netlify.app/');
  await page.getByPlaceholder('Enter your email').fill('admin@pos.com');
  await page.getByPlaceholder('Enter your password').fill('');
  await page.getByRole('button', { name: 'Sign In' }).click();
  let pesan = await page.getByPlaceholder('Enter your password').evaluate((e: HTMLInputElement) => e.validationMessage);
  expect(pesan).toContain('Please fill out this field');
});

test('LGN008 - password huruf besar salah', async ({ page }) => {
  await page.goto('https://simple-pos-pwdk.netlify.app/');
  await page.getByPlaceholder('Enter your email').fill('admin@pos.com');
  await page.getByPlaceholder('Enter your password').fill('ADMIN');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.locator('div.bg-red-50')).toContainText('Invalid credentials');
});

test('LGN009 - password ada spasi', async ({ page }) => {
  await page.goto('https://simple-pos-pwdk.netlify.app/');
  await page.getByPlaceholder('Enter your email').fill('admin@pos.com');
  await page.getByPlaceholder('Enter your password').fill('admin ');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.locator('div.bg-red-50')).toContainText('Invalid credentials');
});

test('LGN010 - password salah', async ({ page }) => {
  await page.goto('https://simple-pos-pwdk.netlify.app/');
  await page.getByPlaceholder('Enter your email').fill('admin@pos.com');
  await page.getByPlaceholder('Enter your password').fill('testinvalidlogin');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.locator('div.bg-red-50')).toContainText('Invalid credentials');
});

test('LGN011 - email tanpa @ harus validasi html5', async ({ page }) => {
  await page.goto('https://simple-pos-pwdk.netlify.app/');
  await page.getByPlaceholder('Enter your email').fill('user1gmail.com');
  await page.getByPlaceholder('Enter your password').fill('admin');
  await page.getByRole('button', { name: 'Sign In' }).click();
  let pesan = await page.getByPlaceholder('Enter your email').evaluate((e: HTMLInputElement) => e.validationMessage);
  // beda browser beda pesan, cukup cek ada kata email
  expect(pesan.toLowerCase()).toMatch(/email|@/);
});
