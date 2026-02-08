import mongoose, { mongo } from "mongoose";
import dotenv from "dotenv";
import SafetyNode from "../safetyNode.js";
import { fetchStreetLights } from "./fetchLighting.js";
import { generateSafetyNodes } from "./generateSafetyNodes.js";

dotenv.config();

function generateGrid() {
  const points = [];
  for (let lat = 43.258; lat <= 43.266; lat += 0.0005) {
    for (let lng = -79.923; lng <= -79.912; lng += 0.0005) {
      points.push({ lat, lng });
    }
  }
  return points;
}

async function seedDatabase() {

    console.log("Seed script running");

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

console.log("Connected DB:", mongoose.connection.name);
console.log("Connected Collection:", SafetyNode.collection.name);

    await SafetyNode.deleteMany({});

  const lamps = await fetchStreetLights();
    console.log("Lamp count fetched:", lamps.length);
    console.log("Lamp sample:", lamps.slice(0, 3));

  const grid = generateGrid();
  const nodes = generateSafetyNodes(grid, lamps);

  await SafetyNode.insertMany(nodes);

  console.log("Database seeded:", nodes.length);
  process.exit();
}

seedDatabase();