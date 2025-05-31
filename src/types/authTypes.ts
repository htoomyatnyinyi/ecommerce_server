/**
 * Model User
 */
// export type User = {
//   id: string;
//   username: string;
//   email: string;
//   password: string;
//   role: Role;
//   createdAt: Date;
//   updatedAt: Date;
// };

// export interface UserRequest {
//   username: string;
//   email: string;
//   password: string;
//   confirmPassword: string;
//   role: Role;
// }

// req: Request<{}, {}, RegisterFormBody>,

export enum Role {
  ADMIN = "ADMIN",
  USER = "USER",
}
export interface UserSignInRequest {
  email: string;
  password: string;
}

export interface UserSignUpRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  // role: "ADMIN" | "USER";
  role: Role;
}

// export interface AuthMeResponse {
//   id: string;
//   email: string;
//   role: Role;
//   iat: number;
//   exp: number;
// }
export interface AuthMe {
  id: string;
  email: string;
  role: Role;
  iat: number;
  exp: number;
}
