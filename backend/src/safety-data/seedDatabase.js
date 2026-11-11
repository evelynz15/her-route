import "dotenv/config"; // must be first: loads .env before other modules read process.env
import mongoose from "mongoose";
import SafetyNode from "../models/safetyNode.js";
import {
  fetchStreetLights,
  fetchRestaurants,
  fetchCafes,
  fetchTransitStops,
  fetchConvenienceStores
} from "./overpass.js";
import { generateSafetyNodes } from "./generateSafetyNodes.js";
import { SERVICE_AREA } from "../config/areas.js";

const GRID_STEP_DEG = 0.0005; // ~55m north-south, ~40m east-west at this latitude

function generateGrid() {
  const { south, west, north, east } = SERVICE_AREA;
  const points = [];
  for (let lat = south; lat <= north; lat += GRID_STEP_DEG) {
    for (let lng = west; lng <= east; lng += GRID_STEP_DEG) {
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

  const lamps = await fetchStreetLights();
  console.log("Street lamps:", lamps.length);

  const restaurants = await fetchRestaurants();
  console.log("Restaurants:", restaurants.length);

  const cafes = await fetchCafes();
  console.log("Cafes:", cafes.length);

  const transitStops = await fetchTransitStops();
  console.log("Transit stops:", transitStops.length);

  const convenienceStores = await fetchConvenienceStores();
  console.log("Convenience stores:", convenienceStores.length);

  const grid = generateGrid();
  const nodes = generateSafetyNodes(grid, {
    lamps,
    restaurants,
    cafes,
    transitStops,
    convenienceStores
  });

  // Replace old data only once the new nodes are ready, so a failed fetch or
  // generation step leaves the existing collection intact.
  await SafetyNode.deleteMany({});
  await SafetyNode.insertMany(nodes);

  console.log("Database seeded:", nodes.length);
  process.exit();
}

seedDatabase();