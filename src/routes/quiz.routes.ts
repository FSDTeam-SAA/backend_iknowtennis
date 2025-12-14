import express from "express";
import {
  createQuiz,
  deleteQuiz,
  getAllQuizzes,
  getQuizzesByCategoryName,
  getSingleQuiz,
  updateQuiz,
} from "../controllers/quiz.controller";

const router = express.Router();

router.route("/").post(createQuiz).get(getAllQuizzes);

router.route("/:id").put(updateQuiz).get(getSingleQuiz).delete(deleteQuiz);

router.route("/:categoryName").get(getQuizzesByCategoryName);

export default router;
