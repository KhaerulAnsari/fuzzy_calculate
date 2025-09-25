import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedException } from "../exceptions/unauthorized.js";
import { ErrorCode } from "../exceptions/root.js";
import { JWT_SECRET } from "../secretes.js";
import { prismaClient } from "../index.js";

const adminMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
 const user = req.user;

 if(user.role == 'ADMIN') {
    next();
 } else {
    next(new UnauthorizedException("Unauthorized", ErrorCode.UNAUTHORIZED));
 }

  
};

export default adminMiddleware;
