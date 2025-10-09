import { Router } from "express";
import lifecycleRoutes from "../modules/lifecycleTracking/lifecycle.routes.js";

const r = Router();
// r.use("/education", educationRoutes);
// r.use("/donate", donateRoutes);
// r.use("/repair", repairRoutes);
r.use("/lifecycle", lifecycleRoutes);

export default r;
