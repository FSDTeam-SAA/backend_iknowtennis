import SubscriptionPlan from "../models/subscription.model";
import { freePlanId } from "../config";

export const getAllowedCategoryIdsForUser = async (user: any) => {
  const now = new Date();
  const planId =
    user?.subscription?.isActive &&
    user?.subscription?.plan &&
    (!user?.subscription?.expiresAt || user.subscription.expiresAt > now)
      ? user.subscription.plan
      : freePlanId;

  const plan = await SubscriptionPlan.findById(planId)
    .select("allowedQuizCategories")
    .lean();

  return (plan?.allowedQuizCategories || []).map((x: any) => String(x));
};
