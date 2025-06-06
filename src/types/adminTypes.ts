export interface createAccountType {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role?: "ADMIN" | "EMPLOYER" | "USER";
}
