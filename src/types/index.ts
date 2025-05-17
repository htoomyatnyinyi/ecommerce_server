import { Request } from "express";

export interface UserRequestBody {
  email: string;
  password: string;
  name?: string;
}

export interface ProductRequestBody {
  name: string;
  description?: string;
  price: number;
  stock: number;
}

export interface CustomRequest extends Request {
  body: UserRequestBody | ProductRequestBody;
}
