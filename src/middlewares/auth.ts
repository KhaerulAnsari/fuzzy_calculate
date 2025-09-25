import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedException } from "../exceptions/unauthorized.js";
import { ErrorCode } from "../exceptions/root.js";
import { JWT_SECRET } from "../secretes.js";
import { prismaClient } from "../index.js";

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 1. extrach the token from header
  const token = req.headers.authorization;

  // 2.if token is not present, throw an error of unauthorized
  if (!token) {
    next(new UnauthorizedException("Unauthorized", ErrorCode.UNAUTHORIZED));
  }

  try {
    // 3. if the token is present, verify that token and extract the payload

    const payload = jwt.verify(String(token), JWT_SECRET) as any;

    // 4. if the token is valid, find the user with the extracted payload userId
    const user = await prismaClient.user.findFirst({
      where: {
        id: payload.userId,
      },
    });

    if(!user) {
        next(new UnauthorizedException("Unauthorized", ErrorCode.UNAUTHORIZED));
    }

    // 5. to attach the user to the current request object
    req.user = user
    next();
  } catch (error) {
    next(new UnauthorizedException("Unauthorized", ErrorCode.UNAUTHORIZED));
  }

  
};

export default authMiddleware;
