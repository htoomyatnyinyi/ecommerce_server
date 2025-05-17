import { Request, Response } from "express";
import prisma from "../config/database";
import { ProductRequestBody } from "../types";

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, price, stock } = req.body as ProductRequestBody;
    console.log(req.body);
    const product = await prisma.product.create({
      data: { name, description, price, stock },
    });
    res.status(201).json(product);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
