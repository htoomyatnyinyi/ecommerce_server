# Stripe Checkout Integration - API Documentation

## 📋 Overview

This document provides complete API documentation for the Stripe checkout integration in the e-commerce server.

---

## 🔑 Setup Instructions

### 1. Install Dependencies

```bash
npm install stripe
```

### 2. Configure Environment Variables

Add the following to your `.env` file:

```env
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### 3. Get Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Copy your **Publishable Key** and **Secret Key**
3. Use **Test Mode** keys for development

### 4. Setup Stripe Webhook

1. Go to [Stripe Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Click **"Add endpoint"**
3. Set endpoint URL: `http://your-domain.com/api/checkout/webhook`
4. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Copy the **Signing Secret** to `STRIPE_WEBHOOK_SECRET`

---

## 🛒 Checkout Flow

```
1. User adds items to cart
   ↓
2. User clicks "Checkout"
   ↓
3. Frontend calls POST /api/checkout/create-payment-intent
   ↓
4. Backend creates Stripe PaymentIntent
   ↓
5. Frontend receives clientSecret
   ↓
6. Frontend displays Stripe Elements (card input)
   ↓
7. User enters payment details
   ↓
8. Stripe processes payment
   ↓
9. Frontend calls POST /api/checkout/confirm-payment
   ↓
10. Backend creates Order + Payment records
   ↓
11. Backend clears cart
   ↓
12. User receives order confirmation
```

---

## 📡 API Endpoints

### **1. Create Payment Intent**

Create a Stripe PaymentIntent for checkout.

**Endpoint:** `POST /api/checkout/create-payment-intent`  
**Authentication:** Required  
**Content-Type:** `application/json`

#### Request Body

```json
{
  "shippingAddressId": "address-uuid", // Optional
  "billingAddressId": "address-uuid" // Optional
}
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxxxxxxxxx",
  "amount": 99.99,
  "cartItems": [
    {
      "productId": "prod-uuid",
      "variantId": "variant-uuid",
      "title": "Product Name",
      "quantity": 2,
      "price": 49.99
    }
  ]
}
```

#### Error Responses

- **401 Unauthorized:** User not authenticated
- **400 Bad Request:** Cart is empty or insufficient stock
- **500 Internal Server Error:** Failed to create payment intent

---

### **2. Confirm Payment & Create Order**

Confirm payment and create order after successful Stripe payment.

**Endpoint:** `POST /api/checkout/confirm-payment`  
**Authentication:** Required  
**Content-Type:** `application/json`

#### Request Body

```json
{
  "paymentIntentId": "pi_xxxxxxxxxx",
  "shippingAddressId": "address-uuid", // Optional
  "billingAddressId": "address-uuid" // Optional
}
```

#### Success Response (201 Created)

```json
{
  "success": true,
  "message": "Order created successfully.",
  "order": {
    "id": "order-uuid",
    "userId": "user-uuid",
    "totalPrice": "99.99",
    "status": "PROCESSING",
    "items": [...],
    "createdAt": "2026-01-13T16:00:00.000Z"
  },
  "payment": {
    "id": "payment-uuid",
    "amount": "99.99",
    "currency": "usd",
    "paymentMethod": "STRIPE",
    "paymentStatus": "COMPLETED",
    "stripePaymentIntentId": "pi_xxxxxxxxxx"
  }
}
```

#### Error Responses

- **401 Unauthorized:** User not authenticated
- **400 Bad Request:** Payment not successful or cart items not found
- **500 Internal Server Error:** Failed to confirm payment

---

### **3. Cancel Payment Intent**

Cancel a Stripe PaymentIntent before completion.

**Endpoint:** `POST /api/checkout/cancel-payment`  
**Authentication:** Required  
**Content-Type:** `application/json`

#### Request Body

```json
{
  "paymentIntentId": "pi_xxxxxxxxxx"
}
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Payment intent cancelled.",
  "status": "canceled"
}
```

---

### **4. Get Stripe Config**

Get Stripe publishable key for frontend.

**Endpoint:** `GET /api/checkout/config`  
**Authentication:** Not required

#### Success Response (200 OK)

```json
{
  "publishableKey": "pk_test_xxxxxxxxxx"
}
```

---

### **5. Stripe Webhook Handler**

Handle Stripe webhook events (payment confirmations, failures, refunds).

**Endpoint:** `POST /api/checkout/webhook`  
**Authentication:** Not required (verified via Stripe signature)  
**Content-Type:** `application/json`

#### Handled Events

- `payment_intent.succeeded` - Marks payment as completed
- `payment_intent.payment_failed` - Marks payment as failed
- `charge.refunded` - Marks payment as refunded

#### Success Response (200 OK)

```json
{
  "received": true
}
```

---

## 📦 Order Management API

### **1. Get All Orders**

**Endpoint:** `GET /api/order`  
**Authentication:** Required

#### Success Response (200 OK)

```json
{
  "success": true,
  "orders": [
    {
      "id": "order-uuid",
      "userId": "user-uuid",
      "totalPrice": "99.99",
      "status": "PROCESSING",
      "items": [...],
      "shippingAddress": {...},
      "payment": {...},
      "createdAt": "2026-01-13T16:00:00.000Z"
    }
  ]
}
```

---

### **2. Get Order by ID**

**Endpoint:** `GET /api/order/:id`  
**Authentication:** Required

#### Success Response (200 OK)

```json
{
  "success": true,
  "order": {
    "id": "order-uuid",
    "totalPrice": "99.99",
    "status": "DELIVERED",
    "items": [...],
    "payment": {...}
  }
}
```

---

### **3. Update Order Status**

**Endpoint:** `PUT /api/order/:id/status`  
**Authentication:** Required

#### Request Body

```json
{
  "status": "CANCELLED"
}
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "order": {...}
}
```

**Note:** Regular users can only set status to `CANCELLED`. Admins can set any status.

---

### **4. Get Order Statistics**

**Endpoint:** `GET /api/order/stats`  
**Authentication:** Required

#### Success Response (200 OK)

```json
{
  "success": true,
  "stats": {
    "totalOrders": 10,
    "totalSpent": "999.99",
    "pendingOrders": 2,
    "completedOrders": 7
  }
}
```

---

## 💳 Payment Management API

### **1. Get All Payments**

**Endpoint:** `GET /api/payment`  
**Authentication:** Required

#### Success Response (200 OK)

```json
{
  "success": true,
  "payments": [
    {
      "id": "payment-uuid",
      "amount": "99.99",
      "currency": "usd",
      "paymentMethod": "STRIPE",
      "paymentStatus": "COMPLETED",
      "stripePaymentIntentId": "pi_xxxxxxxxxx",
      "order": {...}
    }
  ]
}
```

---

### **2. Get Payment by ID**

**Endpoint:** `GET /api/payment/:id`  
**Authentication:** Required

---

### **3. Get Payment by Stripe Intent**

**Endpoint:** `GET /api/payment/stripe/:paymentIntentId`  
**Authentication:** Required

---

### **4. Update Payment Status** (Admin Only)

**Endpoint:** `PUT /api/payment/:id`  
**Authentication:** Required (Admin)

#### Request Body

```json
{
  "paymentStatus": "REFUNDED"
}
```

---

## 🔧 Testing with Stripe Test Cards

Use these test card numbers in **Test Mode**:

| Card Number           | Brand | Behavior                            |
| --------------------- | ----- | ----------------------------------- |
| `4242 4242 4242 4242` | Visa  | Success                             |
| `4000 0000 0000 9995` | Visa  | Decline (insufficient funds)        |
| `4000 0000 0000 0002` | Visa  | Decline (generic)                   |
| `4000 0025 0000 3155` | Visa  | Requires authentication (3D Secure) |

**Expiry Date:** Any future date  
**CVC:** Any 3 digits  
**ZIP:** Any 5 digits

---

## 🔐 Security Notes

1. **Never expose `STRIPE_SECRET_KEY` to frontend**
2. **Always verify webhook signatures** (already implemented)
3. **Use HTTPS in production** for webhook endpoints
4. **Validate amounts server-side** (already implemented)
5. **Check stock availability** before payment (already implemented)

---

## 🐛 Troubleshooting

### Webhook not receiving events

- Check webhook endpoint is publicly accessible
- Verify `STRIPE_WEBHOOK_SECRET` is correct
- Check Stripe Dashboard > Webhooks > Logs

### Payment Intent creation fails

- Verify `STRIPE_SECRET_KEY` is set correctly
- Check cart has items
- Verify user is authenticated

### Database sync issues

- Run `npx prisma db push` to sync schema
- Run `npx prisma generate` to regenerate client

---

## 📚 Frontend Integration Example

```javascript
// 1. Create Payment Intent
const response = await fetch("/api/checkout/create-payment-intent", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    shippingAddressId: "address-uuid",
  }),
});

const { clientSecret, paymentIntentId } = await response.json();

// 2. Use Stripe Elements to collect card details
const stripe = await loadStripe(publishableKey);
const elements = stripe.elements({ clientSecret });
const cardElement = elements.create("card");
cardElement.mount("#card-element");

// 3. Confirm payment
const { error } = await stripe.confirmPayment({
  elements,
  confirmParams: {
    return_url: "http://localhost:5173/order-confirmation",
  },
});

// 4. After successful payment, confirm on backend
await fetch("/api/checkout/confirm-payment", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    paymentIntentId,
  }),
});
```

---

## 📊 Database Schema Changes

### User Model

- Added: `stripeCustomerId` (String, unique, optional)

### Payment Model

- Added: `currency` (String, default: "usd")
- Added: `stripePaymentIntentId` (String, unique, optional)
- Added: `stripeRefundId` (String, optional)
- Added: `metadata` (Json, optional)

### PaymentMethod Enum

- Added: `STRIPE`

---

## ✅ Upgrade Checklist

- [x] Installed Stripe package
- [x] Updated Prisma schema
- [x] Created Stripe configuration
- [x] Fixed payment controller
- [x] Fixed order controller
- [x] Created checkout controller
- [x] Created checkout routes
- [x] Updated server routes
- [x] Database schema synced
- [x] Environment variables documented
- [x] API documentation created

---

## 🚀 Next Steps

1. **Add your Stripe API keys** to `.env` file
2. **Test the checkout flow** with test cards
3. **Set up webhook endpoint** in Stripe Dashboard
4. **Implement frontend** using Stripe Elements
5. **Add email notifications** for order confirmations
6. **Implement refund functionality** (optional)

---

For more information, visit:

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe Testing](https://stripe.com/docs/testing)
