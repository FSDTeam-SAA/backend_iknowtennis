import { Router } from "express";
import { isLoggedIn } from "../middlewares/isLoggedIn";
import {
  getLeaderboard,
  getPerformance,
  getQuizResult,
  startQuiz,
  submitQuiz,
} from "../controllers/playQuiz.controller";

const router = Router();

router.use(isLoggedIn);

router.get("/performance", getPerformance);

router.get("/leaderboard", getLeaderboard);

router.get("/result/:attemptId", getQuizResult);

router.post("/submit", submitQuiz);

router.get("/category/:categoryId", startQuiz);

export default router;
