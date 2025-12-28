import { Router } from "express";
import {
  getAttemptSummary,
  getUserCategoryStats,
  getUserOverviewStats,
  getUserRecentAttempts,
} from "../controllers/quizStats.controller";
import { isLoggedIn } from "../middlewares/isLoggedIn";

const router = Router();

router.route("/overview").get(isLoggedIn, getUserOverviewStats);

router.route("/by-category").get(isLoggedIn, getUserCategoryStats);

router.route("/recent").get(isLoggedIn, getUserRecentAttempts);

router.route("/attempt/:attemptId").get(isLoggedIn, getAttemptSummary);

export default router;
