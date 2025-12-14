import express from "express";
import {
  createSubscriptionPlan,
  deleteSubscriptionPlan,
  getAllSubscriptionPlans,
  getSingleSubscriptionPlan,
  updateSubscriptionPlan,
} from "../controllers/subscription.controller";

const router = express.Router();

router.route("/").post(createSubscriptionPlan).get(getAllSubscriptionPlans);

router
  .route("/:id")
  .put(updateSubscriptionPlan)
  .get(getSingleSubscriptionPlan)
  .delete(deleteSubscriptionPlan);

export default router;
