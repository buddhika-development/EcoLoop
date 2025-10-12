import e, { Router } from "express";
import educationRoutes from "../modules/educator/educator.routes.js";
import educationHubRouter from "../modules/educationHub/educationHub.routes.js"
// import donateRoutes from "../modules/donate/donate.routes.js";
// import repairRoutes from "../modules/repair/repair.routes.js";
// import lifecycleRoutes from "../modules/lifecycle/lifecycle.routes.js";

const r = Router();
r.use("/educator", educationRoutes);
r.use('/educationHub', educationHubRouter);
// r.use("/donate", donateRoutes);
// r.use("/repair", repairRoutes);
// r.use("/lifecycle", lifecycleRoutes);

export default r;
