import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("HerRoute backend running");
});

const PORT = process.env.PORT || 3000;

import { seedDatabase } from "./lighting/seedDatabase.js";

seedDatabase();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});