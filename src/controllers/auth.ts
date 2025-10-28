import type { NextFunction, Request, Response } from "express";
import { prismaClient } from "../index.js";
import { compareSync, hashSync } from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../secretes.js";
import { BadRequestException } from "../exceptions/bad-request.js";
import { ErrorCode } from "../exceptions/root.js";
import { SignInSchema, SignUpSchema } from "../schema/users.js";
import { NotFoundException } from "../exceptions/not-found.js";
import sendSuccess from "../utils/response.js";
import sendResponse from "../utils/response.js";

export const signUpController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  SignUpSchema.parse(req.body);
  const { email, password, name } = req.body;

  // if (!email || !password || !name) {
  //   throw Error("All fields are required");
  // }

  let user = await prismaClient.user.findFirst({
    where: {
      email: email,
    },
  });

  if (user) {
    throw new BadRequestException(
      "User already exists!",
      ErrorCode.USER_ALREADY_EXISTS
    );
  }

  user = await prismaClient.user.create({
    data: {
      email,
      password: hashSync(password, 10),
      name,
    },
  });

  // res.send(user);
  sendResponse(res, 201, "User created successfully", user as any);

  // try {

  // } catch (err: any) {
  //   next(new UnprocessableEntity(err?.issues, 'Unprocessable Entity', ErrorCode.UNPROCESSABLE_ENTITY));
  // }
};

export const loginController = async (req: Request, res: Response) => {
  SignInSchema.parse(req.body);

  const { email, password } = req.body;

  if (!email || !password) {
    throw Error("All fields are required");
  }

  const user = await prismaClient.user.findFirst({
    where: {
      email: email,
    },
  });

  if (!user) {
    throw new NotFoundException("Akun belum terdaftar.", ErrorCode.USER_NOT_FOUND);
  }

  if (!compareSync(password, user.password)) {
    throw new BadRequestException(
      "Password tidak sesuai.",
      ErrorCode.INCORRECT_PASSWORD
    );
  }

  // const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1h" }); // bisa menambahkan data lainya yang ingin di generate
   const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "30m" });
  const { password: _, ...userWithoutPassword } = user;

  // res.send({ user: userWithoutPassword, token });

  sendSuccess(res, 200, "User Login Successfully", {token} as any);
};

// /me -> return the logged in user
export const meController = async (req: Request, res: Response) => {
  res.send(req.user);
};

// Logout controller - Add token to blacklist
export const logoutController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extract token from header
    const authorizationHeader = req.headers.authorization;
    const token = authorizationHeader && authorizationHeader.split(" ")[1];

    if (!token) {
      throw new BadRequestException(
        "No token provided",
        ErrorCode.UNAUTHORIZED
      );
    }

    // Decode token to get expiry time
    const decoded = jwt.decode(token) as any;

    if (!decoded || !decoded.exp) {
      throw new BadRequestException(
        "Invalid token",
        ErrorCode.UNAUTHORIZED
      );
    }

    // Add token to blacklist
    await prismaClient.tokenBlacklist.create({
      data: {
        token: token,
        userId: req.user!.id,
        expiresAt: new Date(decoded.exp * 1000), // Convert Unix timestamp to Date
      },
    });

    sendResponse(res, 200, "Logout successful", null as any);
  } catch (error) {
    next(error);
  }
};
