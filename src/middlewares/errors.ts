import type { NextFunction, Request, Response } from "express";
import type { HttpException } from "../exceptions/root.js";
import sendResponse from "../utils/response.js";

export const errorMiddleware = (error: HttpException, _req: Request, res: Response, _next: NextFunction) => {
    sendResponse(res, error.statusCode, error.message, error.errors as any, true);
}