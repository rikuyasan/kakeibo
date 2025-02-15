import { NextFunction, Request, Response } from "express";
import { CustomError } from "../Errors/CustomError";

// エラーレスポンスの生成
export const errorResponse = (
    err:CustomError, req:Request, res:Response, next: NextFunction
) => {
    console.error(`[Error] [${req.originalUrl}] ${err.message}`);
    res.status(err.statusCode).send(err.resMessage);
};