import { Page } from "@playwright/test"

export class ProductPage {
    readonly page: Page;
    readonly detailName;
    readonly detailDesc;
    readonly detailPrice;
    readonly detailImage;
    readonly addToCartButton;
    readonly removeButton;
    readonly backButton;

    constructor(page: Page) {
        this.page = page;
        // simple-pos has NO dedicated detail page (POS grid is both inventory+detail)
        // Map to POS card elements for POM parity with saucedemo/pages/product.pages.ts
        this.detailName = page.locator('h3.font-semibold.truncate').first();
        this.detailDesc = page.locator('p.line-clamp-2').first();
        this.detailPrice = page.locator('span.text-green-600').first();
        this.detailImage = page.locator('div.aspect-square').first();
        this.addToCartButton = page.locator('button:has-text("Add to Cart")').first();
        // cart remove = trash icon in cart section
        this.removeButton = page.locator('button.bg-red-100').first();
        // back analog = navigate to POS/Products
        this.backButton = page.getByRole('button', { name: 'Point of Sale' });
    }

    async getDetailData() {
        return {
            name: await this.detailName.textContent(),
            desc: await this.detailDesc.textContent(),
            price: await this.detailPrice.textContent(),
            imageSrc: await this.detailImage.innerHTML(),
        };
    }
}
