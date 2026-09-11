import { expect, test } from '@playwright/test';
import { AuthPage } from '../pages/auth.pages';
import { InventoryPage } from '../pages/inventory.pages';
import { ProductPage } from '../pages/product.pages';

test.describe('Product - Positive', () => {
    let authPage: AuthPage;
    let inventoryPage: InventoryPage;
    let productPage: ProductPage;

    test.beforeEach(async ({ page }) => {
        authPage = new AuthPage(page);
        inventoryPage = new InventoryPage(page);
        productPage = new ProductPage(page);
        await page.goto('https://simple-pos-pwdk.netlify.app/');
        await authPage.login('admin@pos.com', 'admin');
        await expect(page.getByText('POS System').first()).toBeVisible();
        await expect(inventoryPage.itemNames.first()).toBeVisible();
    });

    // PROD001 - Positive - Click product redirect to detail
    // saucedemo: expect /inventory-item.html?id=  | simple-pos: no detail page, click keeps POS
    test('PROD001 - should stay on POS when clicking a product (no separate detail page)', async ({ page }) => {
        await inventoryPage.clickFirstItemByTitle();
        // URL stays "/" SPA
        await expect(page).toHaveURL('https://simple-pos-pwdk.netlify.app/');
        await expect(productPage.detailName).toBeVisible();
        await expect(productPage.detailPrice).toBeVisible();
    });

    // PROD002 - Positive - Inventory shows all product info
    test('PROD002 - should display all product information on inventory', async () => {
        const count = await inventoryPage.itemCards.count();
        expect(count).toBeGreaterThan(0);
        expect(count).toBe(5);
        for (let i = 0; i < count; i++) {
            const card = inventoryPage.itemCards.nth(i);
            await expect(card.locator('h3.font-semibold.truncate')).toBeVisible();
            await expect(card.locator('p.line-clamp-2')).toBeVisible();
            await expect(card.locator('span.text-green-600')).toBeVisible();
            await expect(card.locator('div.aspect-square')).toBeVisible();
            await expect(card.locator('button:has-text("Add to Cart")')).toBeVisible();
        }
    });

    // PROD003 - Positive - Click title to detail
    test('PROD003 - should keep title visible when clicking title', async ({ page }) => {
        const firstName = await inventoryPage.itemNames.first().textContent();
        await inventoryPage.itemNames.first().click();
        // simple-pos: no redirect, still POS
        await expect(page).toHaveURL('https://simple-pos-pwdk.netlify.app/');
        await expect(productPage.detailName).toContainText(firstName!.trim());
    });

    // PROD004 - Positive - Click image to detail
    test('PROD004 - should keep detail visible when clicking image', async ({ page }) => {
        await inventoryPage.clickFirstItemByImage();
        await expect(page).toHaveURL('https://simple-pos-pwdk.netlify.app/');
        await expect(productPage.detailName).toBeVisible();
        await expect(productPage.detailImage).toBeVisible();
    });

    // PROD005 - Positive - Add to cart from inventory
    test('PROD005 - should add product to cart from inventory', async ({ page }) => {
        await inventoryPage.addFirstItemToCart();
        // "1 in cart" label appears under card
        await expect(page.getByText('1 in cart').first()).toBeVisible();
        // Cart header shows Cart (1 items)
        await expect(page.getByText(/Cart \(1 items\)/)).toBeVisible();
        await expect(page.getByText('Wireless Headphones').first()).toBeVisible();
        // verify cart totals appear
        await expect(page.getByText('Subtotal:').first()).toBeVisible();
    });

    // PROD006 - Positive - Detail data matches inventory
    // saucedemo: compare inventory vs detail page | simple-pos: compare POS grid vs Products table
    test('PROD006 - should show matching data between POS and Products table', async ({ page }) => {
        const inventoryData = await inventoryPage.getFirstItemData();
        // open Products table (analog detail)
        await inventoryPage.openProducts();
        await expect(page.getByText('Manage your product catalog')).toBeVisible();
        const tableName = await page.locator('tbody td:first-child div.text-sm.font-medium').first().textContent();
        const tablePrice = await page.locator('tbody td:nth-child(3) div.text-sm.font-bold').first().textContent();
        expect(tableName?.trim()).toBe(inventoryData.name?.trim());
        expect(tablePrice?.trim()).toBe(inventoryData.price?.trim());
    });

    // PROD007 - Positive - Add to cart from detail
    test('PROD007 - should add product to cart from detail (POS)', async ({ page }) => {
        await inventoryPage.clickFirstItemByTitle();
        await productPage.addToCartButton.click();
        await expect(page.getByText('1 in cart').first()).toBeVisible();
        await expect(page.getByText(/Cart \(1 items\)/)).toBeVisible();
        // remove button (trash) should appear in cart
        await expect(page.locator('button.bg-red-100').first()).toBeVisible();
    });

    // PROD008 - Positive - Back to products
    test('PROD008 - should navigate between POS and Products', async ({ page }) => {
        await inventoryPage.openProducts();
        await expect(page.getByText('Manage your product catalog')).toBeVisible();
        await inventoryPage.openPOS();
        await expect(page.getByText('Products').first()).toBeVisible();
        await expect(inventoryPage.itemCards.first()).toBeVisible();
        // back analog via Products button
        await inventoryPage.openProducts();
        await expect(page.locator('tbody tr').first()).toBeVisible();
    });
});

test.describe('Product - Negative', () => {
    // PROD009 - Negative - Click with expired session
    test('PROD009 - should redirect to login when session expired', async ({ page }) => {
        const authPage = new AuthPage(page);
        const inventoryPage = new InventoryPage(page);
        await page.goto('https://simple-pos-pwdk.netlify.app/');
        await authPage.login('admin@pos.com', 'admin');
        await expect(page.getByText('POS System').first()).toBeVisible();

        // simulate session expired
        await page.context().clearCookies();
        await page.evaluate(() => {
            localStorage.clear();
            sessionStorage.clear();
        });
        await page.reload();
        // simple-pos SPA guards -> redirect to login
        await expect(page.getByText('Welcome Back')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
    });

    // PROD010 - Negative - Invalid ID via URL while logged in
    test('PROD010 - should handle invalid product ID gracefully', async ({ page }) => {
        const authPage = new AuthPage(page);
        await page.goto('https://simple-pos-pwdk.netlify.app/');
        await authPage.login('admin@pos.com', 'admin');
        await expect(page.getByText('POS System').first()).toBeVisible();

        await page.goto('https://simple-pos-pwdk.netlify.app/inventory-item.html?id=9999');
        // simple-pos has no such route -> shows login (guarded)
        await expect(page).toHaveURL(/inventory-item\.html\?id=9999/);
        await expect(page.getByText('Welcome Back')).toBeVisible();
        await expect(page.getByText('Sign in to your account')).toBeVisible();
    });

    // PROD012 - Negative - Direct access without login
    test('PROD012 - should redirect to login when accessing detail without login', async ({ page }) => {
        await page.goto('https://simple-pos-pwdk.netlify.app/inventory-item.html?id=4');
        await expect(page).toHaveURL(/inventory-item\.html\?id=4/);
        await expect(page.getByText('Welcome Back')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
    });
});
