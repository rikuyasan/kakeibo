import { PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError,PrismaClientInitializationError } from '@prisma/client/runtime/library';
import { CustomError } from "../Errors/CustomError";
import { Field } from "../Utils/validation";

const prisma = new PrismaClient();

export class NewRepository {
    private readonly body: Field;

    constructor(body: Field) {
        this.body = body;
    }

    async execute() {
        try {
            const result = await prisma.payment.createMany({
                data: {
                    date: this.body.date,
                    name: this.body.name,
                    payment: this.body.payment,
                    category: this.body.category,
                    paymentMethod: this.body.paymentMethod,
                    yearMonth: this.body.yearMonth
                }
            });
            return result
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                // Prisma の既知のリクエストエラーの場合の処理
                throw new CustomError(`a database error has occurred: ${error.message}`, 500);
            } else if (error instanceof PrismaClientInitializationError) {
                // Prisma の既知のリクエストエラーの場合の処理
                throw new CustomError(`a database error has occurred: ${error.message}`, 500);
            } else {
                // その他のエラーの場合の処理
                throw new CustomError('an unexpected error has occurred', 500);
            }
        }
    }
}