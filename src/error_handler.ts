// Gunanya untuk error validation request

import type { Request, Response, NextFunction } from "express";
import { ErrorCode, HttpException } from "./exceptions/root.js";
import { internalException } from "./exceptions/internal_exception.js";
import { ZodError } from "zod";
import { BadRequestException } from "./exceptions/bad-request.js";

export const errorHandler = (method: Function) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await method(req, res, next);
    } catch (error: any) {
      console.error('=== ERROR HANDLER ===');
      console.error('Path:', req.method, req.path);
      console.error('Error Type:', error.constructor.name);
      console.error('Error Message:', error.message);
      console.error('Error:', error);
      console.error('=====================');

      let exception: HttpException;
      if (error instanceof HttpException) {
        exception = error;
      } else {
        if (error instanceof ZodError) {
          console.error('[ERROR HANDLER] ZodError detected:', error.issues);
          // Format Zod validation errors to be user-friendly
          const formattedErrors = error.issues.map((err: any) => {
            return `${err.path.join('.')}: ${err.message}`;
          }).join(', ');

          exception = new BadRequestException(
            formattedErrors || "Data yang diberikan tidak valid",
            ErrorCode.UNPROCESSABLE_ENTITY
          );
        } else if (error.code === 'P2002') {
          console.error('[ERROR HANDLER] Prisma unique constraint violation');
          // Handle Prisma unique constraint violation
          exception = new BadRequestException(
            "User Already Exist",
            ErrorCode.USER_ALREADY_EXISTS
          );
        } else {
          console.error('[ERROR HANDLER] Internal Exception:', error);
          exception = new internalException(
            "Something went wrong",
            error,
            ErrorCode.INTERNAL_EXCEPTION
          );
        }

      }
      next(exception);
    }
  };
};
