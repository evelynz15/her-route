import "dotenv/config"; // must be first: loads .env before other modules read process.env
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import connectDB from "./db.js";
import api from "./routes/api.js";

const app = express();
// Only trust X-Forwarded-For when a reverse proxy actually sits in front of the app;
// otherwise clients can spoof it and bypass the rate limiter. Set TRUST_PROXY to the
// number of proxy hops (e.g. 1 behind a single load balancer). Defaults to off.
const trustProxyHops = Number.parseInt(process.env.TRUST_PROXY, 10);
app.set("trust proxy", Number.isInteger(trustProxyHops) && trustProxyHops > 0 ? trustProxyHops : false);

// Only allow browser requests from own frontend(s). Comma-separated list.
// Trailing slashes are stripped: browsers send Origin without one, and cors matches exactly.
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim().replace(/\/+$/, ""))
  .filter(Boolean);
app.use(cors({ origin: allowedOrigins }));
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
