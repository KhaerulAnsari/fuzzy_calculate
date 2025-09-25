import type { Response, Request } from "express";
import { prismaClient } from "../index.js";
import sendSuccess from "../utils/response.js";
import { NotFoundException } from "../exceptions/not-found.js";
import { ErrorCode } from "../exceptions/root.js";

export const createOrderController = async (req: Request, res: Response) => {
  // 1. to create a transaction
  // 2. to list all the cart items and proceed if cart is not empty
  // 3. calculate the total amount
  // 4. fetch address of user
  // 5. to define computed field for formatter address on address module
  // 6. we wel create a order and order produtsorder products
  // 7. create event
  // 8. to the empty cart

  return await prismaClient.$transaction(async (tx) => {
    const cartItems = await tx.cartItem.findMany({
      where: {
        userId: req.user.id,
      },
      include: {
        product: true,
      },
    });

    if (cartItems.length == 0) {
      return res.send({ message: "Cart is empty" });
    }

    const price = cartItems.reduce((prev, current) => {
      return prev + current.quantity * +current.product.price;
    }, 0);

    const address = await tx.address.findFirst({
      where: {
        id: req.user.defaultShippingAddress, // shipping address untuk alamat tujuan
      },
    });

    const order = await tx.order.create({
      data: {
        userId: req.user.id,
        netAmount: price,
        address: String(address?.formattedAddress),
        products: {
          create: cartItems.map((cart) => {
            return {
              productId: cart.productId,
              quantity: cart.quantity,
            };
          }),
        },
      },
    });

    const orderEvent = await tx.orderEvents.create({
      data: {
        orderId: order.id,
      },
    });

    await tx.cartItem.deleteMany({
      where: {
        userId: req.user.id,
      },
    });

    sendSuccess(res, 201, "Create orders successfully", order as any);
  });
};
export const listOrdersController = async (req: Request, res: Response) => {
  const orders = await prismaClient.order.findMany({
    where: {
      userId: req.user.id,
    },
  });

  sendSuccess(res, 200, "Fatch all orders succesfully", orders as any);
};
export const cancelOrderController = async (req: Request, res: Response) => {
  try {
    const order = await prismaClient.order.update({
      where: {
        id: Number(req.params.id),
      },
      data: {
        status: "CANCELLED",
      },
    });

    await prismaClient.orderEvents.create({
      data: {
        orderId: order.id,
        status: "CANCELLED",
      },
    });

    sendSuccess(res, 200, "Cancelled order successfully", order as any);
  } catch (err) {
    throw new NotFoundException("Order not found", ErrorCode.ORDER_NOT_FOUND);
  }
};
export const getOrderByIdController = async (req: Request, res: Response) => {
  try {
    const order = await prismaClient.order.findFirstOrThrow({
      where: {
        id: Number(req.params.id),
      },
      include: {
        products: true,
        events: true,
      },
    });

    sendSuccess(res, 200, "Fetch order successfully", order as any);
  } catch (err) {
    throw new NotFoundException("Order not found", ErrorCode.ORDER_NOT_FOUND);
  }
};

// FOR ADMIN
export const listAllOrdersController = async (req: Request, res: Response) => {
  let whereClause = {};

  const status = req.query.status;

  if (status) {
    whereClause = {
      status,
    };
  }

  const order = await prismaClient.order.findMany({
    where: whereClause,
    skip: Number(req.query.skip || 0),
    take: 5,
  });

  sendSuccess(res, 200, "Fetch list all orders successfully", order as any);
};

export const changeStatusController = async (req: Request, res: Response) => {
  try {
    const order = await prismaClient.order.update({
      where: {
        id: Number(req.params.id),
      },
      data: {
        status: req.body.status,
      },
    });

    await prismaClient.orderEvents.create({
      data: {
        orderId: order.id,
        status: req.body.status,
      },
    });

    sendSuccess(res, 200, "Update status order succesffully", order as any);
  } catch (err) {
    throw new NotFoundException("Order not found", ErrorCode.ORDER_NOT_FOUND);
  }
};

export const listUserOrdersController = async (req: Request, res: Response) => {
  console.log('iddddd ====== ', req.params.id)

  let whereClause: any = {
    userId: req.params.id,
  };

   console.log('whereClause ====== ', whereClause)

  const status = req.params.status;

  if (status) {
    whereClause = {
      ...whereClause,
      status,
    };
  }

  const order = await prismaClient.order.findMany({
    where: whereClause,
    skip: Number(req.query.skip || 0),
    take: 5,
  });

  console.log('order === ', order)

  sendSuccess(
    res,
    200,
    "Fetch list user order controller successfully",
    order as any
  );
};
