import Stripe from "stripe";
import { STRIPE_SECRET_KEY } from "../utils/secrets";

if (!STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not defined in environment variables");
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  // apiVersion: "2024-12-18.acacia",
  typescript: true,
});

export default stripe;
