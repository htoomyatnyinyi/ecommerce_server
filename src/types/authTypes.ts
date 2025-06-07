export enum Role {
  ADMIN = "ADMIN",
  EMPLOYER = "EMPLOYER",
  USER = "USER",
}
export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  // role: "ADMIN" | "USER";
  role: Role;
  isEmailVerified: boolean;
}

export interface AuthMeResponse {
  id: string;
  email: string;
  role: Role;
  iat: number;
  exp: number;
}
export interface AuthMe {
  // request
  id: string;
  email: string;
  role: Role;
  iat: number;
  exp: number;
}
