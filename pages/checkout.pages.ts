import { Page } from "@playwright/test"

export class CheckoutPage {
    readonly page: Page;
    // Step One (mapped to simple-pos customer form)
    readonly firstNameInput;
    readonly lastNameInput;
    readonly postalCodeInput;
    readonly continueButton;
    readonly cancelButton;
    readonly errorMessage;
    // Step Two (Order Summary)
    readonly paymentInfo;
    readonly shippingInfo;
    readonly totalPrice;
    readonly finishButton;
    readonly cancelButtonStepTwo;
    // Complete
    readonly completeHeader;
    readonly completeText;
    readonly backHomeButton;

    // simple-pos specifics
    readonly customerNameInput;
    readonly customerEmailInput;
    readonly notesInput;
    readonly completeTransactionButton;
    readonly orderSummary;

    constructor(page: Page) {
        this.page = page;
        // Map saucedemo fields to simple-pos
        this.customerNameInput = page.getByPlaceholder('Enter customer name');
        this.customerEmailInput = page.getByPlaceholder('Enter customer email');
        this.notesInput = page.getByPlaceholder('Notes (Optional)').or(page.locator('textarea'));
        this.firstNameInput = this.customerNameInput;
        this.lastNameInput = this.customerEmailInput;
        this.postalCodeInput = this.notesInput;
        this.continueButton = page.getByRole('button', { name: 'Complete Transaction' });
        this.cancelButton = page.getByRole('button', { name: 'Cancel' });
        this.errorMessage = page.locator('div.bg-red-50');
        // Order Summary section
        this.paymentInfo = page.getByText('Order Summary').first();
        this.shippingInfo = page.getByText('Tax (8%)').first();
        this.totalPrice = page.getByText('Total:').first();
        this.finishButton = page.getByRole('button', { name: 'Complete Transaction' });
        this.cancelButtonStepTwo = page.getByRole('button', { name: 'Cancel' });
        // Complete analog: after transaction, cart shows "Your cart is empty" and Transactions has TXN-
        this.completeHeader = page.getByText('Your cart is empty').first();
        this.completeText = page.locator('text=TXN-').first();
        this.backHomeButton = page.getByRole('button', { name: 'Point of Sale' });
        this.completeTransactionButton = this.finishButton;
        this.orderSummary = page.getByText('Order Summary');
    }

    async fillInfo(firstName: string, lastName: string, postalCode: string) {
        // Adapt: firstName -> customer name, lastName+postalCode -> email fallback
        // CHK tests call fillInfo('John','Doe','12345') -> map to John Doe / john.doe.12345@pos.com
        const name = `${firstName} ${lastName}`.trim();
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${postalCode}@pos.com`;
        await this.customerNameInput.fill(name);
        await this.customerEmailInput.fill(email);
    }

    async fillCustomer(name: string, email: string) {
        await this.customerNameInput.fill(name);
        await this.customerEmailInput.fill(email);
    }

    async continueCheckout() {
        await this.continueButton.click();
    }

    async cancelCheckout() {
        await this.cancelButton.click();
    }

    async finishCheckout() {
        await this.finishButton.click();
    }
}
