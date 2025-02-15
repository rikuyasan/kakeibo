import { NextFunction, Request, Response } from "express";

// アクセスログ
export const accessLog = (
    req: Request, res: Response, next: NextFunction
) => {
    console.log(`[info] The path ${req.originalUrl} is accessed`);
    next();
}