import { Router } from "express";
import { isLoggedIn } from "../middlewares/isLoggedIn";
import {
  getAdminDashboardOverview,
  getAllUsersInfo,
  getRankingBoard,
} from "../controllers/dashboard.controller";
import { isAdmin } from "../middlewares/isAdmin";

const router = Router();

router.route("/overview").get(isLoggedIn, isAdmin, getAdminDashboardOverview);

router.route("/user-list").get(isLoggedIn, isAdmin, getAllUsersInfo);

router.route("/ranking").get(isLoggedIn, isAdmin, getRankingBoard);

export default router;
