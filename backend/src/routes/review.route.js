
import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { createReview } from "../controllers/review.controller.js";

const router = Router();

router.post("/", protectRoute, createReview);


export default router;
