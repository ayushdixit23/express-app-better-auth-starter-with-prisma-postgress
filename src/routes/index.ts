import { Router } from "express";
import healthRoutes from "./health.routes.js";
import apiRoutes from "./api.routes.js";

const router = Router();

// Mount routes
router.use("/health", healthRoutes);
router.use("/api", apiRoutes);

export default router;

