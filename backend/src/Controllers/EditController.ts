import { NextFunction, Request, Response } from "express";
import { CustomError } from "../Errors/CustomError";
import { EditRepository } from "../Repositories/EditRepository";
import { EditValidation } from "../Validations/EditValidation";

export const editController = async (req: Request, res: Response, next: NextFunction) => {
    try{
        new EditValidation(req.body).validation()
        console.log(`[info] [${req.originalUrl}] complete validation`);
        const result = await new EditRepository(req.body).execute()
        console.log(`[info] [${req.originalUrl}] update column: ${result}`);
        res.status(200).json('update completed');
        console.log(`[info] [${req.originalUrl}] success response`);
    }catch (e) {
        const error = e as CustomError;
        next(error);
    }
}