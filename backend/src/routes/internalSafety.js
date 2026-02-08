import express from "express";
import { scoreRouteSafety } from "../routing/scoreRouteSafety.js";

const router = express.Router();

router.post("/score-route", async (req, res) => {
  try {
    const { coords } = req.body;

    if (!Array.isArray(coords)) {
      return res.status(400).json({ error: "coords must be array" });
    }

    const safetyScore = await scoreRouteSafety(coords);
    res.json({ safetyScore });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;