import Stripe from "stripe";
import { stripeSecretKey } from ".";

export const stripe = new Stripe(stripeSecretKey!, {
  apiVersion: "2025-12-15.clover",
});
