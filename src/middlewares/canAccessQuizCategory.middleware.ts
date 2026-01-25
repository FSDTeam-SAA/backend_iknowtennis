import { Response, NextFunction } from "express";
import mongoose from "mongoose";
import { AuthenticatedRequest } from "./isLoggedIn";
import { User } from "../models/user.model";
import { AppError } from "../utils/AppError";
import { FREE_QUIZ_CATEGORY_IDS } from "../config";

export const canAccessQuizCategory = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { categoryId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      throw new AppError("Invalid quiz category id", 400);
    }

    const user = await User.findById(req.user!._id).populate(
      "subscription.plan",
    );

    if (!user || !user.subscription || !user.subscription.isActive) {
      throw new AppError("Subscription inactive", 403);
    }

    if (!user.subscription.expiresAt) {
      const allowed = FREE_QUIZ_CATEGORY_IDS.includes(categoryId);

      if (!allowed) {
        throw new AppError(
          "This quiz category is locked. Upgrade to premium.",
          403,
        );
      }

      return next();
    }

    if (user.subscription.expiresAt < new Date()) {
      throw new AppError("Subscription expired", 403);
    }

    // Premium users can access everything
    return next();
  } catch (error) {
    next(error);
  }
};
