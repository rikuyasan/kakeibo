import { NextFunction, Request, Response } from "express";
import { ShowValidation } from "../Validations/ShowValidation";
import { CustomError } from "../Errors/CustomError";
import { ShowRepository } from "../Repositories/ShowRepository";

export const showController = async (req: Request, res: Response, next: NextFunction) => {
    try{
        new ShowValidation(req.body).validation()
        console.log(`[info] [${req.originalUrl}] complete validation`);
        const results = await new ShowRepository(req.body).execute()
        console.log(`[info] [${req.originalUrl}] success query`);
        res.status(200).json(results);
        console.log(`[info] [${req.originalUrl}] success response`);
    }catch (e) {
        const error = e as CustomError;
        next(error);
    }
}