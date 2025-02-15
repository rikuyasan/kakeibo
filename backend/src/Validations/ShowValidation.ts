import { CustomError } from "../Errors/CustomError";
import { paymentMethodValidation, yearMonthValidation } from "../Utils/validation";

export class ShowValidation {
    private readonly paymentMethod?: string;
    private readonly yearMonth: number;

    constructor(body: any) {
        const yearMonth = body.yearMonth;
        if (typeof body === 'object' && !yearMonth) {
            throw new CustomError('no parameter', 400);
        }
        if (!(Number.isInteger(yearMonth))) {
            throw new CustomError('the parameter is not integer', 400);
        }
        if (typeof body.paymentMethod !== 'undefined') {
            if (typeof body.paymentMethod !== 'string') {
                throw new CustomError("the 'paymentMethod' parameter must be string", 400);
            }
            this.paymentMethod = body.paymentMethod;
        }
        this.yearMonth = yearMonth;
    }

    validation() : void {
        yearMonthValidation(this.yearMonth);
        if (this.paymentMethod) {
            paymentMethodValidation(this.paymentMethod);
        }
    }
}