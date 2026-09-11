import { Page } from "@playwright/test"

export class CartPage {
    readonly page: Page;
    readonly cartLink;
    readonly cartBadge;
    readonly cartItems;
    readonly cartPanel;
    readonly itemNames;
    readonly removeButtons;
    readonly continueShoppingButton;
    readonly checkoutButton;
    readonly emptyCartText;

    constructor(page: Page) {
        this.page = page;
        // simple-pos has no separate cart page; cart is inline on POS (right panel)
        // Keep saucedemo locators for parity, map to POS equivalents
        this.cartLink = page.getByRole('button', { name: 'Transactions' }); // closest to cart navigation
        this.cartBadge = page.getByText(/Cart \(\d+ items\)/);
        // Right column cart panel (grid lg:grid-cols-3 > last div)
        this.cartPanel = page.locator('div.grid > div').last();
        // cart items are rows with trash button inside cart panel
        this.cartItems = this.cartPanel.locator('div.p-4.border-b');
        // fallback: count trash buttons as items
        this.itemNames = page.locator('h3.font-semibold.truncate');
        this.removeButtons = this.cartPanel.locator('button.bg-red-100');
        this.continueShoppingButton = page.getByRole('button', { name: 'Point of Sale' });
        this.checkoutButton = page.getByRole('button', { name: 'Checkout' });
        this.emptyCartText = page.getByText('Your cart is empty');
    }

    async open() {
        // No separate cart page in simple-pos; POS is already cart view
        // Keep method for parity; just ensure POS is visible
        await this.page.getByRole('button', { name: 'Point of Sale' }).click().catch(() => {});
    }

    async getCartItemNames(): Promise<string[]> {
        return this.itemNames.allTextContents();
    }

    async removeFirstItem() {
        await this.removeButtons.first().click();
    }

    async removeProductByName(productName: string) {
        const row = this.page.locator('div', { hasText: productName }).filter({ has: this.page.locator('button.bg-red-100') }).first();
        await row.locator('button.bg-red-100').click();
    }

    // === Cart quantity controls (simple-pos right panel) ===
    getCartRow(productName: string) {
        return this.cartPanel.locator('div.p-4.border-b', { hasText: productName });
    }

    getQuantity(productName: string) {
        return this.getCartRow(productName).locator('span.w-8.text-center');
    }

    getPlusButton(productName: string) {
        // plus button contains svg.lucide-plus inside cart row
        return this.getCartRow(productName).locator('button').filter({ has: this.page.locator('svg.lucide-plus') });
    }

    getMinusButton(productName: string) {
        return this.getCartRow(productName).locator('button').filter({ has: this.page.locator('svg.lucide-minus') });
    }

    getRemoveButton(productName: string) {
        return this.getCartRow(productName).locator('button.bg-red-100');
    }

    getAvailableText(productName: string) {
        return this.getCartRow(productName).getByText(/Available:/);
    }

    getTotalText(productName: string) {
        return this.getCartRow(productName).getByText(/Total:/).first();
    }

    getCheckoutModal() {
        return this.page.locator('div.fixed').filter({ hasText: 'Checkout' }).first();
    }

    async setProductStock(productName: string, quantity: number) {
        await this.page.evaluate(({ name, qty }) => {
            const raw = localStorage.getItem('pos_database');
            if (!raw) return;
            const db = JSON.parse(raw);
            const prod = db.products.find((p: any) => p.name === name);
            if (prod) {
                prod.stock_quantity = qty;
                localStorage.setItem('pos_database', JSON.stringify(db));
            }
        }, { name: productName, qty: quantity });
    }
}
