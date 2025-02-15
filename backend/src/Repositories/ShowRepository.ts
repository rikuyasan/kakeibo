import { PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError,PrismaClientInitializationError } from '@prisma/client/runtime/library';
import { CustomError } from "../Errors/CustomError";

const prisma = new PrismaClient();

export class ShowRepository {
    private readonly yearMonth: number;
    private readonly paymentMethod?: string;

    constructor(body: {yearMonth: number, paymentMethod?: string}) {
        this.yearMonth = body.yearMonth;
        this.paymentMethod = body.paymentMethod;
    }

    async execute() {
        try {
            const results = await prisma.payment.findMany({
                where: {
                    yearMonth: this.yearMonth,
                    ...(this.paymentMethod && { paymentMethod: this.paymentMethod })
                }
            });
            if (results.length === 0) {
                throw new CustomError('no data', 400);
            }
            return results
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            } else if (error instanceof PrismaClientKnownRequestError) {
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