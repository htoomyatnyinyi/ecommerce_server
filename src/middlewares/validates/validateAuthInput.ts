// Middleware to validate user input with zod
import { NextFunction, Request, Response } from "express";
import { auth_signin_schema, auth_signup_schema } from "../schemas/auth_schema";

const validateAuthSignInInput = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const validatedDaa = await auth_signin_schema.parseAsync(req.body);
    console.log(validatedDaa, "check with zod before pass to controller");

    req.body = validatedDaa;
    next();
  } catch (error: any) {
    res.status(400).json({ error: "Validation Failed", details: error.issues });
  }
};
const validateAuthSignUpInput = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const validatedDaa = await auth_signup_schema.parseAsync(req.body);
    console.log(validatedDaa, "check with zod before pass to controller");
    req.body = validatedDaa;
    next();
  } catch (error: any) {
    res.status(400).json({ error: "Validation Failed", details: error.issues });
  }
};

export { validateAuthSignUpInput, validateAuthSignInInput };
