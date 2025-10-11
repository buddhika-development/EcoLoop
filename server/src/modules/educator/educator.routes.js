
import { Router } from "express";
import { handleChatBotMessage, handleHealthRequest } from "./educator.controller.js";

const router = Router();

// check health of the router
router.get("/", handleHealthRequest);

// handle the chatbot messages
router.post("/chat", handleChatBotMessage)


export default router;