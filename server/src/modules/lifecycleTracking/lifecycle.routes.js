import { Router } from "express";
import * as ctrl from "./lifecycle.controller.js";
import { requireAuth } from "../../middlewares/requireAuth.js";

const r = Router();
r.get("/items", requireAuth, ctrl.myItems);
r.get("/items/:id", requireAuth, ctrl.getItem);
r.post("/items", requireAuth, ctrl.createItem);
r.post("/items/:id/event", requireAuth, ctrl.addEvent);

export default r;
