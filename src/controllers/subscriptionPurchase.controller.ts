import { Request, Response, NextFunction } from "express";
import SubscriptionPlan, {
  ISubscriptionPlan,
} from "../models/subscription.model";
import { AppError } from "../utils/AppError";
import { stripe } from "../config/stripe";
import { AuthenticatedRequest } from "../middlewares/isLoggedIn";
import { User } from "../models/user.model";
import mongoose from "mongoose";

console.log(process.env.CLIENT_URL);

// create checkout session
export const createSubscriptionCheckout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { planId, billingType } = req.body;

    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) throw new AppError("Subscription plan not found", 404);

    const price =
      billingType === "yearly"
        ? plan.subscriptionYearlyPlanPrice
        : plan.subscriptionMonthlyPlanPrice;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: plan.subscriptionPlanName,
            },
            unit_amount: price * 100,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/subscription-cancel`,
    });

    res.status(200).json({
      status: true,
      data: { checkoutUrl: session.url },
    });
  } catch (error) {
    next(error);
  }
};

// activate subscription
export const activateSubscription = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { planId, billingType } = req.body;

    const user = await User.findById(req.user!._id);
    if (!user) throw new AppError("User not found", 404);

    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) throw new AppError("Plan not found", 404);

    const expiresAt =
      billingType === "yearly"
        ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    user.subscription = {
      plan: plan._id as mongoose.Types.ObjectId,
      expiresAt,
      isActive: true,
    };

    await user.save();

    return res.status(200).json({
      status: true,
      message: "Subscription activated successfully",
    });
  } catch (error) {
    next(error);
  }
};
