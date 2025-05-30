import { Request, Response } from "express";
import prisma from "../config/database";
import { CartRequest } from "../types/productTypes";

const addToCart = async (
  // req: Request<{}, {}, CartRequest>,
  req: Request,
  res: Response
): Promise<any> => {
  //
  if (!req.user || !req.user.id) {
    return res
      .status(401)
      .json({ error: "Unauthorized: User not authenticated." });
  }
  const userId = req.user.id;
  // console.log(userId, "middleware", req.body);

  const { items } = req.body; // assuming items is sent in the request body

  const cart = await prisma.cart.create({
    data: {
      userId: userId,
      items: {
        create: items, // items should be an array of item objects
      },
    },
  });
  // const {} = req.body;
};

const getCart = async (req: Request, res: Response): Promise<any> => {
  res.send("Hi");
};

export { addToCart, getCart };
