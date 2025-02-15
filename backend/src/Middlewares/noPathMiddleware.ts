import { NextFunction, Request, Response } from "express";

export const noPath = (
    req:Request, res:Response, next: NextFunction
) => {
    console.error(`[Error] The Path ${req.originalUrl} is not exist`);
    res.status(404).send(`Not Found`);
};