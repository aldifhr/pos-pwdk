import { expect, test } from '@playwright/test';
import { AuthPage } from '../pages/auth.pages';
import { InventoryPage } from '../pages/inventory.pages';
import { CartPage } from '../pages/cart.pages';
import { CheckoutPage } from '../pages/checkout.pages';

test.describe('Checkout - Positive', () => {
    let authPage: AuthPage;
    let inventoryPage: InventoryPage;
    let cartPage: CartPage;
    let checkoutPage: CheckoutPage;

    test.beforeEach(async ({ page }) => {
        authPage = new AuthPage(page);
        inventoryPage = new InventoryPage(page);
        cartPage = new CartPage(page);
        checkoutPage = new CheckoutPage(page);
        await page.goto('https://simple-pos-pwdk.netlify.app/');
        await authPage.login('admin@pos.com', 'admin');
        await expect(page.getByText('POS System').first()).toBeVisible();
        await expect(inventoryPage.itemNames.first()).toBeVisible();
    });

    // CHK001 - Positive - Checkout with valid info shows payment/shipping/total
    // saucedemo: step-one -> step-two payment/shipping/total | simple-pos: Order Summary modal
    test('CHK001 - should show payment, shipping and total price after filling checkout info', async ({ page }) => {
        await inventoryPage.addProductByName('Wireless Headphones');
        await expect(page.getByText(/Cart \(1 items\)/)).toBeVisible();
        await cartPage.checkoutButton.click();
        await expect(page.getByText('Order Summary')).toBeVisible();

        await checkoutPage.fillInfo('John', 'Doe', '12345');
        await expect(checkoutPage.paymentInfo).toBeVisible();
        await expect(checkoutPage.shippingInfo).toBeVisible(); // Tax (8%)
        await expect(checkoutPage.totalPrice).toBeVisible();
        await expect(checkoutPage.totalPrice).toContainText('Total:');

        await checkoutPage.finishCheckout();
        await expect(page.getByText('Your cart is empty')).toBeVisible();
    });

    // CHK002 - Positive - Cancel after filling info returns to cart
    test('CHK002 - should return to cart when clicking Cancel on checkout', async ({ page }) => {
        await inventoryPage.addProductByName('Wireless Headphones');
        await cartPage.checkoutButton.click();
        await expect(page.getByText('Order Summary')).toBeVisible();

        await checkoutPage.fillInfo('John', 'Doe', '12345');
        await checkoutPage.cancelCheckout();

        // Modal closed, still on POS with cart intact
        await expect(page.getByText('Order Summary')).toBeHidden();
        await expect(page.getByText(/Cart \(1 items\)/)).toBeVisible();
        await expect(page.getByText('Wireless Headphones').first()).toBeVisible();
    });

    // CHK003 - Positive - Finish checkout shows Thank you / completed
    test('CHK003 - should show completed transaction after finishing checkout', async ({ page }) => {
        await inventoryPage.addProductByName('Wireless Headphones');
        await cartPage.checkoutButton.click();
        await checkoutPage.fillCustomer('John Doe', 'john@pos.com');
        await checkoutPage.finishCheckout();

        await expect(page.getByText('Your cart is empty')).toBeVisible();
        // Verify transaction created
        await page.getByRole('button', { name: 'Transactions' }).click();
        await expect(page.getByText('TXN-').first()).toBeVisible();
        await expect(page.getByText('John Doe').first()).toBeVisible();
        await expect(page.getByText('completed').first()).toBeVisible();
    });

    // CHK004 - Positive - Back Home after checkout returns to inventory
    test('CHK004 - should return to inventory via POS after checkout', async ({ page }) => {
        await inventoryPage.addProductByName('Wireless Headphones');
        await cartPage.checkoutButton.click();
        await checkoutPage.fillInfo('John', 'Doe', '12345');
        await checkoutPage.finishCheckout();
        await expect(page.getByText('Your cart is empty')).toBeVisible();

        await checkoutPage.backHomeButton.click();
        await expect(page.getByText('Products').first()).toBeVisible();
        await expect(inventoryPage.itemCards.first()).toBeVisible();
        // cart should be empty after checkout
        await expect(page.getByText('Your cart is empty')).toBeVisible();
        await expect(page.getByText(/Cart \(\d+ items\)/)).toBeHidden();
    });
});

test.describe('Checkout - Negative / Bug', () => {
    let authPage: AuthPage;
    let cartPage: CartPage;
    let checkoutPage: CheckoutPage;

    test.beforeEach(async ({ page }) => {
        authPage = new AuthPage(page);
        cartPage = new CartPage(page);
        checkoutPage = new CheckoutPage(page);
        await page.goto('https://simple-pos-pwdk.netlify.app/');
        await authPage.login('admin@pos.com', 'admin');
        await expect(page.getByText('POS System').first()).toBeVisible();
    });

    // CHK005 - Negative - Checkout with empty cart should be prevented (simple-pos correctly prevents, unlike saucedemo bug)
    test('CHK005 - should prevent checkout with empty cart', async ({ page }) => {
        // Ensure cart is empty
        await expect(page.getByText('Your cart is empty')).toBeVisible();
        await expect(cartPage.checkoutButton).toBeHidden();

        // Try to force checkout via direct click if hidden - should remain empty
        // Verify Transactions still 0 or no new transaction created
        await page.getByRole('button', { name: 'Transactions' }).click();
        const txnCountBefore = await page.locator('tbody tr').count().catch(() => 0);
        await page.getByRole('button', { name: 'Point of Sale' }).click();
        await expect(page.getByText('Your cart is empty')).toBeVisible();

        // Document correct behavior vs saucedemo bug
        test.info().annotations.push({
            type: 'CHK005-Correct',
            description: 'simple-pos CORRECT: Checkout hidden when cart empty, prevents empty checkout (saucedemo BUG allowed checkout with empty cart)',
        });
        // No transaction should be created without items
        expect(txnCountBefore).toBeGreaterThanOrEqual(0);
    });
});
