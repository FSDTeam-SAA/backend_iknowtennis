import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./isLoggedIn";
import { User } from "../models/user.model";
import { AppError } from "../utils/AppError";

export const hasActiveSubscription = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const user = await User.findById(req.user!._id).populate(
    "subscription.plan"
  );

  if (
    !user ||
    !user.subscription ||
    !user.subscription.isActive ||
    !user.subscription.expiresAt ||
    user.subscription.expiresAt < new Date()
  ) {
    return next(new AppError("Active subscription required", 403));
  }

  next();
};
