import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import SubscriptionPlan from "../models/subscription.model";

// create subscription plan
export const createSubscriptionPlan = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      subscriptionPlanName,
      subscriptionMonthlyPlanPrice,
      subscriptionYearlyPlanPrice,
      subscriptionDetailsList,
    } = req.body;

    if (
      !subscriptionPlanName ||
      subscriptionMonthlyPlanPrice === undefined ||
      subscriptionYearlyPlanPrice === undefined ||
      !Array.isArray(subscriptionDetailsList) ||
      subscriptionDetailsList.length === 0
    ) {
      throw new AppError("All required fields must be provided", 400);
    }

    const subscriptionPlanExist = await SubscriptionPlan.findOne({
      subscriptionPlanName,
    });
    if (subscriptionPlanExist) {
      throw new AppError("This subscription already available", 400);
    }

    const subscriptionPlan = await SubscriptionPlan.create({
      subscriptionPlanName,
      subscriptionMonthlyPlanPrice,
      subscriptionYearlyPlanPrice,
      subscriptionDetailsList,
    });

    return res.status(201).json({
      status: true,
      statusCode: 201,
      message: "Subscription plan created successfully",
      data: subscriptionPlan,
    });
  } catch (error) {
    next(error);
  }
};

// update subscription plan
export const updateSubscriptionPlan = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const subscriptionPlan = await SubscriptionPlan.findById(id);
    if (!subscriptionPlan)
      throw new AppError("Subscription plan not found", 404);

    subscriptionPlan.subscriptionPlanName =
      req.body.subscriptionPlanName ?? subscriptionPlan.subscriptionPlanName;

    subscriptionPlan.subscriptionMonthlyPlanPrice =
      req.body.subscriptionMonthlyPlanPrice ??
      subscriptionPlan.subscriptionMonthlyPlanPrice;

    subscriptionPlan.subscriptionYearlyPlanPrice =
      req.body.subscriptionYearlyPlanPrice ??
      subscriptionPlan.subscriptionYearlyPlanPrice;

    subscriptionPlan.subscriptionDetailsList =
      req.body.subscriptionDetailsList ??
      subscriptionPlan.subscriptionDetailsList;

    await subscriptionPlan.save();

    return res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Subscription plan updated successfully",
      data: subscriptionPlan,
    });
  } catch (error) {
    next(error);
  }
};

// get all subscription plan
export const getAllSubscriptionPlans = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { search, sortByPrice } = req.query;

    const filter: any = {};

    if (search) {
      filter.subscriptionPlanName = {
        $regex: search,
        $options: "i",
      };
    }

    const sort: any = {};

    if (sortByPrice === "monthly-high") {
      sort.subscriptionMonthlyPlanPrice = -1;
    } else if (sortByPrice === "monthly-low") {
      sort.subscriptionMonthlyPlanPrice = 1;
    } else {
      sort.createdAt = -1;
    }

    const [plans, total] = await Promise.all([
      SubscriptionPlan.find(filter).sort(sort).skip(skip).limit(limit),
      SubscriptionPlan.countDocuments(filter),
    ]);

    return res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Subscription plans fetched successfully",
      data: plans,
    });
  } catch (error) {
    next(error);
  }
};

// get single subscription plan
export const getSingleSubscriptionPlan = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const subscriptionPlan = await SubscriptionPlan.findById(id);

    if (!subscriptionPlan)
      throw new AppError("Subscription plan not found", 404);

    return res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Subscription plan fetched successfully",
      data: subscriptionPlan,
    });
  } catch (error) {
    next(error);
  }
};

// delete subscription plan
export const deleteSubscriptionPlan = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const subscriptionPlan = await SubscriptionPlan.findById(id);
    if (!subscriptionPlan)
      throw new AppError("Subscription plan not found", 404);

    await subscriptionPlan.deleteOne();

    return res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Subscription plan deleted successfully",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
