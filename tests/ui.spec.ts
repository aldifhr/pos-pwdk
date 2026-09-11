import { expect, test } from '@playwright/test';
import { AuthPage } from '../pages/auth.pages';
import { UIPage } from '../pages/ui.pages';

test.describe('UI - Sidebar & Footer', () => {
    let authPage: AuthPage;
    let uiPage: UIPage;

    test.beforeEach(async ({ page }) => {
        authPage = new AuthPage(page);
        uiPage = new UIPage(page);
        await page.goto('https://simple-pos-pwdk.netlify.app/');
        await authPage.login('admin@pos.com', 'admin');
        await expect(page.getByText('POS System').first()).toBeVisible();
    });

    // UI001 - Positive - Sidebar displays correctly
    // saucedemo: burger + All Items/About/Logout/Reset | simple-pos: persistent sidebar POS/Products/.../Sign Out
    test('UI001 - should display sidebar with complete navigation menu', async () => {
        await expect(uiPage.burgerButton).toBeVisible(); // POS System title
        await expect(uiPage.sidebar).toBeVisible();
        await expect(uiPage.sidebarMenu).toBeVisible();

        await expect(uiPage.allItemsLink).toBeVisible();
        await expect(uiPage.allItemsLink).toContainText('Point of Sale');
        await expect(uiPage.aboutLink).toBeVisible();
        await expect(uiPage.aboutLink).toContainText('Products');
        await expect(uiPage.logoutLink).toBeVisible();
        await expect(uiPage.logoutLink).toContainText('Sign Out');
        await expect(uiPage.resetLink).toBeVisible();
        await expect(uiPage.resetLink).toContainText('Settings');

        // Additional nav checks
        await expect(uiPage.transactionsLink).toBeVisible();
        await expect(uiPage.transactionsLink).toContainText('Transactions');
        await expect(uiPage.reportsLink).toBeVisible();
        await expect(uiPage.reportsLink).toContainText('Reports');
        await expect(uiPage.adminUser).toBeVisible();
        await expect(uiPage.adminUser).toContainText('Admin User');

        // Sidebar is persistent, no close toggle - verify still visible
        await uiPage.closeSidebar();
        await expect(uiPage.sidebarMenu).toBeVisible();
    });

    // UI002 - Positive - Footer / Main content displays correctly
    test('UI002 - should display main content correctly', async ({ page }) => {
        await expect(uiPage.footer).toBeVisible();
        await expect(page.getByText('Products').first()).toBeVisible();
        // Verify POS view has product grid
        await expect(page.locator('select').first()).toBeVisible();
        await expect(page.locator('select').first()).toContainText('All Categories');
        await expect(page.getByPlaceholder('Search products...')).toBeVisible();
    });

    // UI003 - Validation - Navigation links work correctly
    // saucedemo: href Twitter/Facebook/LinkedIn + popup | simple-pos: nav buttons navigate to correct sections
    test('UI003 - should navigate correctly via sidebar links', async ({ page }) => {
        await expect(uiPage.footer).toBeVisible();

        // Verify navigation to Products
        await uiPage.productsLink.click();
        await expect(page.getByText('Manage your product catalog')).toBeVisible();
        await expect(page.getByText('Add Product')).toBeVisible();

        // Verify navigation to Transactions
        await uiPage.transactionsLink.click();
        await expect(page.getByText('View and manage all transactions')).toBeVisible();

        // Verify navigation to Reports
        await uiPage.reportsLink.click();
        await expect(page.getByText('Sales Reports')).toBeVisible();
        await expect(page.getByText('Track your business performance')).toBeVisible();

        // Verify navigation to Settings
        await uiPage.settingsLink.click();
        await expect(page.getByText('Manage your account and system preferences')).toBeVisible();

        // Back to POS
        await uiPage.posLink.click();
        await expect(page.getByText('Products').first()).toBeVisible();
        await expect(page.locator('h3.font-semibold.truncate').first()).toBeVisible();
    });
});
