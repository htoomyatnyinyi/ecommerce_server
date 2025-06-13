import { Request, Response } from "express";

import prisma from "../config/database";

export const createCategory = async (
  req: Request,
  res: Response
): Promise<any> => {
  const userId = req.user?.id;
  if (!userId) {
    return res
      .status(401)
      .json({ message: "Unauthorized: User not authenticated" });
  }
  console.log(req.body, "at category");
  const { categoryName } = req.body;
  const { name } = req.body;

  try {
    const categoryResponse = await prisma.category.create({
      // data: {
      //   categoryName
      // },
      data: {
        categoryName: name,
      },
    });
    res.status(201).json(categoryResponse);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: "Failed create category ",
      error: process.env.NODE_ENV === "dewwwvelopment" ? error : undefined,
    });
  }
};

export const getCategory = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const categoryResponse = await prisma.category.findMany();
    res.status(200).json(categoryResponse);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch category",
      error: process.env.NODE_ENV === "dewwwvelopment" ? error : undefined,
    });
  }
};

// export const createCategory = async (
//   req: Request,
//   res: Response
// ): Promise<any> => {
//   try {
//   } catch (error) {
//     console.error(error);
//   }
// };
