import { NextFunction, Response } from "express";
import mongoose from "mongoose";
import { User } from "../models/user.model";
import { AppError } from "../utils/AppError";
import { AuthenticatedRequest } from "./isLoggedIn";
import { ISubscriptionPlan } from "../models/subscription.model";

export const canAccessQuizCategory = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { categoryId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      throw new AppError("Invalid quiz category id", 400);
    }

    const user = await User.findById(req.user!._id).populate(
      "subscription.plan"
    );

    if (
      !user ||
      !user.subscription ||
      !user.subscription.isActive ||
      !user.subscription.plan
    ) {
      throw new AppError("Active subscription required", 403);
    }

    if (!(user.subscription.plan as ISubscriptionPlan).allowedQuizCategories) {
      throw new AppError("Invalid subscription plan data", 500);
    }

    const plan = user.subscription.plan as ISubscriptionPlan;

    const isAllowed = plan.allowedQuizCategories.some((id) =>
      id.equals(categoryId)
    );

    if (!isAllowed) {
      throw new AppError("This quiz is not included in your plan", 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};
