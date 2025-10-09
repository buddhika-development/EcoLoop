
import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Education API is working",
        timestamp: new Date().toISOString()
    });
});

export default router;