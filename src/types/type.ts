export interface User {
  id: string;
  username: string;
  email: string;
  role: "ADMIN" | "USER" | "EMPLOYER";
}

export interface Product {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Variant {
  id: string;
  sku: string;
  color: string;
  size: string;
  price: number;
  discountPrice?: number;
  stock?: number;
  productId: string;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
}

export interface CartItem {
  id: string;
  quantity: number;
  cartId: string;
  productId: string;
  product: Product;
  variantId: string;
  variant: Variant;
}

export interface Address {
  id: string;
  userId: string;
  street: string;
  city: string;
  state?: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  userId: string;
  totalPrice: number;
  status:
    | "PENDING"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED"
    | "RETURNED";
  shippingAddressId?: string;
  billingAddressId?: string;
  paymentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId: string;
  quantity: number;
  price: number;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  paymentMethod:
    | "CREDIT_CARD"
    | "DEBIT_CARD"
    | "PAYPAL"
    | "BANK_TRANSFER"
    | "CASH_ON_DELIVERY";
  paymentStatus: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
  transactionId?: string;
}
