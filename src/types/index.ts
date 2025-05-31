// // v2

// export enum UserRole {
//   ADMIN = "ADMIN",
//   EMPLOYER = "EMPLOYER",
//   USER = "USER",
// }

// // User Interfaces
// export interface User {
//   id: string;
//   email: string;
//   password: string;
//   username?: string;
//   role?: UserRole;
//   createdAt?: Date;
//   updatedAt?: Date;
// }

// export interface CreateUserRequest {
//   email: string;
//   password: string;
//   username?: string;
//   role?: UserRole;
// }

// export interface UpdateUserRequest {
//   email?: string;
//   password?: string;
//   username?: string;
//   role?: UserRole;
// }

// // Product Interfaces
// export interface Product {
//   id: string;
//   title: string;
//   description: string;
//   userId: string;
//   categoryId?: string;
//   brandId?: string;
//   createdAt?: Date;
//   updatedAt?: Date;
//   variants: ProductVariant[];
//   images?: ProductImage[];
// }

// export interface CreateProductRequest {
//   title: string;
//   description: string;
//   userId: string;
//   categoryId?: string;
//   brandId?: string;
//   variants: CreateProductVariantRequest[];
//   images?: CreateProductImageRequest[];
// }

// export interface UpdateProductRequest {
//   title?: string;
//   description?: string;
//   categoryId?: string;
//   brandId?: string;
// }

// // Variant Interfaces
// export interface ProductVariant {
//   id: string;
//   sku: string;
//   price: number;
//   stock: number;
//   productId: string;
//   createdAt?: Date;
//   updatedAt?: Date;
//   options: VariantOption[];
// }

// export interface CreateProductVariantRequest {
//   sku: string;
//   price: number;
//   stock: number;
//   options: CreateVariantOptionRequest[];
// }

// // Variant Option Interfaces
// export interface VariantOption {
//   id: string;
//   attributeName: string;
//   attributeValue: string;
//   variantId: string;
// }

// export interface CreateVariantOptionRequest {
//   attributeName: string;
//   attributeValue: string;
// }

// // Image Interfaces
// export interface ProductImage {
//   id: string;
//   url: string;
//   altText: string;
//   isPrimary: boolean;
//   productId: string;
//   createdAt?: Date;
//   updatedAt?: Date;
// }

// export interface CreateProductImageRequest {
//   url: string;
//   altText: string;
//   isPrimary?: boolean;
// }

// // Category Interfaces
// export interface ProductCategory {
//   id: string;
//   name: string;
// }

// // Brand Interfaces
// export interface ProductBrand {
//   id: string;
//   name: string;
// }
// // v1
// // import { Request } from "express";

// // export interface UserRequestBody {
// //   id: string;
// //   email: string;
// //   password: string;
// //   username?: string;
// //   createdAt?: string;
// //   updatedAt?: string;
// // }

// // export interface ProductRequestBody {
// //   id: string;
// //   title: string;
// //   description: string;
// //   variants: Variant[];
// //   createdAt?: string;
// //   updatedAt?: string;
// // }

// // export interface ProductCategory extends Category {
// //   categoryName: string;
// // }
// // export interface ProductCategory extends Brand {
// //   brandName: string;
// // }

// // export interface Variant {
// //   id: number;
// //   sku: string;
// //   price: number;
// //   stock: number;
// //   createdAt?: string;
// //   updatedAt?: string;
// //   variantOptions: VariantOption[];
// // }

// // export interface VariantOption {
// //   id: string;
// //   attributeName: string;
// //   attributeValue: string;
// // }

// // export interface Image {
// //   id: string;
// //   url: string;
// //   altText: string;
// //   isPrimary: boolean;
// // }

// // /// end
// // export interface StockRequstBody {
// //   category: any;
// //   count: number;
// // }

// // export interface CustomRequest extends Request {
// //   body: UserRequestBody | ProductRequestBody;
// // }
