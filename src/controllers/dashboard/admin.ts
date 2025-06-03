import { Request, Response } from "express";

const createAccount = async (req: Request, res: Response): Promise<any> => {
  const userId = req.user?.id; // const {id} = req.user

  console.log(userId, "middleware");

  try {
    res.status(201).json({ mesg: "success" });
  } catch (error) {}
};

const getAccount = async (req: Request, res: Response): Promise<any> => {
  const userId = req.user?.id; // const {id} = req.user

  console.log(userId, "middleware");

  try {
    res.status(201).json({ mesg: "success" });
  } catch (error) {}
};

const updateAccount = async (req: Request, res: Response): Promise<any> => {
  const userId = req.user?.id; // const {id} = req.user

  console.log(userId, "middleware");

  try {
    res.status(201).json({ mesg: "success" });
  } catch (error) {}
};

const deleteAccount = async (req: Request, res: Response): Promise<any> => {
  const userId = req.user?.id; // const {id} = req.user

  console.log(userId, "middleware");

  try {
    res.status(201).json({ mesg: "success" });
  } catch (error) {}
};

const createProduct = async (req: Request, res: Response): Promise<any> => {
  const userId = req.user?.id; // const {id} = req.user

  console.log(userId, "middleware");

  try {
    res.status(201).json({ mesg: "success" });
  } catch (error) {}
};
const getProducts = async (req: Request, res: Response): Promise<any> => {
  const userId = req.user?.id; // const {id} = req.user

  console.log(userId, "middleware");

  try {
    res.status(201).json({ mesg: "success" });
  } catch (error) {}
};

const getProductById = async (req: Request, res: Response): Promise<any> => {
  const userId = req.user?.id; // const {id} = req.user

  console.log(userId, "middleware");

  try {
    res.status(201).json({ mesg: "success" });
  } catch (error) {}
};

const updateProduct = async (req: Request, res: Response): Promise<any> => {
  const userId = req.user?.id; // const {id} = req.user

  console.log(userId, "middleware");

  try {
    res.status(201).json({ mesg: "success" });
  } catch (error) {}
};

const deleteProduct = async (req: Request, res: Response): Promise<any> => {
  const userId = req.user?.id; // const {id} = req.user

  console.log(userId, "middleware");

  try {
    res.status(201).json({ mesg: "success" });
  } catch (error) {}
};

const getCart = async (req: Request, res: Response): Promise<any> => {
  const userId = req.user?.id; // const {id} = req.user

  console.log(userId, "middleware");

  try {
    res.status(201).json({ mesg: "success" });
  } catch (error) {}
};

const updateCart = async (req: Request, res: Response): Promise<any> => {
  const userId = req.user?.id; // const {id} = req.user

  console.log(userId, "middleware");

  try {
    res.status(201).json({ mesg: "success" });
  } catch (error) {}
};

const deleteCart = async (req: Request, res: Response): Promise<any> => {
  const userId = req.user?.id; // const {id} = req.user

  console.log(userId, "middleware");

  try {
    res.status(201).json({ mesg: "success" });
  } catch (error) {}
};

const getOrder = async (req: Request, res: Response): Promise<any> => {
  const userId = req.user?.id; // const {id} = req.user

  console.log(userId, "middleware");

  try {
    res.status(201).json({ mesg: "success" });
  } catch (error) {}
};

const updateOrder = async (req: Request, res: Response): Promise<any> => {
  const userId = req.user?.id; // const {id} = req.user

  console.log(userId, "middleware");

  try {
    res.status(201).json({ mesg: "success" });
  } catch (error) {}
};

const deleteOrder = async (req: Request, res: Response): Promise<any> => {
  const userId = req.user?.id; // const {id} = req.user

  console.log(userId, "middleware");

  try {
    res.status(201).json({ mesg: "success" });
  } catch (error) {}
};

export {
  createAccount,
  getAccount,
  updateAccount,
  deleteAccount,
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getCart,
  updateCart,
  deleteCart,
  getOrder,
  updateOrder,
  deleteOrder,
};
