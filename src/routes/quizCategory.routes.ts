import express from "express";
import {
  createQuizCategory,
  deleteQuizCategory,
  getAllQuizCategories,
  getSingleQuizCategory,
  updateQuizCategory,
} from "../controllers/quizCategory.controller";
import { uploadSingle } from "../utils/upload";

const router = express.Router();

router
  .route("/")
  .post(uploadSingle("quizCategoryImage"), createQuizCategory)
  .get(getAllQuizCategories);
router
  .route("/:id")
  .put(uploadSingle("quizCategoryImage"), updateQuizCategory)
  .get(getSingleQuizCategory)
  .delete(deleteQuizCategory);

export default router;
