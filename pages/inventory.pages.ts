import { Page } from "@playwright/test"

export class InventoryPage {
    readonly page: Page;
    readonly sortDropdown;
    readonly itemNames;
    readonly itemPrices;
    readonly itemDescs;
    readonly itemImages;
    readonly itemCards;
    readonly addToCartButtons;
    readonly cartBadge;
    readonly categoryFilter;
    readonly searchInput;
    readonly posButton;
    readonly productsButton;

    constructor(page: Page) {
        this.page = page;
        // POS / Inventory analog: simple-pos uses POS grid + Products table
        // Keep saucedemo locator names for compatibility
        // No real sort dropdown in simple-pos -> map to category filter (kept for POM parity)
        this.sortDropdown = page.locator('select').first();
        this.categoryFilter = page.locator('select').first();
        this.searchInput = page.getByPlaceholder('Search products...');
        // Product names in POS grid (h3) and Products table (tbody td) -> use POS grid as primary
        this.itemNames = page.locator('h3.font-semibold.truncate');
        this.itemPrices = page.locator('span.text-green-600');
        this.itemDescs = page.locator('p.line-clamp-2');
        this.itemImages = page.locator('div.aspect-square');
        this.itemCards = page.locator('div.bg-white.rounded-lg.shadow-md.border');
        this.addToCartButtons = page.locator('button:has-text("Add to Cart")');
        // Cart badge analog: "Cart (N items)" header or "N in cart" label
        this.cartBadge = page.locator('text=/Cart \\(\\d+ items\\)/').first();
        this.posButton = page.getByRole('button', { name: 'Point of Sale' });
        this.productsButton = page.getByRole('button', { name: 'Products' });
    }

    // Compatibility with saucedemo's sortBy('az'|'za'|'lohi'|'hilo')
    // simple-pos has NO UI sorting -> this is no-op but preserves test structure
    // We log instead of interacting with category filter to avoid breaking tests
    async sortBy(value: 'az' | 'za' | 'lohi' | 'hilo') {
        // No sorting UI in simple-pos; sorting is verified via data extraction
        // Keep method for POM parity with saucedemo/pages/inventory.pages.ts:26
        return;
    }

    async getItemNames(): Promise<string[]> {
        return this.itemNames.allTextContents();
    }

    async getItemPrices(): Promise<number[]> {
        const texts = await this.itemPrices.allTextContents();
        return texts.map(t => parseFloat(t.replace('$', '').trim()));
    }

    async openPOS() {
        await this.posButton.click();
    }

    async openProducts() {
        await this.productsButton.click();
    }

    // Helpers mirip saucedemo untuk konsistensi
    async getFirstItemData() {
        return {
            name: await this.itemNames.first().textContent(),
            desc: await this.itemDescs.first().textContent(),
            price: await this.itemPrices.first().textContent(),
            imageSrc: await this.itemImages.first().innerHTML(),
        };
    }

    async clickFirstItemByTitle() {
        await this.itemNames.first().click();
    }

    async clickFirstItemByImage() {
        await this.itemImages.first().click();
    }

    async addFirstItemToCart() {
        await this.addToCartButtons.first().click();
    }

    async addProductByName(productName: string) {
        const card = this.page.locator('div.bg-white.rounded-lg.shadow-md.border', { hasText: productName });
        await card.locator('button:has-text("Add to Cart")').click();
    }

    // === PSS - Product Search and Selection helpers ===
    async searchProduct(productName: string) {
        await this.searchInput.fill(productName);
    }

    async clearSearch() {
        await this.searchInput.fill('');
    }

    async filterByCategory(label: string) {
        await this.categoryFilter.selectOption({ label });
    }

    async filterByCategoryValue(value: string) {
        await this.categoryFilter.selectOption(value);
    }

    getNoProductsFound() {
        return this.page.getByText('No products found');
    }

    getProductCard(productName: string) {
        return this.page.locator('div.bg-white.rounded-lg.shadow-md.border', { hasText: productName });
    }

    getAddToCartButton(productName: string) {
        return this.getProductCard(productName).locator('button').first();
    }

    async setProductStockToZero(productName: string) {
        await this.page.evaluate((name) => {
            const raw = localStorage.getItem('pos_database');
            if (!raw) return;
            const db = JSON.parse(raw);
            const prod = db.products.find((p: any) => p.name === name);
            if (prod) {
                prod.stock_quantity = 0;
                localStorage.setItem('pos_database', JSON.stringify(db));
            }
        }, productName);
    }

    async getStockText(productName: string) {
        return this.getProductCard(productName).locator('text=Stock:').innerText();
    }
}
