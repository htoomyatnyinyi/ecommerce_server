import { Request, Response } from "express";
import prisma from "../config/database";
import { ProductRequestBody } from "../types";

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { title, description, price, stockId, userId } =
      req.body as ProductRequestBody;
    console.log(req.body);
    const product = await prisma.product.create({
      data: { title, description, price, stockId, userId },
    });
    res.status(201).json(product);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

// import { Request, Response } from "express";
// import prisma from "../config/database";
// import { ProductRequestBody } from "../types";

// export const createProduct = async (req: Request, res: Response) => {
//   try {
//     const { title, description, price, stockId, userId, category } =
//       req.body as ProductRequestBody;
//     console.log(req.body);
//     const product = await prisma.product.create({
//       data: {
//         title,
//         description,
//         price,
//         stockId,
//         userId,
//         // category: category as prisma.Prisma.Category, // cast to enum type
//         category: category as prisma.Prisma.Category,
//       },
//     });
//     res.status(201).json(product);
//   } catch (error: any) {
//     res.status(400).json({ error: error.message });
//   }
// };

// export const createProduct = async (req: Request, res: Response) => {
//   const { title, description, price, stockId, userId } =
//     req.body as ProductRequestBody;

//   // Optional: validate inputs
//   if (!title || !price || !userId) {
//     return res.status(400).json({ error: "Missing required fields" });
//   }

//   // Ensure the stockId exists (if provided)
//   if (stockId) {
//     const stock = await prisma.stock.findUnique({ where: { id: stockId } });
//     if (!stock) {
//       return res
//         .status(400)
//         .json({ error: "Invalid stockId. Stock not found." });
//     }
//   }

//   try {
//     const product = await prisma.product.create({
//       data: {
//         title,
//         description,
//         price,
//         stockId,
//         userId,
//       },
//     });

//     res.status(201).json(product);
//   } catch (error) {
//     res
//       .status(500)
//       .json({ error: "Failed to create product", details: error.message });
//   }
// };

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

// app.post("/products", async (req, res) => {
//   const {
//     title,
//     description,
//     price,
//     inStock = true,
//     category,
//     userId,
//     stockId,
//   } = req.body;
//   try {
//     if (stockId) {
//       const stock = await prisma.stock.findUnique({
//         where: { id: parseInt(stockId) },
//       });
//       if (!stock) {
//         return res.status(400).json({ error: "Stock not found" });
//       }
//     }

//     const product = await prisma.product.create({
//       data: {
//         title,
//         description,
//         price,
//         inStock,
//         category,
//         userId,
//         stockId: stockId ? parseInt(stockId) : null,
//       },
//     });

//     // Increment stock count if product is in stock and linked to a stock
//     if (inStock && stockId) {
//       await prisma.stock.update({
//         where: { id: parseInt(stockId) },
//         data: { count: { increment: 1 } },
//       });
//     }

//     res.status(201).json(product);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to create product" });
//   }
// });

// app.put("/products/:id", async (req, res) => {
//   const { id } = req.params;
//   const { title, description, price, inStock, category, userId, stockId } =
//     req.body;
//   try {
//     const existingProduct = await prisma.product.findUnique({
//       where: { id: parseInt(id) },
//     });
//     if (!existingProduct) {
//       return res.status(404).json({ error: "Product not found" });
//     }

//     if (stockId) {
//       const stock = await prisma.stock.findUnique({
//         where: { id: parseInt(stockId) },
//       });
//       if (!stock) {
//         return res.status(400).json({ error: "Stock not found" });
//       }
//     }

//     // Update product
//     const product = await prisma.product.update({
//       where: { id: parseInt(id) },
//       data: {
//         title,
//         description,
//         price,
//         inStock,
//         category,
//         userId,
//         stockId: stockId ? parseInt(stockId) : null,
//       },
//     });

//     // Adjust stock count
//     if (
//       existingProduct.stockId &&
//       existingProduct.inStock &&
//       (!inStock || stockId !== existingProduct.stockId)
//     ) {
//       // Decrement old stock count if product was in stock and is now out of stock or moved to a different stock
//       await prisma.stock.update({
//         where: { id: existingProduct.stockId },
//         data: { count: { decrement: 1 } },
//       });
//     }
//     if (
//       inStock &&
//       stockId &&
//       (!existingProduct.inStock || stockId !== existingProduct.stockId)
//     ) {
//       // Increment new stock count if product is now in stock or moved to a new stock
//       await prisma.stock.update({
//         where: { id: parseInt(stockId) },
//         data: { count: { increment: 1 } },
//       });
//     }

//     res.json(product);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to update product" });
//   }
// });

// app.delete("/products/:id", async (req, res) => {
//   const { id } = req.params;
//   try {
//     const product = await prisma.product.findUnique({
//       where: { id: parseInt(id) },
//     });
//     if (!product) {
//       return res.status(404).json({ error: "Product not found" });
//     }

//     if (product.inStock && product.stockId) {
//       await prisma.stock.update({
//         where: { id: product.stockId },
//         data: { count: { decrement: 1 } },
//       });
//     }

//     await prisma.product.delete({
//       where: { id: parseInt(id) },
//     });
//     res.status(204).send();
//   } catch (error) {
//     res.status(500).json({ error: "Failed to delete product" });
//   }
// });
// // old design
// // import { Request, Response } from "express";
// // import prisma from "../config/database";
// // import { ProductRequestBody } from "../types";

// // export const createProduct = async (req: Request, res: Response) => {
// //   try {
// //     const { title, description, price } = req.body as ProductRequestBody;
// //     console.log(req.body);
// //     const product = await prisma.product.create({
// //       data: { title, description, price },
// //     });
// //     res.status(201).json(product);
// //   } catch (error: any) {
// //     res.status(400).json({ error: error.message });
// //   }
// // };

// // export const getProducts = async (req: Request, res: Response) => {
// //   try {
// //     const products = await prisma.product.findMany();
// //     res.json(products);
// //   } catch (error: any) {
// //     res.status(400).json({ error: error.message });
// //   }
// // };

// // export const getProductById = async (req: Request, res: Response) => {
// //   try {
// //     const { id } = req.params;
// //     const product = await prisma.product.findUnique({
// //       where: { id: parseInt(id) },
// //     });
// //     if (!product) {
// //       return res.status(404).json({ error: "Product not found" });
// //     }
// //     res.json(product);
// //   } catch (error: any) {
// //     res.status(400).json({ error: error.message });
// //   }
// // };
