import { Router } from "express";
import {
  getFeaturedRestaurants,
  getRestaurantAvailability,
  getRestaurants,
  getRestaurantBySlug,
  recommendRestaurants,
} from "../controllers/restaurantController.js";

const restaurantRouter = Router();

restaurantRouter.get("/", getRestaurants);
restaurantRouter.get("/featured", getFeaturedRestaurants);
restaurantRouter.get("/recommend", recommendRestaurants);
restaurantRouter.get("/:id/availability", getRestaurantAvailability);
restaurantRouter.get("/:slug", getRestaurantBySlug);

export default restaurantRouter;
