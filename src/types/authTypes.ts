export enum Role {
  ADMIN = "ADMIN",
  USER = "USER",
}

/**
 * Model User
 */
export type User = {
  id: string;
  username: string;
  email: string;
  password: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
};

export interface UserRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: Role;
}

// req: Request<{}, {}, RegisterFormBody>,
export interface UserSignInRequest {
  email: string;
  password: string;
}
