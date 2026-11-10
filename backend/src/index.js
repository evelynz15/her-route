import "dotenv/config"; // must be first: loads .env before other modules read process.env
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import connectDB from "./db.js";
import api from "./routes/api.js";

const app = express();
// Trust the first proxy hop so req.ip (used by the rate limiter) is the real client IP.
// Increase if there are multiple proxies in front of the app (e.g. CDN + load balancer).
app.set("trust proxy", 1);
app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: "Too many requests, please try again later." },
});

app.use("/api", limiter, api);

connectDB();

app.get("/", (req, res) => {
  res.send("HerRoute backend running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
