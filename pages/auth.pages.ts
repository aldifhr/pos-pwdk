import { Page } from "@playwright/test"

export class AuthPage {
    readonly page: Page;
    readonly emailInput;
    readonly passwordInput;
    readonly loginButton;
    readonly errorMessage;
    readonly signUpLink;
    readonly signUpTitle;
    readonly signInLink;

    constructor(page: Page) {
        this.page = page;
        // simple-pos login uses placeholder selectors
        this.emailInput = page.getByPlaceholder('Enter your email');
        this.passwordInput = page.getByPlaceholder('Enter your password');
        this.loginButton = page.getByRole('button', { name: 'Sign In' });
        // error box: <div class="bg-red-50 ...">Invalid credentials</div>
        this.errorMessage = page.locator('div.bg-red-50');
        this.signUpLink = page.getByText("Don't have an account? Sign up");
        this.signUpTitle = page.getByText('Join Our POS');
        this.signInLink = page.getByText('Already have an account? Sign in');
    }

    async login(email?: string, password?: string) {
        await this.emailInput.fill(email || "");
        await this.passwordInput.fill(password || "");
        await this.loginButton.click();
    }

    async getEmailValidationMessage(): Promise<string> {
        return await this.emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
    }

    async getPasswordValidationMessage(): Promise<string> {
        return await this.passwordInput.evaluate((el: HTMLInputElement) => el.validationMessage);
    }

    async goToSignUp() {
        await this.signUpLink.click();
    }
}
