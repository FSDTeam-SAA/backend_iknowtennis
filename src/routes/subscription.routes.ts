import express from "express";
import {
  createSubscriptionPlan,
  deleteSubscriptionPlan,
  getAllSubscriptionPlans,
  getSingleSubscriptionPlan,
  updateSubscriptionPlan,
} from "../controllers/subscription.controller";
import { isLoggedIn } from "../middlewares/isLoggedIn";
import {
  activateSubscription,
  createSubscriptionCheckout,
} from "../controllers/subscriptionPurchase.controller";

const router = express.Router();

router.route("/").post(createSubscriptionPlan).get(getAllSubscriptionPlans);

router
  .route("/:id")
  .put(updateSubscriptionPlan)
  .get(getSingleSubscriptionPlan)
  .delete(deleteSubscriptionPlan);

router.post("/activate", isLoggedIn, activateSubscription);

router.route("/checkout").post(createSubscriptionCheckout);

export default router;
