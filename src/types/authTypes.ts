export interface UserRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "ADMIN" | "USER";
}

// req: Request<{}, {}, RegisterFormBody>,
export interface UserSignInRequest {
  email: string;
  password: string;
}
