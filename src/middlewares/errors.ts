import type { NextFunction, Request, Response } from "express";
import type { HttpException } from "../exceptions/root.js";
import sendResponse from "../utils/response.js";

export const errorMiddleware = (error: HttpException, req: Request, res: Response, _next: NextFunction) => {
    // Log error details
    console.error('=== ERROR MIDDLEWARE ===');
    console.error('Path:', req.method, req.path);
    console.error('Error Name:', error.name);
    console.error('Error Message:', error.message);
    console.error('Status Code:', error.statusCode);
    console.error('Error Code:', error.errorCode);
    console.error('Error Stack:', error.stack);
    console.error('Error Object:', JSON.stringify(error, null, 2));
    console.error('========================');

    sendResponse(res, error.statusCode, error.message, error.errors as any, true);
}