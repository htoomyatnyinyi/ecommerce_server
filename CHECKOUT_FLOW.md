# 🎯 Complete Stripe Checkout Flow Diagram

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         E-COMMERCE CHECKOUT SYSTEM                      │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────┐        ┌──────────────┐        ┌──────────────┐
│   Frontend   │ ◄────► │    Backend   │ ◄────► │    Stripe    │
│  (Client)    │        │   (Server)   │        │     API      │
└──────────────┘        └──────────────┘        └──────────────┘
       │                       │                        │
       │                       ▼                        │
       │              ┌──────────────┐                  │
       │              │   Database   │                  │
       │              │   (MySQL)    │                  │
       │              └──────────────┘                  │
       │                                                │
       └────────────── Webhook Events ─────────────────┘
```

---

## Step-by-Step Checkout Flow

### **Phase 1: Cart Management**

```
User browses products
      │
      ▼
User adds items to cart
      │
      ▼
POST /api/cart
      │
      ▼
Cart stored in database
```

### **Phase 2: Checkout Initiation**

```
User clicks "Checkout"
      │
      ▼
Frontend: POST /api/checkout/create-payment-intent
      │
      ├─ Request Body:
      │  • shippingAddressId
      │  • billingAddressId
      │
      ▼
Backend validates:
      ├─ User authenticated? ✓
      ├─ Cart has items? ✓
      ├─ Stock available? ✓
      │
      ▼
Backend creates/retrieves Stripe Customer
      │
      ▼
Backend creates Stripe PaymentIntent
      │
      ├─ Amount: calculated from cart
      ├─ Customer: stripeCustomerId
      ├─ Metadata: userId, cart item IDs
      │
      ▼
Response sent to frontend:
      ├─ clientSecret
      ├─ paymentIntentId
      ├─ amount
      └─ cartItems
```

### **Phase 3: Payment Processing**

```
Frontend receives clientSecret
      │
      ▼
Initialize Stripe Elements
      │
      ▼
User enters card details
      │
      ▼
Frontend: stripe.confirmPayment()
      │
      ▼
Stripe processes payment
      │
      ├─ Card validated? ✓
      ├─ Funds available? ✓
      ├─ 3D Secure? (if required)
      │
      ▼
Payment successful
```

### **Phase 4: Order Creation**

```
Frontend: POST /api/checkout/confirm-payment
      │
      ├─ Request Body:
      │  • paymentIntentId
      │  • shippingAddressId
      │  • billingAddressId
      │
      ▼
Backend retrieves PaymentIntent from Stripe
      │
      ▼
Backend validates payment status = "succeeded"
      │
      ▼
Backend starts database transaction:
      │
      ├─ 1. Create Order record
      │     ├─ userId
      │     ├─ totalPrice
      │     ├─ status: "PROCESSING"
      │     ├─ shippingAddressId
      │     └─ billingAddressId
      │
      ├─ 2. Create OrderItems
      │     └─ For each cart item:
      │         ├─ productId
      │         ├─ variantId
      │         ├─ quantity
      │         └─ price
      │
      ├─ 3. Create Payment record
      │     ├─ orderId
      │     ├─ amount
      │     ├─ currency
      │     ├─ paymentMethod: "STRIPE"
      │     ├─ paymentStatus: "COMPLETED"
      │     └─ stripePaymentIntentId
      │
      ├─ 4. Update variant stock
      │     └─ Decrement stock for each item
      │
      └─ 5. Clear cart items
            └─ Delete cart items from database
      │
      ▼
Transaction committed ✓
      │
      ▼
Response sent to frontend:
      ├─ success: true
      ├─ order details
      └─ payment details
```

### **Phase 5: Webhook Confirmation** (Async)

```
Stripe sends webhook event
      │
      ▼
POST /api/checkout/webhook
      │
      ├─ Event type: payment_intent.succeeded
      ├─ Signature verified? ✓
      │
      ▼
Backend updates payment status
      │
      ▼
Webhook acknowledged
```

---

## Database Schema Relationships

```
┌─────────────┐
│    User     │
├─────────────┤
│ id          │◄───────────────────┐
│ email       │                    │
│ stripeCustomerId                 │
└─────────────┘                    │
      │                            │
      │ 1:N                        │
      ▼                            │
┌─────────────┐                    │
│    Order    │                    │
├─────────────┤                    │
│ id          │                    │
│ userId      │────────────────────┘
│ totalPrice  │
│ status      │
│ paymentId   │──┐
└─────────────┘  │ 1:1
      │          │
      │ 1:N      ▼
      │    ┌─────────────┐
      │    │   Payment   │
      │    ├─────────────┤
      │    │ id          │
      │    │ orderId     │
      │    │ amount      │
      │    │ stripePaymentIntentId
      │    │ paymentStatus
      │    └─────────────┘
      │
      ▼
┌─────────────┐
│  OrderItem  │
├─────────────┤
│ id          │
│ orderId     │
│ productId   │
│ variantId   │
│ quantity    │
│ price       │
└─────────────┘
      │
      ▼
┌─────────────┐
│   Product   │
│   Variant   │
└─────────────┘
```

---

## API Endpoints Flow

```
CHECKOUT FLOW:
┌────────────────────────────────────────────────────────┐
│ 1. GET /api/checkout/config                            │
│    → Returns: { publishableKey }                       │
└────────────────────────────────────────────────────────┘
              │
              ▼
┌────────────────────────────────────────────────────────┐
│ 2. POST /api/checkout/create-payment-intent            │
│    → Body: { shippingAddressId, billingAddressId }     │
│    → Returns: { clientSecret, paymentIntentId, amount }│
└────────────────────────────────────────────────────────┘
              │
              ▼
       [Stripe Payment UI]
              │
              ▼
┌────────────────────────────────────────────────────────┐
│ 3. POST /api/checkout/confirm-payment                  │
│    → Body: { paymentIntentId, addresses }              │
│    → Returns: { order, payment }                       │
└────────────────────────────────────────────────────────┘

OPTIONAL:
┌────────────────────────────────────────────────────────┐
│ POST /api/checkout/cancel-payment                      │
│    → Body: { paymentIntentId }                         │
└────────────────────────────────────────────────────────┘
```

---

## Error Handling

```
┌─────────────────────┐
│  Request Received   │
└─────────────────────┘
         │
         ▼
   ┌──────────┐
   │ Auth OK? │─── NO ──► 401 Unauthorized
   └──────────┘
         │ YES
         ▼
   ┌──────────┐
   │ Cart OK? │─── NO ──► 400 Cart is empty
   └──────────┘
         │ YES
         ▼
   ┌──────────┐
   │Stock OK? │─── NO ──► 400 Insufficient stock
   └──────────┘
         │ YES
         ▼
   ┌──────────┐
   │Payment?  │─── FAIL ─► 400 Payment failed
   └──────────┘
         │ SUCCESS
         ▼
   ┌──────────┐
   │Order OK? │─── FAIL ─► 500 Order creation failed
   └──────────┘
         │ SUCCESS
         ▼
   ┌──────────┐
   │ Response │
   └──────────┘
```

---

## Security Measures

### **✅ Implemented**

1. **Authentication Required** - All checkout endpoints require valid JWT
2. **Server-side Validation** - Amount calculated on server, not trusted from client
3. **Stock Verification** - Stock checked before payment acceptance
4. **Webhook Signature Verification** - Stripe signatures validated
5. **Database Transactions** - Atomic operations to prevent inconsistencies
6. **User-specific Access** - Users only see their own orders/payments

### **🔒 Production Recommendations**

1. Use HTTPS for all endpoints (especially webhooks)
2. Implement rate limiting on checkout endpoints
3. Add request logging for audit trails
4. Set up monitoring for failed payments
5. Implement email notifications for orders
6. Add fraud detection (Stripe Radar)

---

## Testing Checklist

### **Unit Testing**

- [ ] Test payment intent creation with valid cart
- [ ] Test payment intent creation with empty cart
- [ ] Test payment intent creation with insufficient stock
- [ ] Test order creation after successful payment
- [ ] Test stock decrement after purchase
- [ ] Test cart clearing after checkout

### **Integration Testing**

- [ ] Full checkout flow with test card
- [ ] Test with declined card
- [ ] Test with 3D Secure card
- [ ] Test webhook event handling
- [ ] Test duplicate payment prevention
- [ ] Test concurrent stock updates

### **E2E Testing**

- [ ] Complete purchase flow from cart to order
- [ ] Order appears in user's order history
- [ ] Stock properly decremented
- [ ] Payment recorded correctly
- [ ] Cart cleared after purchase

---

**📘 For complete API documentation, see `STRIPE_INTEGRATION.md`**
