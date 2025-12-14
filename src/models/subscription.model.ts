import mongoose from "mongoose";

export interface ISubscriptionPlan extends mongoose.Document {
  subscriptionPlanName: string;
  subscriptionMonthlyPlanPrice: number;
  subscriptionYearlyPlanPrice: number;
  subscriptionDetailsList: string[];
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
  },
  { timestamps: true }
);

const SubscriptionPlan = mongoose.model<ISubscriptionPlan>(
  "SubscriptionPlan",
  subscriptionPlanSchema
);

export default SubscriptionPlan;
