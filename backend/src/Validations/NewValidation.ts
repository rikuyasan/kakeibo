import { categoryValidation, dateValidation, isFullField, nameValidation, paymentMethodValidation, paymentValidation, yearMonthValidation } from "../Utils/validation";

export class NewValidation {
    private readonly date!: string;
    private readonly name!: string;
    private readonly payment!: number;
    private readonly category!: string;
    private readonly paymentMethod!: string;
    private readonly yearMonth!: number;

    constructor(body: any) {
        isFullField(body);
        Object.assign(this, body);
    }

    validation() : void {
        dateValidation(this.date, this.yearMonth);
        nameValidation(this.name);
        paymentValidation(this.payment);
        categoryValidation(this.category);
        paymentValidation(this.payment);
        paymentMethodValidation(this.paymentMethod);
        yearMonthValidation(this.yearMonth);
    }
}