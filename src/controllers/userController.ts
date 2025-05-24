import { Request, Response } from "express";
import prisma from "../config/database";
import { UserRequestBody } from "../types";

export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, password, username } = req.body as UserRequestBody;
    console.log(email, password);
    const user = await prisma.user.create({
      data: { email, password, username },
    });
    res.status(201).json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

// import { Request, Response } from "express";
// import prisma from "../config/database";
// import { UserRequestBody } from "../types";

// export const createUser = async (req: Request, res: Response) => {
//   try {
//     const { email, password, username } = req.body as UserRequestBody;
//     console.log(email, password);
//     const user = await prisma.user.create({
//       data: { email, password, username },
//     });
//     res.status(201).json(user);
//   } catch (error: any) {
//     res.status(400).json({ error: error.message });
//   }
// };

// export const getUsers = async (req: Request, res: Response) => {
//   try {
//     const users = await prisma.user.findMany();
//     res.json(users);
//   } catch (error: any) {
//     res.status(400).json({ error: error.message });
//   }
// };
