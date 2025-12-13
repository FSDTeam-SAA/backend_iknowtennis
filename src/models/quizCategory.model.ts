import mongoose from "mongoose";

export interface IQuizCategory extends mongoose.Document {
  quizCategoryName: string;
  quizCount: number;
  quizCategoryImage: string;
  quizCategoryImageId: string;
  quizCategoryState: string;
  quizPoint: number;
  quizCategoryDetails: string;
}

const quizCategorySchema = new mongoose.Schema<IQuizCategory>(
  {
    quizCategoryName: {
      type: String,
      required: true,
      trim: true,
    },
    quizCount: {
      type: Number,
    },
    quizCategoryImage: {
      type: String,
      required: true,
    },
    quizCategoryImageId: {
      type: String,
    },
    quizCategoryState: {
      type: String,
    },
    quizPoint: {
      type: Number,
      required: true,
      default: 0,
    },
    quizCategoryDetails: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const QuizCategory = mongoose.model<IQuizCategory>(
  "QuizCategory",
  quizCategorySchema
);

export default QuizCategory;
