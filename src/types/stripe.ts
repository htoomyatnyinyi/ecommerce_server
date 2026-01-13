import { Request } from "express";
import Stripe from "stripe";

export interface CheckoutItem {
  productId: string;
  variantId: string;
  quantity: number;
  price: number;
}

export interface CreatePaymentIntentRequest {
  items: CheckoutItem[];
  shippingAddressId?: string;
  billingAddressId?: string;
}

export interface ConfirmPaymentRequest {
  paymentIntentId: string;
  shippingAddressId?: string;
  billingAddressId?: string;
}

export interface StripeWebhookRequest extends Request {
  rawBody?: Buffer;
}

export interface CustomerData {
  email: string;
  name?: string;
  phone?: string;
  metadata?: {
    userId: string;
  };
}

export interface PaymentIntentMetadata {
  userId: string;
  shippingAddressId?: string;
  billingAddressId?: string;
  cartItemIds: string;
}
