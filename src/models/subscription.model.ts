import mongoose, { Types } from "mongoose";

export interface ISubscriptionPlan extends mongoose.Document {
  subscriptionPlanName: string;
  subscriptionMonthlyPlanPrice: number;
  subscriptionYearlyPlanPrice: number;
  subscriptionDetailsList: string[];
  allowedQuizCategories: Types.ObjectId[];
}

const subscriptionPlanSchema = new mongoose.Schema<ISubscriptionPlan>(
  {
    subscriptionPlanName: {
      type: String,
      required: true,
      trim: true,
    },
    subscriptionMonthlyPlanPrice: {
      type: Number,
      required: true,
    },
    subscriptionYearlyPlanPrice: {
      type: Number,
      required: true,
    },
    subscriptionDetailsList: {
      type: [String],
      required: true,
    },
    allowedQuizCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "QuizCategory",
      },
    ],
  },
  { timestamps: true }
);

const SubscriptionPlan = mongoose.model<ISubscriptionPlan>(
  "SubscriptionPlan",
  subscriptionPlanSchema
);

export default SubscriptionPlan;
