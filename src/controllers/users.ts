import type { Request, Response } from "express";
import { AddressSchema, UpdateUserSchema } from "../schema/users.js";
import { NotFoundException } from "../exceptions/not-found.js";
import { ErrorCode } from "../exceptions/root.js";
import { prismaClient } from "../index.js";
import type { Address, User } from "../generated/prisma/client.js";
import sendSuccess from "../utils/response.js";
import { BadRequestException } from "../exceptions/bad-request.js";

export const createAddressController = async (req: Request, res: Response) => {
  AddressSchema.parse(req.body);

  const address = await prismaClient.address.create({
    data: {
      ...req.body,
      userId: req.user.id,
    },
  });

  sendSuccess(res, 201, "Address created successfully", address as any);
};

export const updateAddressController = async (req: Request, res: Response) => {
  try {
    const address = await prismaClient.address.update({
      where: {
        id: parseInt(req.params.id!),
        userId: req.user.id, // Only allow update if address belongs to current user
      },
      data: {
        ...req.body,
      },
    });

    sendSuccess(res, 200, "Address updated successfully", address as any);
  } catch (errr) {
    throw new NotFoundException(
      "Address not found",
      ErrorCode.ADDRESS_NOT_FOUND
    );
  }
};

export const deleteAddressController = async (req: Request, res: Response) => {
  try {
    await prismaClient.address.delete({
      where: {
        id: parseInt(req.params.id!),
        userId: req.user.id, // Only allow delete if address belongs to current user
      },
    });

    sendSuccess(res, 200, "Address deleted successfully");
  } catch (err) {
    throw new NotFoundException(
      "Address not found",
      ErrorCode.ADDRESS_NOT_FOUND
    );
  }
};

export const listAddressController = async (req: Request, res: Response) => {
  const addresses = await prismaClient.address.findMany({
    where: {
      userId: req.user.id, // Only show addresses belonging to current user
    },
  });

  sendSuccess(res, 200, "Addresses fetched successfully", addresses as any);
};

export const updateUserController = async (req: Request, res: Response) => {
  const validateData = UpdateUserSchema.parse(req.body);
  let shippingAddress: Address;
  let billingAddress: Address;
  if (validateData.defaultShippingAddress) {
    try {
      shippingAddress = await prismaClient.address.findFirstOrThrow({
        where: {
          id: Number(validateData.defaultShippingAddress),
        },
      });
    } catch (err) {
      throw new NotFoundException(
        "Address not found",
        ErrorCode.ADDRESS_NOT_FOUND
      );
    }

    if (shippingAddress.userId != req.user.id) {
      throw new BadRequestException(
        "Address does not belong to user",
        ErrorCode.ADDRESS_DOES_NOT_BELONG
      );
    }
  }

  if (validateData.defaultBillingAddress) {
    try {
      billingAddress = await prismaClient.address.findFirstOrThrow({
        where: {
          id: Number(validateData.defaultBillingAddress),
        },
      });
    } catch (err) {
      throw new NotFoundException(
        "Address not found",
        ErrorCode.ADDRESS_NOT_FOUND
      );
    }

    if (billingAddress.userId != req.user.id) {
      throw new BadRequestException(
        "Address does not belong to user",
        ErrorCode.ADDRESS_DOES_NOT_BELONG
      );
    }
  }

  const updateUser = await prismaClient.user.update({
    where: {
      id: req.user.id,
    },
    data: validateData as any,
  });

  sendSuccess(res, 200, "Update user successfully", updateUser as any);
};

export const listUsersController = async (req: Request, res: Response) => {
  const users = await prismaClient.user.findMany({
    skip: Number(req.query.skip || 0),
    take: 5,
  });

  sendSuccess(res, 200, "Fetch all user successfully", users as any);
};

export const getUserbyIdController = async (req: Request, res: Response) => {
   console.log('User Id ===== ', Number(req.params.id))
  try {
   

    const user = await prismaClient.user.findFirstOrThrow({
      where: {
        id: Number(req.params.id),
      },
      include: {
        addresses: true,
      },
    });

    sendSuccess(res, 200, "Fetch user succesfully", user as any);
  } catch (err) {
    throw new NotFoundException("User not found", ErrorCode.USER_NOT_FOUND);
  }
};

export const changeUserRoleController = async (req: Request, res: Response) => {
  try {
    const user = await prismaClient.user.update({
      where: {
        id: Number(req.params.id),
      },
      data: {
        role: req.body.role,
      },
    });

    sendSuccess(res, 200, "Change role user successfully", user as any);
  } catch (err) {
    throw new NotFoundException("User not found", ErrorCode.USER_NOT_FOUND);
  }
};
