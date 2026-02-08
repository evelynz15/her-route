import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./db.js";
import { scoreRouteSafety } from "./routing/scoreRouteSafety.js";
import internalSafety from "./routes/internalSafety.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/internal/safety", internalSafety);

connectDB();

app.get("/", (req, res) => {
  res.send("HerRoute backend running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
