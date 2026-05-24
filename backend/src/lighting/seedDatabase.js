import mongoose, { mongo } from "mongoose";
import dotenv from "dotenv";
import SafetyNode from "../models/safetyNode.js";
import {
  fetchStreetLights,
  fetchRestaurants,
  fetchCafes,
  fetchTransitStops,
  fetchConvenienceStores
} from "./fetchLighting.js";
import { generateSafetyNodes } from "./generateSafetyNodes.js";

dotenv.config();

function generateGrid() {
  const points = [];
  for (let lat = 43.464; lat <= 43.480; lat += 0.0005) {
    for (let lng = -80.554; lng <= -80.535; lng += 0.0005) {
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

  await SafetyNode.insertMany(nodes);

  console.log("Database seeded:", nodes.length);
  process.exit();
}

seedDatabase();