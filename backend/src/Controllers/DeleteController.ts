import { NextFunction, Request, Response } from "express";
import { CustomError } from "../Errors/CustomError";
import { isPrimaryKey } from "../Utils/validation";
import { DeleteRepository } from "../Repositories/DeleteRepository";

export const deleteController = async (req: Request, res: Response, next: NextFunction) => {
    try{
        isPrimaryKey(req.body);
        console.log(`[info] [${req.originalUrl}] complete validation`);
        const result = await new DeleteRepository(req.body.id).execute()
        console.log(`[info] [${req.originalUrl}] delete column: ${result}`);
        res.status(200).json('delete completed');
        console.log(`[info] [${req.originalUrl}] success response`);
    }catch (e) {
        const error = e as CustomError;
        next(error);
    }
}