import { Page } from "@playwright/test"

export class UIPage {
    readonly page: Page;
    // Sidebar (adapted from saucedemo burger menu to simple-pos persistent sidebar)
    readonly burgerButton;
    readonly burgerCloseButton;
    readonly sidebarMenu;
    readonly allItemsLink;
    readonly aboutLink;
    readonly logoutLink;
    readonly resetLink;
    // Footer (simple-pos has no footer social; map to main content)
    readonly footer;
    readonly footerCopy;
    readonly socialTwitter;
    readonly socialFacebook;
    readonly socialLinkedin;

    // simple-pos specifics
    readonly sidebar;
    readonly sidebarTitle;
    readonly adminUser;
    readonly posLink;
    readonly productsLink;
    readonly transactionsLink;
    readonly reportsLink;
    readonly settingsLink;
    readonly signOutButton;

    constructor(page: Page) {
        this.page = page;
        // Sidebar - always visible in simple-pos, no burger toggle
        this.sidebar = page.locator('div.bg-gray-900');
        this.burgerButton = page.getByText('POS System').first();
        this.burgerCloseButton = page.getByText('POS System').first(); // no close, same for parity
        this.sidebarMenu = page.locator('nav').first();
        this.allItemsLink = page.getByRole('button', { name: 'Point of Sale' });
        this.aboutLink = page.getByRole('button', { name: 'Products' });
        this.logoutLink = page.getByRole('button', { name: 'Sign Out' });
        this.resetLink = page.getByRole('button', { name: 'Settings' });

        // Additional simple-pos nav
        this.sidebarTitle = page.getByText('POS System').first();
        this.adminUser = page.getByText('Admin User').first();
        this.posLink = page.getByRole('button', { name: 'Point of Sale' });
        this.productsLink = page.getByRole('button', { name: 'Products' });
        this.transactionsLink = page.getByRole('button', { name: 'Transactions' });
        this.reportsLink = page.getByRole('button', { name: 'Reports' });
        this.settingsLink = page.getByRole('button', { name: 'Settings' });
        this.signOutButton = page.getByRole('button', { name: 'Sign Out' });

        // Footer analog: main content area
        this.footer = page.locator('main');
        this.footerCopy = page.getByText('Products').first();
        // Map social to navigation for validation reuse
        this.socialTwitter = page.getByRole('button', { name: 'Point of Sale' });
        this.socialFacebook = page.getByRole('button', { name: 'Products' });
        this.socialLinkedin = page.getByRole('button', { name: 'Transactions' });
    }

    async openSidebar() {
        // No burger in simple-pos; sidebar already visible
        return;
    }

    async closeSidebar() {
        // No close action; keep for parity
        return;
    }
}
