import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import rateLimit from "express-rate-limit";
import connectDB from "./db.js";
import internalSafety from "./routes/internalSafety.js";
import api from "./routes/api.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: "Too many requests, please try again later." },
});

app.use("/internal/safety", limiter, internalSafety);
app.use("/api", limiter, api);

connectDB();

app.get("/", (req, res) => {
  res.send("HerRoute backend running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
