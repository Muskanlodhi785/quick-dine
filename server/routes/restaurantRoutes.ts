// import {Router} from 'express'
// import { getFeaturedRestaurants,getRestaurantAvailability,getRestaurants,getRestaurantBySlug } from '../controllers/restaurantController.js'

// const restaurantrouter = Router()

// restaurantrouter.get('/', getRestaurants)
// restaurantrouter.get('/:id', getFeaturedRestaurants)
// restaurantrouter.get('/:slug', getRestaurantBySlug)
// restaurantrouter.get('/:id/availability', getRestaurantAvailability)

// export default restaurantrouter

import { Router } from "express";
import {
  getFeaturedRestaurants,
  getRestaurantAvailability,
  getRestaurants,
  getRestaurantBySlug,
} from "../controllers/restaurantController.js";

const restaurantrouter = Router();

restaurantrouter.get("/", getRestaurants);
restaurantrouter.get("/featured", getFeaturedRestaurants);
restaurantrouter.get("/:id/availability", getRestaurantAvailability);
restaurantrouter.get("/:slug", getRestaurantBySlug);

export default restaurantrouter;