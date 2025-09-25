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
      let exception: HttpException;
      if (error instanceof HttpException) {
        exception = error;
      } else {
        if (error instanceof ZodError) {
          exception = new BadRequestException(
            "Unprocessable Entity",
            ErrorCode.UNPROCESSABLE_ENTITY
          );
        } else {
            exception = new internalException(
          "Womething went wrong",
          error,
          ErrorCode.INTERNAL_EXCEPTION
        );
        }
        
      }
      next(exception);
    }
  };
};
