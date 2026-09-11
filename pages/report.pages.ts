import { Page } from "@playwright/test"

export class ReportPage {
    readonly page: Page;
    readonly reportsButton;
    readonly header;
    readonly subHeader;
    readonly filterDropdown;
    readonly totalSalesLabel;
    readonly transactionsLabel;
    readonly averageOrderLabel;
    readonly topProductsLabel;
    readonly dailySalesSection;
    readonly topProductsSection;

    constructor(page: Page) {
        this.page = page;
        this.reportsButton = page.getByRole('button', { name: 'Reports' });
        this.header = page.getByText('Sales Reports').first();
        this.subHeader = page.getByText('Track your business performance').first();
        this.filterDropdown = page.locator('select').first();
        this.totalSalesLabel = page.getByText('Total Sales').first();
        this.transactionsLabel = page.getByText('Transactions').first();
        this.averageOrderLabel = page.getByText('Average Order').first();
        this.topProductsLabel = page.getByText('Top Products').first();
        this.dailySalesSection = page.locator('h3', { hasText: 'Daily Sales' }).locator('..');
        this.topProductsSection = page.locator('h3', { hasText: 'Top Products' }).last().locator('..');
    }

    async openReports() {
        await this.reportsButton.click();
    }

    async selectFilter(value: 'today' | 'week' | 'month' | 'year') {
        await this.filterDropdown.selectOption(value);
    }

    async selectFilterByLabel(label: string) {
        await this.filterDropdown.selectOption({ label });
    }

    getMetricValue(label: string) {
        // Card structure: label p + value p sibling inside same flex
        // Use locator: p with text label + following p with $ or number
        return this.page.locator(`p:has-text("${label}") + p`).first();
    }

    getTotalSalesValue() {
        // Total Sales card: second p after label
        return this.page.locator('div.bg-white.rounded-lg.shadow-md.p-6').filter({ hasText: 'Total Sales' }).locator('p.text-2xl').first();
    }

    getTransactionsValue() {
        return this.page.locator('div.bg-white.rounded-lg.shadow-md.p-6').filter({ hasText: 'Transactions' }).locator('p.text-2xl').first();
    }

    getAverageOrderValue() {
        return this.page.locator('div.bg-white.rounded-lg.shadow-md.p-6').filter({ hasText: 'Average Order' }).locator('p.text-2xl').first();
    }

    getTopProductsCountValue() {
        // Top Products card inside grid has Top Products label + count
        return this.page.locator('div.grid').first().locator('div.bg-white.rounded-lg.shadow-md.p-6').filter({ hasText: 'Top Products' }).locator('p.text-2xl').first();
    }

    getDailySalesValue() {
        // Daily Sales section: span with $ amount
        return this.dailySalesSection.locator('span.text-sm.font-medium').first();
    }

    getTopProductsList() {
        // Returns list of product rows inside Top Products section
        return this.topProductsSection.locator('div.flex.items-center.justify-between');
    }

    async getDatabase() {
        return this.page.evaluate(() => {
            const raw = localStorage.getItem('pos_database');
            if (!raw) return null;
            return JSON.parse(raw);
        });
    }

    async getCalculatedTotals() {
        const db: any = await this.getDatabase();
        if (!db) return null;
        const total = db.transactions.reduce((sum: number, t: any) => sum + t.total_amount, 0);
        const count = db.transactions.length;
        const avg = count > 0 ? total / count : 0;
        // daily sales grouped by date
        const daily: Record<string, number> = {};
        for (const t of db.transactions) {
            const date = t.created_at.slice(0, 10);
            daily[date] = (daily[date] || 0) + t.total_amount;
        }
        // top products aggregated
        const prodMap: Record<string, { name: string; qty: number; total: number }> = {};
        for (const it of db.transaction_items) {
            const k = it.product_name;
            if (!prodMap[k]) prodMap[k] = { name: k, qty: 0, total: 0 };
            prodMap[k].qty += it.quantity;
            prodMap[k].total += it.total_price;
        }
        return { total, count, avg, daily, prodMap, db };
    }
}
