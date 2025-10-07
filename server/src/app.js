import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { CORS_ORIGIN } from "./config/env.js";
import "./config/firebaseAdmin.js";          // init once
import router from "./routes/index.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: CORS_ORIGIN.split(",") }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api", router);

// simple error handler
app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(err.status || 500).json({ ok: false, error: err.message || "Server error" });
});

export default app;
