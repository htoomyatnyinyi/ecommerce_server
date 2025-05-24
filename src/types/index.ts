import { Request } from "express";

export interface UserRequestBody {
  email: string;
  password: string;
  username?: string;
}

export interface ProductRequestBody {
  title: string;
  description: string;
  price: number;
  stock: number;
  stockId: number;
  userId: number;
}

export interface StockRequstBody {
  category: any;
  count: number;
}

export interface CustomRequest extends Request {
  body: UserRequestBody | ProductRequestBody;
}
