import mongoose, { Schema, Document } from "mongoose";

export interface IQuizAttemptAnswer {
  question: mongoose.Types.ObjectId;
  selectedOption: string;
  correctOption: string;
  isCorrect: boolean;
  point: number;
}

export interface IQuizAttempt extends Document {
  user: mongoose.Types.ObjectId;
  category: mongoose.Types.ObjectId;
  answers: IQuizAttemptAnswer[];
  totalScore: number;
  correctAnswers: number;
  totalQuestions: number;
  timeTakenSeconds?: number;
}

const quizAttemptSchema = new Schema<IQuizAttempt>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    category: {
      type: Schema.Types.ObjectId,
      ref: "QuizCategory",
      required: true,
    },
    answers: [
      {
        question: { type: Schema.Types.ObjectId, ref: "Quiz" },
        selectedOption: String,
        correctOption: String,
        isCorrect: Boolean,
        point: Number,
      },
    ],
    totalScore: Number,
    correctAnswers: Number,
    totalQuestions: Number,
    timeTakenSeconds: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true }
);

export const QuizAttempt = mongoose.model<IQuizAttempt>(
  "QuizAttempt",
  quizAttemptSchema
);
