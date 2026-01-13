"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderStatus = exports.PaymentStatus = exports.PaymentMethod = exports.Role = void 0;
var Role;
(function (Role) {
    Role["ADMIN"] = "ADMIN";
    Role["USER"] = "USER";
    Role["SELLER"] = "SELLER";
})(Role || (exports.Role = Role = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CREDIT_CARD"] = "CREDIT_CARD";
    PaymentMethod["DEBIT_CARD"] = "DEBIT_CARD";
    PaymentMethod["PAYPAL"] = "PAYPAL";
    PaymentMethod["BANK_TRANSFER"] = "BANK_TRANSFER";
    PaymentMethod["CASH_ON_DELIVERY"] = "CASH_ON_DELIVERY";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "PENDING";
    PaymentStatus["COMPLETED"] = "COMPLETED";
    PaymentStatus["FAILED"] = "FAILED";
    PaymentStatus["REFUNDED"] = "REFUNDED";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "PENDING";
    OrderStatus["PROCESSING"] = "PROCESSING";
    OrderStatus["SHIPPED"] = "SHIPPED";
    OrderStatus["DELIVERED"] = "DELIVERED";
    OrderStatus["CANCELLED"] = "CANCELLED";
    OrderStatus["RETURNED"] = "RETURNED";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
// export enum Role {
//   ADMIN = "ADMIN",
//   USER = "USER",
//   SELLER = "SELLER",
// }
// export enum PaymentMethod {
//   CREDIT_CARD = "CREDIT_CARD",
//   DEBIT_CARD = "DEBIT_CARD",
//   PAYPAL = "PAYPAL",
//   BANK_TRANSFER = "BANK_TRANSFER",
//   CASH_ON_DELIVERY = "CASH_ON_DELIVERY",
// }
// export enum PaymentStatus {
//   PENDING = "PENDING",
//   COMPLETED = "COMPLETED",
//   FAILED = "FAILED",
//   REFUNDED = "REFUNDED",
// }
// export enum OrderStatus {
//   PENDING = "PENDING",
//   PROCESSING = "PROCESSING",
//   SHIPPED = "SHIPPED",
//   DELIVERED = "DELIVERED",
//   CANCELLED = "CANCELLED",
//   RETURNED = "RETURNED",
// }
// export interface ProductsQuery {
//   page?: string | number;
//   limit?: string | number;
//   search?: string;
//   category?: string;
//   brand?: string; // New: Filter by brand
//   minPrice?: string;
//   maxPrice?: string;
//   sortBy?: "price" | "createdAt" | "title" | "rating"; // New: Sort by rating
//   sortOrder?: "asc" | "desc";
// }
// export interface ProductRequest {
//   userId?: string;
//   title: string;
//   description: string;
//   variants: VariantRequest[];
//   images?: ImageRequest[];
//   categoryId: string;
//   brandIds?: string[]; // New: List of brand IDs
// }
// export interface VariantRequest {
//   sku: string;
//   price: number | string;
//   discountPrice?: number | string; // New: Support for discounts
//   stock: number | string;
//   variantOptions?: VariantOptionRequest[];
// }
// export interface VariantOptionRequest {
//   attributeName: string;
//   attributeValue: string;
// }
// export interface ImageRequest {
//   url: string;
//   altText: string;
//   isPrimary?: boolean;
// }
// export interface CartRequest {
//   userId: string;
//   items: CartItemRequest[];
// }
// export interface CartItemRequest {
//   productId: string;
//   variantId: string;
//   quantity: number;
// }
// export interface OrderRequest {
//   userId: string;
//   totalPrice: number;
//   status?: OrderStatus;
//   shippingAddressId?: string; // New
//   billingAddressId?: string; // New
//   payment: PaymentRequest; // New
//   items: OrderItemRequest[];
// }
// export interface OrderItemRequest {
//   productId: string;
//   variantId: string;
//   quantity: number;
//   price: number | string;
// }
// export interface AddressRequest {
//   userId: string;
//   street: string;
//   city: string;
//   state?: string;
//   country: string;
//   postalCode: string;
//   isDefault?: boolean;
// }
// export interface ReviewRequest {
//   userId: string;
//   productId: string;
//   rating: number; // 1-5
//   comment?: string;
// }
// export interface PaymentRequest {
//   amount: number | string;
//   paymentMethod: PaymentMethod;
//   transactionId?: string;
// }
// // export enum BrandName {
// //   NIKE = "NIKE",
// //   ADIDAS = "ADIDAS",
// //   PUMA = "PUMA",
// //   REEBOK = "REEBOK",
// //   UNDER_ARMOUR = "UNDER_ARMOUR",
// //   OTHER = "OTHER",
// // }
// // export enum CategoryName {
// //   SHOES = "SHOES",
// //   CLOTHING = "CLOTHING",
// //   ACCESSORIES = "ACCESSORIES",
// //   EQUIPMENT = "EQUIPMENT",
// //   ELECTRONICS = "ELECTRONICS",
// //   OTHER = "OTHER",
// // }
// // export enum OrderStatus {
// //   PENDING = "PENDING",
// //   PROCESSING = "PROCESSINGS", // Fixed typo in previous example, should be consistent
// //   SHIPPED = "SHIPPED",
// //   DELIVERED = "DELIVERED",
// //   CANCELLED = "CANCELLED",
// // }
// // export interface ProductsQuery {
// //   page?: string | number;
// //   limit?: string | number;
// //   search?: string;
// //   category?: string;
// //   minPrice?: string;
// //   maxPrice?: string;
// //   sortBy?: "price" | "createdAt" | "title";
// //   sortOrder?: "asc" | "desc";
// // }
// // // ##########################################
// // export interface ProductRequest {
// //   userId?: string; // may be from middleware
// //   title: string;
// //   description: string;
// //   variants: VariantRequest[];
// //   images?: ImageRequest[];
// //   cartItems?: CartItemRequest[];
// //   orderItems?: OrderItemRequest[];
// //   productBrands?: ProductBrandRequest[];
// //   categoryId?: CategoryName; // link
// // }
// // export interface ProductBrandRequest {
// //   productId?: string;
// //   brandId?: string;
// // }
// // export interface Brand {
// //   brandName: BrandName;
// // }
// // export interface Category {
// //   categoryName: CategoryName;
// // }
// // export interface VariantRequest {
// //   sku: string;
// //   price: number | string;
// //   stock: number | string;
// //   cartItems?: CartItemRequest[];
// //   orderItems?: OrderItemRequest[];
// //   variantOptions?: VariantOptionRequest[];
// // }
// // export interface VariantOptionRequest {
// //   attributeName: string;
// //   attributeValue: string;
// //   variantId?: string; // link
// // }
// // export interface ImageRequest {
// //   url: string;
// //   altText: string;
// //   isPrimary?: boolean;
// // }
// // export interface CartRequest {
// //   userId: string; // check later
// //   items?: CartItemRequest[];
// // }
// // export interface CartItemRequest {
// //   productId: string; //
// //   variantId: string; //
// //   quantity: number;
// // }
// // export interface OrderRequest {
// //   userId: string; //
// //   totalPrice: number;
// //   status?: string;
// //   items: OrderItemRequest[];
// // }
// // export interface OrderItemRequest {
// //   productId: string; //
// //   variantId: string; //
// //   quantity: number;
// //   price: string;
// // }
// // // export interface GetProductsQuery {
// // //   page?: string | number;
// // //   limit?: string | number;
// // //   search?: string;
// // //   category?: string;
// // //   minPrice?: string;
// // //   maxPrice?: string;
// // //   sortBy?: "price" | "createdAt" | "title";
// // //   sortOrder?: "asc" | "desc";
// // // }
// // // export interface CreateNewProductRequest {
// // //   title: string;
// // //   description: string;
// // //   brandName?: string | undefined;
// // //   categoryName?: string | undefined;
// // //   variants: VariantRequest[];
// // //   images?: ImageRequest[];
// // //   categoryId?: string;
// // //   brandId?: string;
// // // }
// // // export interface CategoryRequest {
// // //   categoryName: string;
// // // }
// // // export interface BrandRequest {
// // //   brandName: string;
// // // }
// // // export interface VariantRequest {
// // //   sku: string;
// // //   price: number | string;
// // //   stock: number | string;
// // //   variantOptions?: VariantOptionRequest[];
// // // }
// // // export interface VariantOptionRequest {
// // //   attributeName: string;
// // //   attributeValue: string;
// // // }
// // // export interface ImageRequest {
// // //   url: string;
// // //   altText: string;
// // //   isPrimary?: boolean;
// // // }
// // // export interface CartRequest {
// // //   userId: string; // check later
// // //   items?: CartItemRequest[];
// // // }
// // // export interface CartItemRequest {
// // //   productId: string; //
// // //   variantId: string; //
// // //   quantity: number;
// // // }
// // // export interface OrderRequest {
// // //   userId: string; //
// // //   totalPrice: number;
// // //   status?: string;
// // //   items: OrderItemRequest[];
// // // }
// // // export interface OrderItemRequest {
// // //   productId: string; //
// // //   variantId: string; //
// // //   quantity: number;
// // //   price: string;
// // // }
