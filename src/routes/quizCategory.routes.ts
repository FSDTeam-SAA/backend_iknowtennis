import express from "express";
import {
  createQuizCategory,
  deleteQuizCategory,
  getAllQuizCategories,
  getSingleQuizCategory,
  updateQuizCategory,
} from "../controllers/quizCategory.controller";
import { uploadSingle } from "../utils/upload";
import { isLoggedIn } from "../middlewares/isLoggedIn";
import { canAccessQuizCategory } from "../middlewares/canAccessQuizCategory.middleware";

const router = express.Router();

router
  .route("/")
  .post(isLoggedIn, uploadSingle("quizCategoryImage"), createQuizCategory)
  .get(getAllQuizCategories);
router
  .route("/:id")
  .put(isLoggedIn, uploadSingle("quizCategoryImage"), updateQuizCategory)
  .get(isLoggedIn, canAccessQuizCategory, getSingleQuizCategory)
  .delete(deleteQuizCategory);

export default router;
