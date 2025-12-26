import express from "express";
import {
  createQuiz,
  deleteQuiz,
  getAllQuizzes,
  getQuizzesByCategoryName,
  getSingleQuiz,
  updateQuiz,
} from "../controllers/quiz.controller";
import { isLoggedIn } from "../middlewares/isLoggedIn";
import { canAccessQuizCategory } from "../middlewares/canAccessQuizCategory.middleware";

const router = express.Router();

router.route("/").post(isLoggedIn, createQuiz).get(getAllQuizzes);

router
  .route("/:id")
  .put(isLoggedIn, updateQuiz)
  .get(isLoggedIn, canAccessQuizCategory, getSingleQuiz)
  .delete(isLoggedIn, deleteQuiz);

router
  .route("/:categoryName")
  .get(isLoggedIn, canAccessQuizCategory, getQuizzesByCategoryName);

export default router;
