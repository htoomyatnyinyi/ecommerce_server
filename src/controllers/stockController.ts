import { Request, Response } from "express";
import prisma from "../config/database";
import { StockRequstBody } from "../types";

// export const createStock = async (req: Request, res: Response) => {
//   try {
//     const { category, count = 0 } = req.body as StockRequstBody;
//     const validCategories: string[] = [
//       "MacBookAir",
//       "MacBookPro",
//       "iPhone",
//       "iPad",
//       "AirPods",
//       "AppleWatchMini",
//       "AppleWatchPro",
//       "AppleWatchUltra",
//     ];
//     if (!validCategories.includes(category)) {
//       return res.status(400).json({ error: "Invalid Category" });
//     }
//     if (typeof count !== "number" || count < 0) {
//       return res
//         .status(400)
//         .json({ error: "Count must be a non-negative number" });
//     }
//     const stock = await prisma.stock.create({
//       data: { category: category as any, count },
//     });
//     res.status(201).json(stock);
//   } catch (error: any) {
//     res.status(400).json({ error: error.message });
//   }
// };
export const createStock = async (req: Request, res: Response) => {
  try {
    const { category, count = 0 } = req.body as StockRequstBody;

    const stock = await prisma.stock.create({
      data: { category: category as any, count },
    });
    res.status(201).json(stock);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getStocks = async (req: Request, res: Response) => {
  try {
    const stocks = await prisma.stock.findMany();
    res.status(200).json(stocks);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

// router.post("/stocks", async (req, res) => {
//   const { category, count = 0 } = req.body;
//   try {
//     const validCategories = [
//       "MacBookAir",
//       "MacBookPro",
//       "iPhone",
//       "iPad",
//       "AirPods",
//       "AppleWatchMini",
//       "AppleWatchPro",
//       "AppleWatchUltra",
//     ];
//     if (!validCategories.includes(category)) {
//       return res.status(400).json({ error: "Invalid category" });
//     }
//     if (typeof count !== "number" || count < 0) {
//       return res
//         .status(400)
//         .json({ error: "Count must be a non-negative number" });
//     }

//     const stock = await prisma.stock.create({
//       data: { category, count },
//     });
//     res.status(201).json(stock);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to create stock" });
//   }
// });

// router.put("/stocks/:id", async (req, res) => {
//   const { id } = req.params;
//   const { category, count } = req.body;
//   try {
//     const validCategories = [
//       "MacBookAir",
//       "MacBookPro",
//       "iPhone",
//       "iPad",
//       "AirPods",
//       "AppleWatchMini",
//       "AppleWatchPro",
//       "AppleWatchUltra",
//     ];
//     if (category && !validCategories.includes(category)) {
//       return res.status(400).json({ error: "Invalid category" });
//     }
//     if (count !== undefined && (typeof count !== "number" || count < 0)) {
//       return res
//         .status(400)
//         .json({ error: "Count must be a non-negative number" });
//     }

//     const stock = await prisma.stock.update({
//       where: { id: parseInt(id) },
//       data: { category, count },
//     });
//     res.json(stock);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to update stock" });
//   }
// });

// router.get("/stocks/:id/count", async (req, res) => {
//   const { id } = req.params;
//   try {
//     const stock = await prisma.stock.findUnique({
//       where: { id: parseInt(id) },
//       select: { count: true },
//     });
//     if (!stock) {
//       return res.status(404).json({ error: "Stock not found" });
//     }
//     res.json({ count: stock.count });
//   } catch (error) {
//     res.status(500).json({ error: "Failed to fetch stock count" });
//   }
// });

// export const getStockCountById = async (req: Request, res: Response) => {
//   try {
//     const stocks = await prisma.stock.findMany()
//   } catch (error: any) {
//     res.status(400).json({ error: error.message });
//   }
// };
