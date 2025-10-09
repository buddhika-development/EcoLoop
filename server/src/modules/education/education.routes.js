
import { Router } from "express";
import { handleHealthRequest } from "./eucation.controller.js";

const router = Router();

// check health of the router
router.get("/", handleHealthRequest);


export default router;