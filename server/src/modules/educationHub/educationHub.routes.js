import { Router } from "express";
import { handleHealthRequest } from "./educationHub.controller.js";

const router = Router();

// check health of the router
router.get("/", handleHealthRequest);


export default router;