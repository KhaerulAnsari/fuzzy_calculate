import type { NextFunction, Request, Response } from "express";
import { prismaClient } from "../index.js";
import { compareSync, hashSync } from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../secretes.js";
import { BadRequestException } from "../exceptions/bad-request.js";
import { ErrorCode } from "../exceptions/root.js";
import { SignUpSchema } from "../schema/users.js";
import { NotFoundException } from "../exceptions/not-found.js";

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
    new BadRequestException(
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

  res.send(user);

  // try {

  // } catch (err: any) {
  //   next(new UnprocessableEntity(err?.issues, 'Unprocessable Entity', ErrorCode.UNPROCESSABLE_ENTITY));
  // }
};

export const loginController = async (req: Request, res: Response) => {
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
    throw new NotFoundException("User not found", ErrorCode.USER_NOT_FOUND);
  }

  if (!compareSync(password, user.password)) {
    throw new BadRequestException(
      "Incorrect password",
      ErrorCode.INCORRECT_PASSWORD
    );
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1h" }); // bisa menambahkan data lainya yang ingin di generate

  const { password: _, ...userWithoutPassword } = user;

  res.send({ user: userWithoutPassword, token });
};

// /me -> return the logged in user 
export const meController = async (req: Request, res: Response) => {
  

  res.send(req.user);
};
