import { PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError,PrismaClientInitializationError } from '@prisma/client/runtime/library';
import { CustomError } from "../Errors/CustomError";

const prisma = new PrismaClient();

export class DeleteRepository {
    private readonly id: number;

    constructor(id: number) {
        this.id = id;
    }

    async execute() {
        try {
            const result = await prisma.payment.delete({
                where: {id: this.id}
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