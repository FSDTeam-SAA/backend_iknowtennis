import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { AppError } from "../utils/AppError";
import { User, IUser } from "../models/user.model";
import Quiz from "../models/quiz.model";
import { QuizAttempt } from "../models/quizAttempt.model";
import SubscriptionPlan from "../models/subscription.model";
import { AuthenticatedRequest } from "../middlewares/isLoggedIn";

const buildWeekdayArray = (rows: { _id: number; count: number }[]) => {
  const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const counts = Array(7).fill(0);

  for (const r of rows) {
    const idx = r._id - 1;
    if (idx >= 0 && idx < 7) counts[idx] = r.count;
  }

  return labels.map((label, i) => ({ label, count: counts[i] }));
};

const buildMonthArray = (rows: { _id: number; count: number }[]) => {
  const labels = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const counts = Array(12).fill(0);

  for (const r of rows) {
    const idx = r._id - 1;
    if (idx >= 0 && idx < 12) counts[idx] = r.count;
  }

  return labels.map((label, i) => ({ label, count: counts[i] }));
};

const safePercent = (a: number, b: number) =>
  b ? Math.round((a / b) * 100) : 0;

// get full dashboard overview
export const getAdminDashboardOverview = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) throw new AppError("Access Denied, Please login", 401);

    const now = new Date();

    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const yearStart = new Date(now.getFullYear(), 0, 1);
    const yearEnd = new Date(now.getFullYear() + 1, 0, 1);

    const totalUsersPromise = User.countDocuments();

    const totalQuizzesPromise = Quiz.countDocuments();

    const activeSubscriptionsPromise = User.countDocuments({
      "subscription.isActive": true,
      "subscription.expiresAt": { $gt: now },
    });

    const revenueEstimatePromise = User.aggregate([
      {
        $match: {
          "subscription.isActive": true,
          "subscription.expiresAt": { $gt: now },
          "subscription.plan": { $ne: null },
        },
      },
      {
        $group: {
          _id: "$subscription.plan",
          usersCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "subscriptionplans",
          localField: "_id",
          foreignField: "_id",
          as: "plan",
        },
      },
      { $unwind: { path: "$plan", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          usersCount: 1,
          monthlyPrice: { $ifNull: ["$plan.subscriptionMonthlyPlanPrice", 0] },
          revenue: {
            $multiply: [
              "$usersCount",
              { $ifNull: ["$plan.subscriptionMonthlyPlanPrice", 0] },
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenueEstimate: { $sum: "$revenue" },
        },
      },
    ]);

    const premiumUsersCountPromise = User.countDocuments({
      "subscription.isActive": true,
      "subscription.expiresAt": { $gt: now },
    });

    const freeUsersCountPromise = User.countDocuments({
      $or: [
        { "subscription.isActive": { $ne: true } },
        { "subscription.expiresAt": { $exists: false } },
        { "subscription.expiresAt": { $lte: now } },
      ],
    });

    const playedBySegmentPromise = QuizAttempt.aggregate([
      { $group: { _id: "$user" } },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $addFields: {
          isPremium: {
            $and: [
              { $eq: ["$user.subscription.isActive", true] },
              { $gt: ["$user.subscription.expiresAt", now] },
            ],
          },
        },
      },
      {
        $group: {
          _id: "$isPremium",
          usersPlayed: { $sum: 1 },
        },
      },
    ]);

    const quizAttendancePromise = QuizAttempt.aggregate([
      { $match: { createdAt: { $gte: last7Days, $lte: now } } },
      { $project: { dow: { $dayOfWeek: "$createdAt" } } },
      { $group: { _id: "$dow", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const userJoiningPromise = User.aggregate([
      { $match: { createdAt: { $gte: yearStart, $lt: yearEnd } } },
      { $project: { month: { $month: "$createdAt" } } },
      { $group: { _id: "$month", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const [
      totalUsers,
      totalQuizzes,
      activeSubscriptions,
      revenueAgg,
      premiumUsersCount,
      freeUsersCount,
      playedBySegment,
      attendanceRows,
      joiningRows,
    ] = await Promise.all([
      totalUsersPromise,
      totalQuizzesPromise,
      activeSubscriptionsPromise,
      revenueEstimatePromise,
      premiumUsersCountPromise,
      freeUsersCountPromise,
      playedBySegmentPromise,
      quizAttendancePromise,
      userJoiningPromise,
    ]);

    const revenueEstimateMonthly =
      revenueAgg?.[0]?.totalRevenueEstimate !== undefined
        ? Number(revenueAgg[0].totalRevenueEstimate)
        : 0;

    const premiumPlayed =
      playedBySegment.find((x: any) => x._id === true)?.usersPlayed || 0;
    const freePlayed =
      playedBySegment.find((x: any) => x._id === false)?.usersPlayed || 0;

    const premiumCompletionPercent = safePercent(
      premiumPlayed,
      premiumUsersCount || 0
    );
    const freeCompletionPercent = safePercent(freePlayed, freeUsersCount || 0);

    return res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Admin dashboard overview fetched successfully",
      data: {
        cards: {
          totalUsers,
          totalQuizzes,
          activeSubscriptions,
          totalRevenueEstimateMonthly: revenueEstimateMonthly,
        },

        quizAttendance: {
          range: "last_7_days",
          byWeekday: buildWeekdayArray(attendanceRows as any),
        },

        surveySubscription: {
          freeUsers: freeUsersCount,
          premiumUsers: premiumUsersCount,
          completion: {
            freeCompletedPercent: freeCompletionPercent,
            premiumCompletedPercent: premiumCompletionPercent,
          },
        },

        userJoiningOverview: {
          year: now.getFullYear(),
          byMonth: buildMonthArray(joiningRows as any),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// get all users info
export const getAllUsersInfo = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) throw new AppError("Access Denied, Please login", 401);

    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
    const skip = (page - 1) * limit;

    const search = String(req.query.search || "").trim();
    const plan = String(req.query.plan || "all").toLowerCase();
    const status = String(req.query.status || "all").toLowerCase();
    const sortBy = String(req.query.sortBy || "joined").toLowerCase();
    const sortOrder = String(req.query.sortOrder || "desc").toLowerCase();

    const now = new Date();

    const filter: any = {};

    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    if (plan === "premium") {
      filter["subscription.isActive"] = true;
      filter["subscription.expiresAt"] = { $gt: now };
      filter["subscription.plan"] = { $ne: null };
    }
    if (plan === "free") {
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          { "subscription.isActive": { $ne: true } },
          { "subscription.expiresAt": { $exists: false } },
          { "subscription.expiresAt": { $lte: now } },
          { "subscription.plan": { $exists: false } },
          { "subscription.plan": null },
        ],
      });
    }

    if (status === "active") {
      filter["subscription.isActive"] = true;
      filter["subscription.expiresAt"] = { $gt: now };
    }
    if (status === "inactive") {
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          { "subscription.isActive": { $ne: true } },
          { "subscription.expiresAt": { $exists: false } },
          { "subscription.expiresAt": { $lte: now } },
        ],
      });
    }

    const sort: any = {};
    const dir = sortOrder === "asc" ? 1 : -1;
    if (sortBy === "name") sort.fullName = dir;
    else sort.createdAt = dir;

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("fullName email avatar phone role subscription createdAt")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    const planIds = users
      .map((u: any) => u?.subscription?.plan)
      .filter(Boolean)
      .map((id: any) => String(id));

    const uniquePlanIds = Array.from(new Set(planIds));

    const plans = uniquePlanIds.length
      ? await SubscriptionPlan.find({ _id: { $in: uniquePlanIds } })
          .select(
            "subscriptionPlanName subscriptionMonthlyPlanPrice subscriptionYearlyPlanPrice"
          )
          .lean()
      : [];

    const planMap = new Map(plans.map((p: any) => [String(p._id), p]));

    const rows = users.map((u: any) => {
      const isActive =
        Boolean(u?.subscription?.isActive) &&
        u?.subscription?.expiresAt &&
        new Date(u.subscription.expiresAt) > now;

      const planDoc = u?.subscription?.plan
        ? planMap.get(String(u.subscription.plan))
        : null;

      const payable =
        isActive && planDoc
          ? Number(planDoc.subscriptionMonthlyPlanPrice || 0)
          : 0;

      const planName =
        isActive && planDoc ? planDoc.subscriptionPlanName : "Free";

      return {
        userId: u._id,
        fullName: u.fullName,
        email: u.email,
        avatar: u.avatar || null,
        joinedDate: u.createdAt,
        payable,
        planName,
        status: isActive ? "Active" : "Inactive",
      };
    });

    return res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Users fetched successfully",
      data: rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        showingFrom: total === 0 ? 0 : skip + 1,
        showingTo: Math.min(skip + limit, total),
      },
    });
  } catch (error) {
    next(error);
  }
};

//  get full leaderboard ranking
export const getRankingBoard = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) throw new AppError("Access Denied, Please login", 401);

    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
    const skip = (page - 1) * limit;

    const { categoryId, startDate, endDate } = req.query as {
      categoryId?: string;
      startDate?: string;
      endDate?: string;
    };

    const match: any = {};

    if (categoryId) {
      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        throw new AppError("Invalid categoryId", 400);
      }
      match.category = new mongoose.Types.ObjectId(categoryId);
    }

    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) {
        const s = new Date(startDate);
        if (isNaN(s.getTime())) throw new AppError("Invalid startDate", 400);
        match.createdAt.$gte = s;
      }
      if (endDate) {
        const e = new Date(endDate);
        if (isNaN(e.getTime())) throw new AppError("Invalid endDate", 400);
        e.setHours(23, 59, 59, 999);
        match.createdAt.$lte = e;
      }
    }

    const pipeline: any[] = [
      { $match: match },
      {
        $group: {
          _id: "$user",
          mark: { $sum: { $ifNull: ["$totalScore", 0] } },
        },
      },
      { $sort: { mark: -1 } },
      {
        $facet: {
          total: [{ $count: "count" }],
          rows: [
            { $skip: skip },
            { $limit: limit },
            {
              $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "user",
              },
            },
            { $unwind: "$user" },
            {
              $project: {
                userId: "$_id",
                mark: 1,
                fullName: "$user.fullName",
                email: "$user.email",
                avatar: "$user.avatar",
              },
            },
          ],
        },
      },
    ];

    const result = await QuizAttempt.aggregate(pipeline);

    const total = result?.[0]?.total?.[0]?.count || 0;
    const rows = result?.[0]?.rows || [];

    const ranking = rows.map((r: any, index: number) => ({
      position: skip + index + 1,
      userId: r.userId,
      fullName: r.fullName || null,
      email: r.email || null,
      avatar: r.avatar || null,
      mark: r.mark || 0,
    }));

    return res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Ranking board fetched successfully",
      data: {
        ranking,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          showingFrom: total === 0 ? 0 : skip + 1,
          showingTo: Math.min(skip + limit, total),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
