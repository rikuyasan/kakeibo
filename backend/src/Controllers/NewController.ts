import { NextFunction, Request, Response } from "express";
import { CustomError } from "../Errors/CustomError";
import { NewValidation } from "../Validations/NewValidation";
import { NewRepository } from "../Repositories/NewRepository";

export const newController = async (req: Request, res: Response, next: NextFunction) => {
    try{
        new NewValidation(req.body).validation()
        console.log(`[info] [${req.originalUrl}] complete validation`);
        const result = await new NewRepository(req.body).execute()
        console.log(`[info] [${req.originalUrl}] create new column: ${result}`);
        res.status(200).json('registration completed');
        console.log(`[info] [${req.originalUrl}] success response`);
    }catch (e) {
        const error = e as CustomError;
        next(error);
    }
}